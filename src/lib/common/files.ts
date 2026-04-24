import { BASE_URL } from './base-url';
import { getAuthHeaders, resolveCall } from '../auth';
import {
    driveChunkedUpload,
    driveStreamedUpload,
    extractFilesApiId,
    UploadPart,
    UploadPartResponse,
    UploadUserFileResult,
} from './chunked-upload';

export type { UploadUserFileResult } from './chunked-upload';

/**
 * Upload a file to SimplyPrint's API files service (files.simplyprint.io).
 *
 * This endpoint is the correct integration path for API-key and OAuth
 * callers. It returns a string file id (hex bucket hash) usable as:
 *   queue/AddItem             body field: fileId
 *   printers/actions/CreateJob body field: file_id
 *
 * Requires the Print Farm plan on the calling account.
 *
 * Two entry points:
 *   uploadUserFile        — takes a materialized Buffer/Uint8Array (the
 *                           path AP's Property.File gives us). Slices
 *                           zero-copy into 95 MiB chunks.
 *   uploadUserFileFromUrl — takes an HTTPS URL, streams the bytes through
 *                           with ~2-chunk peak RAM. Needed whenever the
 *                           source is bigger than you want to buffer.
 *
 * Both share the same `totalSize` + `continueToken` state machine from
 * chunked-upload.ts. Files under 95 MiB go single-shot.
 *
 * NOTE: the panel-facing `POST /{id}/files/Upload` on api.simplyprint.io is
 * reserved for browser panel sessions and the mobile app; integrations
 * cannot use it.
 */

export interface UploadUserFileInput {
    auth: unknown;
    file: { filename: string; data: Buffer | Uint8Array };
}

export interface UploadUserFileFromUrlInput {
    auth: unknown;
    url: string;
    filename: string;
}

function buildSendPart(url: string, headers: Record<string, string>) {
    // NB: we use Node's native fetch, NOT AP's axios-based
    // `httpClient.sendRequest`. The pieces-common httpClient does not
    // serialize Web-standard FormData / Blob bodies correctly (it passes
    // them to axios which then JSON-stringifies to `{}`), so the previous
    // implementation produced empty multipart requests that SimplyPrint
    // rightly rejected with "Validation failed … The File is required".
    // Native fetch sets the correct Content-Type boundary and streams the
    // body without copying.
    return async (part: UploadPart): Promise<UploadPartResponse> => {
        const form = new FormData();
        // TS 5.7+ types Uint8Array as Uint8Array<ArrayBufferLike> (union with
        // SharedArrayBuffer), while the Web Blob constructor's BlobPart
        // only accepts ArrayBuffer-backed views. Our chunks are always
        // ArrayBuffer-backed (either a subarray of an input Buffer/
        // Uint8Array or a freshly-allocated Uint8Array in the streaming
        // driver), so this cast is safe at runtime.
        const blobPart = part.chunk as Uint8Array<ArrayBuffer>;
        form.append('file', new Blob([blobPart]), part.filename);
        if (part.kind === 'first') {
            form.append('totalSize', String(part.totalSize));
        } else if (part.kind === 'continue') {
            form.append('continueToken', part.continueToken);
        }

        const res = await fetch(url, { method: 'POST', headers, body: form });
        const text = await res.text();
        let body: Record<string, unknown>;
        try {
            body = text.length > 0 ? (JSON.parse(text) as Record<string, unknown>) : {};
        } catch {
            throw new Error(
                `SimplyPrint upload returned non-JSON (HTTP ${res.status}): ${text.slice(0, 500)}`,
            );
        }

        if (!res.ok) {
            throw new Error(
                `SimplyPrint upload failed (HTTP ${res.status}): ${JSON.stringify(body).slice(0, 500)}`,
            );
        }

        const continueToken = body['continueToken'];
        if (typeof continueToken === 'string' && continueToken.length > 0) {
            return { kind: 'continue', continueToken };
        }

        const parsed = extractFilesApiId(body);
        if (parsed === null) {
            throw new Error(
                `SimplyPrint upload returned no file id and no continueToken (HTTP ${res.status}): ${JSON.stringify(body).slice(0, 500)}`,
            );
        }
        return { kind: 'final', file: parsed, raw: body };
    };
}

export async function uploadUserFile(input: UploadUserFileInput): Promise<UploadUserFileResult> {
    if (!input.file) throw new Error('No file provided.');

    const { companyId } = await resolveCall(input.auth);
    const headers = getAuthHeaders(input.auth);
    const url = `${BASE_URL.files}/${companyId}/files/Upload`;

    return driveChunkedUpload({
        filename: input.file.filename,
        data: input.file.data,
        sendPart: buildSendPart(url, headers),
    });
}

/**
 * Upload a file to SimplyPrint by streaming it from an HTTPS URL. Peak
 * memory is ~2 * 95 MiB regardless of the source file size.
 *
 * Requires the URL to return a `Content-Length` header on the GET response
 * — SimplyPrint's chunked protocol needs `totalSize` declared upfront on
 * the first part. If Content-Length is missing we throw a clear error
 * rather than silently buffering the whole response.
 */
export async function uploadUserFileFromUrl(
    input: UploadUserFileFromUrlInput,
): Promise<UploadUserFileResult> {
    if (!input.url) throw new Error('No URL provided.');
    if (!input.filename) throw new Error('No filename provided.');

    const fetchRes = await fetch(input.url);
    if (!fetchRes.ok) {
        const peek = await fetchRes.text().catch(() => '<no body>');
        throw new Error(
            `Could not fetch file URL (HTTP ${fetchRes.status} ${fetchRes.statusText}): ${peek.slice(0, 300)}`,
        );
    }

    const contentLengthHeader = fetchRes.headers.get('content-length');
    if (!contentLengthHeader) {
        throw new Error(
            `File URL did not return a Content-Length header — SimplyPrint's chunked upload needs the total size upfront. Use a host that sends Content-Length (S3 pre-signed URLs, Dropbox raw links, etc.), or use the "File" input instead (buffered).`,
        );
    }
    const totalSize = parseInt(contentLengthHeader, 10);
    if (!Number.isFinite(totalSize) || totalSize <= 0) {
        throw new Error(`Invalid Content-Length "${contentLengthHeader}" — expected a positive integer.`);
    }

    if (!fetchRes.body) {
        throw new Error('Fetch returned no body stream — cannot stream upload.');
    }

    const { companyId } = await resolveCall(input.auth);
    const headers = getAuthHeaders(input.auth);
    const url = `${BASE_URL.files}/${companyId}/files/Upload`;

    return driveStreamedUpload({
        filename: input.filename,
        totalSize,
        source: fetchRes.body as unknown as AsyncIterable<Uint8Array>,
        sendPart: buildSendPart(url, headers),
    });
}

/**
 * Derive a filename from the last path segment of a URL if it has an
 * extension. Returns `null` for signed URLs / opaque endpoints where the
 * path isn't a meaningful filename (caller should then require the user to
 * supply one explicitly).
 */
export function filenameFromUrl(rawUrl: string): string | null {
    try {
        const u = new URL(rawUrl);
        const last = u.pathname.split('/').filter((s) => s.length > 0).pop();
        if (last && last.includes('.')) {
            return decodeURIComponent(last);
        }
    } catch {
        // fall through
    }
    return null;
}
