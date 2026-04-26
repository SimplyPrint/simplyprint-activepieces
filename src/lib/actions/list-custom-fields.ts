import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { CustomField } from '../common/types';

export const listCustomFieldsAction = createAction({
    auth: simplyprintAuth,
    name: 'list_custom_fields',
    displayName: 'List Custom Fields',
    description: 'List all custom field definitions on your account.',
    props: {
        entity: Property.ShortText({
            displayName: 'Entity filter',
            description: 'Optional — e.g. PRINT_QUEUE, FILE, USER. Leave empty to list all.',
            required: false,
        }),
    },
    async run(context) {
        // custom_fields/Get is paginated and `page`/`page_size` are required.
        // Loop until we've collected every field, then optionally filter by entity.
        const all: CustomField[] = [];
        const pageSize = 100;
        let page = 1;
        // Hard cap to avoid runaway loops on a misbehaving backend.
        const maxPages = 50;
        for (let i = 0; i < maxPages; i++) {
            const res = await simplyprintCall<{ data: CustomField[]; page_amount?: number }>({
                auth: context.auth,
                method: HttpMethod.POST,
                path: 'custom_fields/Get',
                body: { page, page_size: pageSize },
            });
            const batch = (res.data ?? []) as CustomField[];
            all.push(...batch);
            const totalPages = res.page_amount ?? 1;
            if (page >= totalPages || batch.length < pageSize) break;
            page++;
        }
        const entity = context.propsValue.entity?.trim();
        return entity ? all.filter((f) => f.entity === entity) : all;
    },
});
