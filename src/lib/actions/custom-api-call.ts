import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth, resolveSession } from '../auth';
import { simplyprintCall } from '../common/client';

/**
 * Escape-hatch action: let users call any SimplyPrint REST endpoint the piece
 * doesn't wrap directly. The path is relative — "/0/account/GetUser" or
 * "printers/Get". The company segment is auto-prefixed from the OAuth token
 * unless the user types a path that already starts with a numeric segment.
 */
export const customApiCallAction = createAction({
    auth: simplyprintAuth,
    name: 'custom_api_call',
    displayName: 'Custom API Call',
    description:
        'Call any SimplyPrint REST endpoint the piece does not wrap directly. Useful for admin / partner / school-dashboard endpoints and anything else behind OAuth scopes.',
    props: {
        method: Property.StaticDropdown({
            displayName: 'Method',
            required: true,
            defaultValue: 'GET',
            options: {
                options: [
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' },
                    { label: 'PUT', value: 'PUT' },
                    { label: 'PATCH', value: 'PATCH' },
                    { label: 'DELETE', value: 'DELETE' },
                ],
            },
        }),
        path: Property.ShortText({
            displayName: 'Path',
            description:
                'Endpoint path relative to the account, e.g. "printers/Get" or "queue/AddItem". Do not include the host or the account ID segment.',
            required: true,
        }),
        queryParams: Property.Object({
            displayName: 'Query params',
            required: false,
        }),
        body: Property.Json({
            displayName: 'JSON body',
            description: 'Only used for POST/PUT/PATCH.',
            required: false,
        }),
    },
    async run(context) {
        const method = (context.propsValue.method ?? 'GET') as keyof typeof HttpMethod;
        const session = await resolveSession(context.auth);
        const queryParams = context.propsValue.queryParams as Record<string, string> | undefined;

        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod[method],
            path: context.propsValue.path.replace(/^\//, ''),
            body: context.propsValue.body as Record<string, unknown> | undefined,
            queryParams,
            company: session.company.id,
        });
    },
});
