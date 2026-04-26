import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { Printer } from '../common/types';

export const listPrintersAction = createAction({
    auth: simplyprintAuth,
    name: 'list_printers',
    displayName: 'List Printers',
    description: 'List every printer in your SimplyPrint account with current status.',
    props: {},
    async run(context) {
        // printers/Get reads page/page_size from $this->POST first and only
        // falls through to $this->GET when POST is unset. Critically, its
        // get_validation caps `page_size` at 25 (the panel's hard limit),
        // while post_validation allows up to 100. Sending 100 in the query
        // string fails validation; sending it in the body works.
        const all: Printer[] = [];
        const pageSize = 100;
        const maxPages = 50;
        for (let page = 1; page <= maxPages; page++) {
            const res = await simplyprintCall<{ data: Printer[]; page_amount?: number }>({
                auth: context.auth,
                method: HttpMethod.POST,
                path: 'printers/Get',
                body: { page, page_size: pageSize },
            });
            const batch = (res.data ?? []) as Printer[];
            all.push(...batch);
            const totalPages = res.page_amount ?? 1;
            if (page >= totalPages || batch.length < pageSize) break;
        }
        return all;
    },
});
