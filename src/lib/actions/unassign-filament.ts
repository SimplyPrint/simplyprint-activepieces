import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { filamentDropdown } from '../common/props';

export const unassignFilamentAction = createAction({
    auth: simplyprintAuth,
    name: 'unassign_filament',
    displayName: 'Unassign Filament',
    description: 'Detach a specific filament spool from whichever printer it is currently assigned to.',
    props: {
        // Backend resolves the printer from the spool's current assignment, so
        // the user only picks the spool. `filament/Unassign` reads `fid` via
        // RequireFilament and ignores any printer id sent alongside.
        filamentId: filamentDropdown({ required: true }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'filament/Unassign',
            queryParams: { fid: String(context.propsValue.filamentId) },
        });
    },
});
