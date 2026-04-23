import { PieceAuth, Property, OAuth2PropertyValue } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

import { BASE_URL } from './common/base-url';

// ---------------------------------------------------------------------------
// OAuth2 auth (recommended — for Activepieces Cloud and any self-hoster who
// has created a SimplyPrint OAuth app with their AP instance's /redirect URI
// whitelisted).
// ---------------------------------------------------------------------------

const oauth2Description = `
## Connect your SimplyPrint account (OAuth2)

1. Click **Connect** below. You'll be redirected to SimplyPrint.
2. Sign in (or register) and pick the account you want to connect.
3. Review the requested permissions and approve.

Activepieces will receive an OAuth access token and refresh it automatically. You can revoke access at any time from **SimplyPrint → Panel → Settings → Connected apps**.

> **Self-hosting?** Your Activepieces redirect URI (\`https://<your-instance>/redirect\`) must be whitelisted on the SimplyPrint OAuth app. If you can't do that, use the **API Key** option on the previous screen instead.
`;

export const simplyprintOAuth2Auth = PieceAuth.OAuth2({
    required: true,
    description: oauth2Description,
    authUrl: `${BASE_URL.panel}/oauth/authorize`,
    tokenUrl: `${BASE_URL.panel}/oauth/token`,
    scope: [
        'user.read',
        'printers.read',
        'printers.write',
        'printers.actions',
        'queue.read',
        'queue.write',
        'files.read',
        'files.write',
        'files.temp_upload',
        'spools.read',
        'spools.write',
        'print_history.read',
        'statistics.read',
        'custom_fields.read',
        'custom_fields.write',
        'tags.read',
        'webhooks.read',
        'webhooks.write',
    ],
});

// ---------------------------------------------------------------------------
// API-key auth (fallback — no OAuth redirect dance. Works for anyone who can
// generate an API key in SimplyPrint, including self-hosters running
// Activepieces on their own network.)
// ---------------------------------------------------------------------------

const apiKeyDescription = `
## Connect your SimplyPrint account (API Key)

1. In SimplyPrint, open **Panel → Settings → API Keys → Generate Key**.
2. Copy the generated key into **API Key** below.
3. In **Company ID**, enter the numeric ID of the SimplyPrint organisation you want this connection to operate on. You can see it in the URL of your panel (\`https://simplyprint.io/panel/<id>/...\`).

API keys have the same permissions as your user account. Keep them secret — anyone with the key can act as you.
`;

export const simplyprintApiKeyAuth = PieceAuth.CustomAuth({
    required: true,
    description: apiKeyDescription,
    props: {
        apiKey: PieceAuth.SecretText({
            displayName: 'API Key',
            description: 'The API key you generated in SimplyPrint.',
            required: true,
        }),
        companyId: Property.Number({
            displayName: 'Company ID',
            description: 'Numeric ID of the SimplyPrint organisation this connection targets.',
            required: true,
        }),
    },
    validate: async ({ auth }) => {
        try {
            const res = await httpClient.sendRequest<{ status: boolean; user?: unknown }>({
                method: HttpMethod.GET,
                url: `${BASE_URL.api}/0/account/GetUser`,
                headers: { 'X-API-Key': String(auth.apiKey) },
            });
            if (!res.body?.status) {
                return { valid: false, error: 'SimplyPrint rejected the API key.' };
            }
            return { valid: true };
        } catch (e) {
            return { valid: false, error: `Could not reach SimplyPrint: ${(e as Error).message}` };
        }
    },
});

// ---------------------------------------------------------------------------
// Multi-auth export. Activepieces displays both options in the connection picker.
// ---------------------------------------------------------------------------

export const simplyprintAuth = [simplyprintOAuth2Auth, simplyprintApiKeyAuth];

// ---------------------------------------------------------------------------
// Auth helpers — actions / triggers use these instead of destructuring `auth`
// directly so both auth shapes Just Work.
// ---------------------------------------------------------------------------

export type SimplyprintAuthValue =
    | OAuth2PropertyValue
    | { apiKey: string; companyId: number };

interface Resolved {
    headers: Record<string, string>;
    companyId: number | null; // null until resolveSession() fills it in
    kind: 'oauth2' | 'apiKey';
    raw: SimplyprintAuthValue;
}

function partial(auth: unknown): Resolved {
    if (auth && typeof auth === 'object' && 'apiKey' in auth) {
        const a = auth as { apiKey: string; companyId: number };
        return {
            kind: 'apiKey',
            headers: { 'X-API-Key': a.apiKey },
            companyId: Number(a.companyId),
            raw: a,
        };
    }
    const a = auth as OAuth2PropertyValue;
    return {
        kind: 'oauth2',
        headers: { Authorization: `Bearer ${a.access_token}` },
        companyId: null,
        raw: a,
    };
}

export type CurrentSession = {
    user: { id: number; name: string; email: string };
    company: { id: number; name?: string };
};

const sessionCache = new Map<string, CurrentSession>();

function cacheKey(r: Resolved): string {
    if (r.kind === 'apiKey') return `k:${(r.raw as { apiKey: string }).apiKey}`;
    return `o:${(r.raw as OAuth2PropertyValue).access_token}`;
}

/**
 * Return `{ user, company }` for the current connection.
 *
 * - OAuth2: we call `GET /api/0/account/GetUser` which returns the token's bound company.
 * - API key: the company is whatever the user typed into the connection. We still
 *   hit `account/GetUser` to resolve user info and to validate the key is live.
 */
export async function resolveSession(auth: unknown): Promise<CurrentSession> {
    const r = partial(auth);
    const key = cacheKey(r);
    const cached = sessionCache.get(key);
    if (cached) return cached;

    const res = await httpClient.sendRequest<{
        status: boolean;
        user: CurrentSession['user'];
        company?: CurrentSession['company'];
    }>({
        method: HttpMethod.GET,
        url: `${BASE_URL.api}/0/account/GetUser`,
        headers: r.headers,
    });

    if (!res.body?.status) {
        throw new Error('SimplyPrint rejected the connection — check your credentials.');
    }

    const company = r.kind === 'apiKey'
        ? { id: r.companyId as number }
        : (res.body.company ?? (() => { throw new Error('SimplyPrint OAuth token is not bound to a company.'); })());

    const session: CurrentSession = { user: res.body.user, company };
    sessionCache.set(key, session);
    return session;
}

/**
 * Resolve the HTTP headers + company id the API client should use for a given
 * connection. Unlike `resolveSession`, this does a single network call at most
 * (only when OAuth tokens have no cached company yet).
 */
export async function resolveCall(auth: unknown): Promise<{ headers: Record<string, string>; companyId: number }> {
    const r = partial(auth);
    if (r.companyId !== null) return { headers: r.headers, companyId: r.companyId };
    const session = await resolveSession(auth);
    return { headers: r.headers, companyId: session.company.id };
}

/**
 * Convenience for callers that just need an auth token string (e.g. multipart
 * upload builds its own FormData and passes through `httpClient.sendRequest`).
 * Returns the raw header map to splat into a request.
 */
export function getAuthHeaders(auth: unknown): Record<string, string> {
    return partial(auth).headers;
}
