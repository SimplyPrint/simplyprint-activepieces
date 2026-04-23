import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { filamentDropdown, printerDropdown } from '../common/props';

export const assignFilamentAction = createAction({
    auth: simplyprintAuth,
    name: 'assign_filament',
    displayName: 'Assign Filament to Printer',
    description: 'Assign a filament spool to a printer as its active material.',
    props: {
        printerId: printerDropdown({ required: true }),
        filamentId: filamentDropdown({ required: true }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'filament/Assign',
            body: {
                pid: context.propsValue.printerId,
                fid: context.propsValue.filamentId,
            },
        });
    },
});
