import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { Filament } from '../common/types';

export const listFilamentsAction = createAction({
    auth: simplyprintAuth,
    name: 'list_filaments',
    displayName: 'List Filaments',
    description: 'List filament spools in your SimplyPrint account.',
    props: {},
    async run(context) {
        const res = await simplyprintCall<{ data: Filament[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'filament/Get',
        });
        return (res.objects?.data ?? []) as Filament[];
    },
});
