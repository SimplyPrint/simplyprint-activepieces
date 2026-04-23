import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';

export const denyQueueItemAction = createAction({
    auth: simplyprintAuth,
    name: 'deny_queue_item',
    displayName: 'Deny Queue Item',
    description: 'Deny a pending queue item (remove or send back for revision).',
    props: {
        queueItemId: Property.Number({
            displayName: 'Queue item ID',
            required: true,
        }),
        comment: Property.LongText({
            displayName: 'Comment',
            description: 'Explain why the item is being denied. Shown to the submitter.',
            required: true,
        }),
        requestRevision: Property.Checkbox({
            displayName: 'Request revision',
            description: 'When checked, the submitter can edit and resubmit. Otherwise the item is removed.',
            required: false,
            defaultValue: false,
        }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/approval/DenyItem',
            body: {
                job: context.propsValue.queueItemId,
                comment: context.propsValue.comment,
                request_revision: context.propsValue.requestRevision ?? false,
            },
        });
    },
});
