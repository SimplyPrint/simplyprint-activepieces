import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';

export const approveQueueItemAction = createAction({
    auth: simplyprintAuth,
    name: 'approve_queue_item',
    displayName: 'Approve Queue Item',
    description: 'Approve one or more pending queue items.',
    props: {
        queueItemIds: Property.Array({
            displayName: 'Queue item IDs',
            description: 'Numeric IDs of pending queue items to approve.',
            required: true,
        }),
        comment: Property.LongText({
            displayName: 'Comment',
            required: false,
        }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/approval/ApproveItem',
            body: {
                jobs: (context.propsValue.queueItemIds ?? []).map(Number),
                comment: context.propsValue.comment ?? null,
            },
        });
    },
});
