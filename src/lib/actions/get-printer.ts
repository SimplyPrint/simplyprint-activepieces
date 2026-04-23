import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { printerDropdown } from '../common/props';
import { Printer } from '../common/types';

export const getPrinterAction = createAction({
    auth: simplyprintAuth,
    name: 'get_printer',
    displayName: 'Get Printer',
    description: 'Get detailed information about a specific printer.',
    props: {
        printerId: printerDropdown({ required: true }),
    },
    async run(context) {
        const res = await simplyprintCall<{ data: Printer[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'printers/Get',
            queryParams: { pid: String(context.propsValue.printerId) },
        });
        const data = res.objects?.data ?? [];
        return data[0] ?? null;
    },
});
