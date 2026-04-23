import { httpClient, HttpMethod } from '@activepieces/pieces-common';

import { BASE_URL } from './base-url';
import { getAuthHeaders, resolveCall } from '../auth';

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
 * NOTE: the panel-facing `POST /{id}/files/Upload` on api.simplyprint.io is
 * reserved for browser panel sessions and the mobile app; integrations
 * cannot use it.
 */

export interface UploadUserFileInput {
    auth: unknown;
    file: { filename: string; data: Buffer | Uint8Array };
}

export interface UploadUserFileResult {
    /** Hex bucket hash (64 chars) returned by files.simplyprint.io. */
    fileId: string;
    /** Server-side file name echoed back in the response. */
    name?: string;
    /** File size in bytes. */
    size?: number;
    /** ISO timestamp when the file will expire (24h by default). */
    expiresAt?: string;
    raw: unknown;
}

function extractFilesApiId(body: unknown): {
    id: string;
    name?: string;
    size?: number;
    expiresAt?: string;
} | null {
    if (!body || typeof body !== 'object') return null;
    const env = body as Record<string, unknown>;

    const file = env['file'] as Record<string, unknown> | undefined;
    if (file && typeof file === 'object') {
        const id = file['id'];
        if (typeof id === 'string' && id.length > 0) {
            return {
                id,
                name: typeof file['name'] === 'string' ? (file['name'] as string) : undefined,
                size: typeof file['size'] === 'number' ? (file['size'] as number) : undefined,
                expiresAt:
                    typeof file['expires_at'] === 'string' ? (file['expires_at'] as string) : undefined,
            };
        }
    }

    for (const key of ['file_id', 'fileId', 'id'] as const) {
        const v = env[key];
        if (typeof v === 'string' && v.length > 0) return { id: v };
    }
    return null;
}

export async function uploadUserFile(input: UploadUserFileInput): Promise<UploadUserFileResult> {
    if (!input.file) throw new Error('No file provided.');

    const { companyId } = await resolveCall(input.auth);
    const headers = getAuthHeaders(input.auth);

    const form = new FormData();
    form.append('file', new Blob([input.file.data]), input.file.filename);

    const res = await httpClient.sendRequest({
        method: HttpMethod.POST,
        url: `${BASE_URL.files}/${companyId}/files/Upload`,
        headers,
        body: form,
    });

    const parsed = extractFilesApiId(res.body);
    if (parsed === null) {
        throw new Error(
            `SimplyPrint upload returned no file id (HTTP ${res.status}): ${JSON.stringify(res.body).slice(0, 500)}`,
        );
    }

    return {
        fileId: parsed.id,
        name: parsed.name,
        size: parsed.size,
        expiresAt: parsed.expiresAt,
        raw: res.body,
    };
}
