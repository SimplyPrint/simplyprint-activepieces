import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';

export const triggerTestWebhookAction = createAction({
    auth: simplyprintAuth,
    name: 'trigger_test_webhook',
    displayName: 'Trigger Test Webhook',
    description: 'Send a test payload to one of your SimplyPrint webhooks.',
    props: {
        webhookId: Property.Number({
            displayName: 'Webhook ID',
            description: 'ID of the SimplyPrint webhook to test.',
            required: true,
        }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'webhooks/TriggerTestWebhook',
            body: { id: context.propsValue.webhookId },
        });
    },
});
