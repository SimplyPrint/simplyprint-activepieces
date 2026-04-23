import {
    httpClient,
    HttpMethod,
    HttpMessageBody,
    QueryParams,
} from '@activepieces/pieces-common';

import { BASE_URL } from './base-url';
import { resolveCall } from '../auth';

export interface SimplyprintCallOptions {
    auth: unknown;
    method: HttpMethod;
    path: string;
    body?: HttpMessageBody;
    queryParams?: QueryParams;
    /**
     * Override the URL-path company segment. When omitted, the endpoint is scoped
     * to the connection's company (OAuth token's bound company, or the company_id
     * the user entered for the API-key auth path).
     * Pass `0` explicitly for endpoints that don't require a company.
     */
    company?: number | 0;
}

/**
 * Envelope SimplyPrint wraps every response in.
 */
export interface SimplyprintResponse<T = unknown> {
    status: boolean;
    message?: string;
    objects?: T;
    [key: string]: unknown;
}

export async function simplyprintCall<T = unknown>(
    opts: SimplyprintCallOptions,
): Promise<SimplyprintResponse<T>> {
    const { auth, method, path, body, queryParams, company } = opts;

    const { headers, companyId: resolvedCompany } = await resolveCall(auth);
    const companyId = company !== undefined ? company : resolvedCompany;

    const res = await httpClient.sendRequest<SimplyprintResponse<T>>({
        method,
        url: `${BASE_URL.api}/${companyId}/${path.replace(/^\//, '')}`,
        headers,
        body,
        queryParams,
    });

    if (!res.body || res.body.status === false) {
        throw new Error(res.body?.message ?? `SimplyPrint ${method} ${path} failed (HTTP ${res.status}).`);
    }

    return res.body;
}
