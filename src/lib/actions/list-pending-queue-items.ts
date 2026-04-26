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
        // queue/approval/GetPendingItems returns `{items, total, page, per_page}`
        // — note the field name `items`, NOT `data`.
        const res = await simplyprintCall<{ items: QueueItem[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'queue/approval/GetPendingItems',
        });
        return (res.items ?? []) as QueueItem[];
    },
});
