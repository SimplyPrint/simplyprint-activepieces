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
        const res = await simplyprintCall<{ data: Printer[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'printers/Get',
        });
        return (res.data ?? []) as Printer[];
    },
});
