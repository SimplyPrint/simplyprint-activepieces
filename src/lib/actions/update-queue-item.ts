import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { queueItemDropdown } from '../common/props';

export const updateQueueItemAction = createAction({
    auth: simplyprintAuth,
    name: 'update_queue_item',
    displayName: 'Update Queue Item',
    description: 'Update a queue item (amount, note, etc.).',
    props: {
        queueItemId: queueItemDropdown({ required: true }),
        amount: Property.Number({
            displayName: 'Quantity',
            required: false,
        }),
        note: Property.LongText({
            displayName: 'Note',
            required: false,
        }),
    },
    async run(context) {
        const body: Record<string, unknown> = { job: context.propsValue.queueItemId };
        if (context.propsValue.amount !== undefined) body['amount'] = context.propsValue.amount;
        if (context.propsValue.note !== undefined) body['note'] = context.propsValue.note;

        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/UpdateItem',
            body,
        });
    },
});
