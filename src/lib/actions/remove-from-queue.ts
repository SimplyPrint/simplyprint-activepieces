import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { queueItemDropdown } from '../common/props';

export const removeFromQueueAction = createAction({
    auth: simplyprintAuth,
    name: 'remove_from_queue',
    displayName: 'Remove Queue Item',
    description: 'Remove an item from the print queue. Destructive — the item is gone.',
    props: {
        queueItemId: queueItemDropdown({ required: true }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/DeleteItem',
            body: { job: context.propsValue.queueItemId },
        });
    },
});
