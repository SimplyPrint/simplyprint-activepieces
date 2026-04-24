import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { Tag } from '../common/types';

export const listTagsAction = createAction({
    auth: simplyprintAuth,
    name: 'list_tags',
    displayName: 'List Tags',
    description: 'List all custom tags configured on your account.',
    props: {},
    async run(context) {
        try {
            const res = await simplyprintCall<{ tags: Tag[] }>({
                auth: context.auth,
                method: HttpMethod.GET,
                path: 'tags/Get',
            });
            return (res.tags ?? []) as Tag[];
        } catch (e) {
            // `tags/Get` returns status:false when the account has no custom tags;
            // surface an empty list instead of throwing.
            if (/no custom tags/i.test((e as Error).message ?? '')) return [];
            throw e;
        }
    },
});
