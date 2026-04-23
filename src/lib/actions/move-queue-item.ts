import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { queueItemDropdown, queueGroupDropdown } from '../common/props';

export const moveQueueItemAction = createAction({
    auth: simplyprintAuth,
    name: 'move_queue_item',
    displayName: 'Move Queue Item',
    description: 'Move a queue item to a different queue group.',
    props: {
        queueItemId: queueItemDropdown({ required: true }),
        targetGroupId: queueGroupDropdown({ required: true }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/MoveItem',
            body: {
                jobs: [context.propsValue.queueItemId],
                moveTo: context.propsValue.targetGroupId,
            },
        });
    },
});
