import { PieceAuth, OAuth2PropertyValue } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

import { BASE_URL } from './common/base-url';

const description = `
Click **Connect** below to authorize Activepieces to access your SimplyPrint account. The connection refreshes automatically. Revoke any time from **SimplyPrint → Panel → Settings → Connected apps**.
`;

export const simplyprintAuth = PieceAuth.OAuth2({
    required: true,
    description,
    // NB: `/oauth/authorize` and `/oauth/token` are the MCP Dynamic Client
    // Registration flow (different client registry). Integration clients
    // (pre-registered by SP ops) live at `/panel/oauth2/authorize` and
    // `/api/0/oauth2/Token`. See `.ai/integration.oauth2.md`.
    authUrl: `${BASE_URL.panel}/panel/oauth2/authorize`,
    tokenUrl: `${BASE_URL.api}/0/oauth2/Token`,
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
        'tags.read',
        'webhooks.read',
        'webhooks.write',
    ],
});

export type CurrentSession = {
    user: { id: number; name: string; email: string };
    company: { id: number; name?: string };
};

const sessionCache = new Map<string, CurrentSession>();

function authHeaders(auth: unknown): Record<string, string> {
    const a = auth as OAuth2PropertyValue;
    return { Authorization: `Bearer ${a.access_token}` };
}

function cacheKey(auth: unknown): string {
    const a = auth as OAuth2PropertyValue;
    return `o:${a.access_token}`;
}

/**
 * Return `{ user, company }` for the current OAuth connection. The token is
 * bound to a specific company by the OAuth grant, so we just fetch the user
 * record to discover which one.
 */
export async function resolveSession(auth: unknown): Promise<CurrentSession> {
    const key = cacheKey(auth);
    const cached = sessionCache.get(key);
    if (cached) return cached;

    const res = await httpClient.sendRequest<{
        status: boolean;
        user: CurrentSession['user'];
        company?: CurrentSession['company'];
    }>({
        method: HttpMethod.GET,
        url: `${BASE_URL.api}/0/account/GetUser`,
        headers: authHeaders(auth),
    });

    if (!res.body?.status) {
        throw new Error('SimplyPrint rejected the connection — reconnect your account.');
    }
    if (!res.body.company) {
        throw new Error('SimplyPrint OAuth token is not bound to a company.');
    }

    const session: CurrentSession = { user: res.body.user, company: res.body.company };
    sessionCache.set(key, session);
    return session;
}

/**
 * Headers + company id the API client should use for a given connection.
 */
export async function resolveCall(auth: unknown): Promise<{ headers: Record<string, string>; companyId: number }> {
    const session = await resolveSession(auth);
    return { headers: authHeaders(auth), companyId: session.company.id };
}

export function getAuthHeaders(auth: unknown): Record<string, string> {
    return authHeaders(auth);
}
