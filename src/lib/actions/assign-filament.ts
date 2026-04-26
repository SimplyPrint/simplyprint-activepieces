import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { resolveFilamentId } from '../common/filaments';

export const assignFilamentAction = createAction({
    auth: simplyprintAuth,
    name: 'assign_filament',
    displayName: 'Assign Filament to Printer',
    description: 'Assign a filament spool to a printer as its active material.',
    props: {
        printerId: Property.Number({
            displayName: 'Printer ID',
            description: 'Numeric printer ID. In automation flows this typically flows in from a trigger or upstream step.',
            required: true,
        }),
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

        // Assign.php uses RequirePrinter()/RequireFilaments() which read from
        // GET by default — the printer/spool ids must travel as query params,
        // not in the body.
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'filament/Assign',
            queryParams: {
                pid: String(context.propsValue.printerId),
                fid: String(fid),
            },
        });
    },
});
