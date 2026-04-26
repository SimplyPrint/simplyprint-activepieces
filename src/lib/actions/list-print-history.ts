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
            description: 'Maximum number of jobs to return (default 25, max 100).',
            required: false,
            defaultValue: 25,
        }),
    },
    async run(context) {
        // jobs/GetPaginatedPrintJobs is POST-only — its `validate()` only declares
        // post_validation rules and reads page/page_size/printer_ids straight from
        // $this->POST. A GET with the same values in the query string would land
        // in $this->GET and silently lose the printer filter (auto-defaults to
        // page=1, page_size=25, no filter).
        const body: Record<string, unknown> = {
            page: 1,
            page_size: context.propsValue.limit ?? 25,
        };
        if (context.propsValue.printerId) {
            body['printer_ids'] = [Number(context.propsValue.printerId)];
        }

        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'jobs/GetPaginatedPrintJobs',
            body,
        });
    },
});
