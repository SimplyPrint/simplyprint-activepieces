import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { queueItemDropdown } from '../common/props';

export const reviveQueueItemAction = createAction({
    auth: simplyprintAuth,
    name: 'revive_queue_item',
    displayName: 'Revive Queue Item',
    description: 'Bring a completed (done) queue item back to the active queue.',
    props: {
        queueItemId: queueItemDropdown({ required: true }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/ReviveItem',
            body: { job: context.propsValue.queueItemId },
        });
    },
});
