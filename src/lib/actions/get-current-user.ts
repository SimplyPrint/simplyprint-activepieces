import { createAction } from '@activepieces/pieces-framework';

import { simplyprintAuth, resolveSession } from '../auth';

export const getCurrentUserAction = createAction({
    auth: simplyprintAuth,
    name: 'get_current_user',
    displayName: 'Get Current User',
    description: 'Return information about the SimplyPrint account connected to this flow.',
    props: {},
    async run(context) {
        return await resolveSession(context.auth);
    },
});
