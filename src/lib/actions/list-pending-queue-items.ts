import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { QueueItem } from '../common/types';

export const listPendingQueueItemsAction = createAction({
    auth: simplyprintAuth,
    name: 'list_pending_queue_items',
    displayName: 'List Pending Queue Items',
    description: 'List queue items awaiting approval, denied, or sent back for revision.',
    props: {},
    async run(context) {
        const res = await simplyprintCall<{ data: QueueItem[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'queue/approval/GetPendingItems',
        });
        return (res.objects?.data ?? []) as QueueItem[];
    },
});
