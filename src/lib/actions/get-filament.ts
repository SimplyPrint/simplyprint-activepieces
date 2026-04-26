import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { Filament } from '../common/types';
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
        // `filament/GetSpecific` is the public single-spool endpoint and isn't
        // exposed to OAuth tokens (it powers the public QR-code page). The
        // OAuth-friendly path is `filament/GetFilament`, which returns the
        // full company spool map; we filter to the requested id here. Filters
        // are read from $this->POST, so the request must be POST — otherwise
        // we'd get the unfiltered shape regardless of params.
        const targetId = Number(context.propsValue.filamentId);
        const res = await simplyprintCall<{ filament: Record<string, Filament> | Filament[] }>({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'filament/GetFilament',
            body: {},
        });
        const map = res.filament ?? {};
        const list = Array.isArray(map) ? map : Object.values(map);
        const found = list.find((f) => Number(f.id) === targetId);
        if (!found) {
            throw new Error(`Filament #${targetId} not found on this account.`);
        }
        return found;
    },
});
