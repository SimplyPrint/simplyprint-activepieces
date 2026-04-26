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
        // queue/GetItems has two response paths: a legacy GET path returning
        // `{queue, groups, done_items, ...}` and a filter path (triggered by
        // any POST filter, including `compact`) returning `{queue, total,
        // page, page_amount, ...}`. We always force the filter path so the
        // shape is consistent — and so `gid` (group filter) is honoured,
        // since that field is read from $this->POST only.
        //
        // The legacy `done_items` toggle isn't supported in the filter path
        // (it ANDs in `qi.approvalStatus != DENIED` and pulls from the active
        // queue table), so we surface "include completed" by switching to
        // the legacy GET path when the user asks for it.
        if (context.propsValue.includeDone) {
            const res = await simplyprintCall<{ queue?: QueueItem[]; done_items?: QueueItem[] }>({
                auth: context.auth,
                method: HttpMethod.GET,
                path: 'queue/GetItems',
                queryParams: { done_items: '1' },
            });
            return [
                ...((res.queue ?? []) as QueueItem[]),
                ...((res.done_items ?? []) as QueueItem[]),
            ];
        }

        const body: Record<string, unknown> = {
            compact: true,
            page: 1,
            page_size: 100,
        };
        if (context.propsValue.groupId) body['gid'] = context.propsValue.groupId;

        const res = await simplyprintCall<{ queue: QueueItem[] }>({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/GetItems',
            body,
        });
        return (res.queue ?? []) as QueueItem[];
    },
});
