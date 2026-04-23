import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { printerDropdown } from '../common/props';

export const listPrintHistoryAction = createAction({
    auth: simplyprintAuth,
    name: 'list_print_history',
    displayName: 'List Print History',
    description: 'List completed print jobs, optionally filtered to a single printer.',
    props: {
        printerId: printerDropdown({ required: false, displayName: 'Printer (optional)' }),
        limit: Property.Number({
            displayName: 'Limit',
            description: 'Maximum number of jobs to return (default 25).',
            required: false,
            defaultValue: 25,
        }),
    },
    async run(context) {
        const queryParams: Record<string, string> = {};
        if (context.propsValue.printerId) queryParams['pid'] = String(context.propsValue.printerId);
        if (context.propsValue.limit) queryParams['limit'] = String(context.propsValue.limit);

        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'jobs/Get',
            queryParams,
        });
    },
});
