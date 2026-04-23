import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { printerDropdown } from '../common/props';

export const unassignFilamentAction = createAction({
    auth: simplyprintAuth,
    name: 'unassign_filament',
    displayName: 'Unassign Filament',
    description: 'Remove the currently assigned filament from a printer.',
    props: {
        printerId: printerDropdown({ required: true }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'filament/Unassign',
            body: { pid: context.propsValue.printerId },
        });
    },
});
