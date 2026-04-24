import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { QueueGroup } from '../common/types';

export const listQueueGroupsAction = createAction({
    auth: simplyprintAuth,
    name: 'list_queue_groups',
    displayName: 'List Queue Groups',
    description: 'List every queue group on your account.',
    props: {},
    async run(context) {
        const res = await simplyprintCall<{ data: QueueGroup[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'queue/groups/Get',
        });
        return (res.data ?? []) as QueueGroup[];
    },
});
