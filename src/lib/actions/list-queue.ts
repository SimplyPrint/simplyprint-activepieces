import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { queueGroupDropdown } from '../common/props';
import { QueueItem } from '../common/types';

export const listQueueAction = createAction({
    auth: simplyprintAuth,
    name: 'list_queue',
    displayName: 'List Queue Items',
    description: 'List items in the print queue, optionally filtered to a single queue group.',
    props: {
        groupId: queueGroupDropdown({ required: false }),
        includeDone: Property.Checkbox({
            displayName: 'Include completed items',
            required: false,
            defaultValue: false,
        }),
    },
    async run(context) {
        const queryParams: Record<string, string> = {};
        if (context.propsValue.groupId) queryParams['group'] = String(context.propsValue.groupId);
        if (context.propsValue.includeDone) queryParams['include_done'] = '1';

        const res = await simplyprintCall<{ data: QueueItem[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'queue/GetItems',
            queryParams,
        });
        return (res.objects?.data ?? []) as QueueItem[];
    },
});
