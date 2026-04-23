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
        const queryParams: Record<string, string> = {};
        if (context.propsValue.entity) queryParams['entity'] = context.propsValue.entity;
        const res = await simplyprintCall<{ data: CustomField[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'custom_fields/Get',
            queryParams,
        });
        return (res.objects?.data ?? []) as CustomField[];
    },
});
