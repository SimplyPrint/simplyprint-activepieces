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
        // `filament/GetFilament` reads `compact` (and every other filter) from
        // $this->POST. `compact:true` flattens the keyed-by-id `filament` map
        // into a list of just the AI-relevant fields — exactly the shape we
        // want to return. Passing it as a GET query param lands in $this->GET
        // and is silently ignored.
        const res = await simplyprintCall<{ filament: Filament[] }>({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'filament/GetFilament',
            body: { compact: true },
        });
        return (res.filament ?? []) as Filament[];
    },
});
