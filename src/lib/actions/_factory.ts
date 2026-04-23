import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, QueryParams, HttpMessageBody } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { printerDropdown } from '../common/props';

/**
 * Factory for the printer-action class of endpoints (pause, resume, cancel).
 * They take a printer id via the `pid` query param and no body.
 */
export function createPrinterAction(opts: {
    name: string;
    displayName: string;
    description: string;
    path: string; // e.g. "printers/actions/Pause"
}) {
    return createAction({
        auth: simplyprintAuth,
        name: opts.name,
        displayName: opts.displayName,
        description: opts.description,
        props: {
            printerId: printerDropdown({ required: true }),
        },
        async run(context) {
            return await simplyprintCall({
                auth: context.auth,
                method: HttpMethod.POST,
                path: opts.path,
                queryParams: { pid: String(context.propsValue.printerId) },
            });
        },
    });
}

/**
 * Generic request helper for ad-hoc actions that don't fit the factory.
 * Returned via `simplyprintRequest({...})` inside an action's `run`.
 */
export async function simplyprintRequest<T = unknown>(args: {
    auth: unknown;
    method: HttpMethod;
    path: string;
    body?: HttpMessageBody;
    queryParams?: QueryParams;
    company?: number;
}) {
    return simplyprintCall<T>(args);
}

export { Property };
