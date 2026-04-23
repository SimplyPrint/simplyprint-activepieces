import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';

export const getStatisticsAction = createAction({
    auth: simplyprintAuth,
    name: 'get_statistics',
    displayName: 'Get Account Statistics',
    description: 'Fetch high-level printing statistics (total prints, materials used, hours, etc.).',
    props: {},
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'account/GetStatistics',
        });
    },
});
