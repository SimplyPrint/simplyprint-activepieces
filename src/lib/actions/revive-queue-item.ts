import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';

export const reviveQueueItemAction = createAction({
    auth: simplyprintAuth,
    name: 'revive_queue_item',
    displayName: 'Revive Queue Item',
    description: 'Bring a completed (done) queue item back to the active queue.',
    props: {
        queueItemId: Property.Number({
            displayName: 'Queue item ID',
            description: 'Numeric queue item ID. Typically piped in from an upstream step.',
            required: true,
        }),
    },
    async run(context) {
        // queue/ReviveItem reads `job` from $this->GET only.
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/ReviveItem',
            queryParams: { job: String(context.propsValue.queueItemId) },
        });
    },
});
