import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

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

export { Property };
