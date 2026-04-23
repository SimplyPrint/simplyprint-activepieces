import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { queueGroupDropdown } from '../common/props';

export const emptyQueueAction = createAction({
    auth: simplyprintAuth,
    name: 'empty_queue',
    displayName: 'Empty Queue',
    description: 'Delete every item from the print queue (optionally filtered to a group or done-only). Destructive.',
    props: {
        groupId: queueGroupDropdown({ required: false }),
        doneOnly: Property.Checkbox({
            displayName: 'Only remove completed items',
            description: 'When checked, only done items are removed. Pending / printing / failed items stay.',
            required: false,
            defaultValue: false,
        }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/EmptyQueue',
            body: {
                group: context.propsValue.groupId ?? null,
                done_only: context.propsValue.doneOnly ?? false,
            },
        });
    },
});
