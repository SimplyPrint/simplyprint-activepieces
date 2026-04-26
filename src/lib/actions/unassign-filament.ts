import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { resolveFilamentId } from '../common/filaments';

export const unassignFilamentAction = createAction({
    auth: simplyprintAuth,
    name: 'unassign_filament',
    displayName: 'Unassign Filament',
    description: 'Detach a specific filament spool from whichever printer it is currently assigned to.',
    props: {
        // Backend resolves the printer from the spool's current assignment, so
        // the user only picks the spool. `filament/Unassign` reads `fid` via
        // RequireFilament and ignores any printer id sent alongside.
        filamentId: Property.ShortText({
            displayName: 'Filament',
            description:
                'Numeric spool ID, OR the 4-character short ID (`uid`) printed on the QR sticker / NFC tag.',
            required: true,
        }),
    },
    async run(context) {
        const fid = await resolveFilamentId(
            context.auth,
            context.propsValue.filamentId,
        );

        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'filament/Unassign',
            queryParams: { fid: String(fid) },
        });
    },
});
