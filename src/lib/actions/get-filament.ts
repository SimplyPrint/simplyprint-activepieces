import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { filamentDropdown } from '../common/props';

export const getFilamentAction = createAction({
    auth: simplyprintAuth,
    name: 'get_filament',
    displayName: 'Get Filament',
    description: 'Get detailed information about a specific filament spool.',
    props: {
        filamentId: filamentDropdown({ required: true }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'filament/GetSpecific',
            queryParams: { fid: String(context.propsValue.filamentId) },
        });
    },
});
