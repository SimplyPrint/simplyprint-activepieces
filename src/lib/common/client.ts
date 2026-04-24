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
     * to the connection's company (the OAuth token's bound company).
     * Pass `0` explicitly for endpoints that don't require a company.
     */
    company?: number | 0;
}

/**
 * SimplyPrint envelope. The backend's `AjaxBaseController::respond()` flattens
 * `$this->objects` into the top-level response via `array_merge($resp, $this->objects)`
 * — so endpoint-specific fields like `data`, `webhook`, `user`, `company` sit at
 * the top level alongside `status` and `message`, NOT nested under `objects`.
 * See ecosystem/app/Controllers/Ajax/AjaxBaseController.php.
 */
export type SimplyprintResponse<T = Record<string, unknown>> = {
    status: boolean;
    message?: string;
} & T;

export async function simplyprintCall<T extends Record<string, unknown> = Record<string, unknown>>(
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
        const msg = (res.body as { message?: string } | undefined)?.message;
        throw new Error(msg ?? `SimplyPrint ${method} ${path} failed (HTTP ${res.status}).`);
    }

    return res.body;
}
