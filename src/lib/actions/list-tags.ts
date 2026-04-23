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
        const res = await simplyprintCall<{ data: Tag[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'tags/Get',
        });
        return (res.objects?.data ?? []) as Tag[];
    },
});
