import { randomBytes, timingSafeEqual } from 'crypto';

/**
 * Per-webhook secret used to verify incoming payloads.
 * Kept at 32 bytes / 64 hex chars — high entropy and fits the `secret` field
 * validator (`string|max:128`) in the webhook create endpoint.
 */
export function generateWebhookSecret(): string {
    return randomBytes(32).toString('hex');
}

/**
 * Verify an incoming webhook payload against the per-webhook secret.
 *
 * Per the SimplyPrint webhook docs: when a webhook has a `secret` configured,
 * the same value is sent verbatim in the `X-SP-Secret` header on every delivery.
 * A correct verification is a constant-time string comparison against the stored
 * secret. (No HMAC of the body — the header is the shared secret itself.)
 */
export function verifySimplyprintSignature(
    header: string | undefined,
    secret: string | undefined,
): boolean {
    if (!secret || !header) return false;
    if (header.length !== secret.length) return false;

    try {
        return timingSafeEqual(Buffer.from(secret, 'utf8'), Buffer.from(header, 'utf8'));
    } catch {
        return false;
    }
}

/**
 * Normalise an incoming webhook payload's secret header — AP passes headers
 * lowercased but some proxies forward them in original case.
 */
export function extractSecretHeader(headers: Record<string, string | undefined>): string | undefined {
    return headers['x-sp-secret'] ?? headers['X-SP-Secret'] ?? headers['X-Sp-Secret'];
}
