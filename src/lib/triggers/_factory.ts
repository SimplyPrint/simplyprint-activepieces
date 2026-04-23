import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { generateWebhookSecret, verifySimplyprintSignature, extractSecretHeader } from '../common/signature';

interface StoredWebhook {
    id: number;
    secret: string;
}

interface FactoryOptions<Payload> {
    /** Internal snake_case id for the trigger (never rename after publish). */
    name: string;
    displayName: string;
    description: string;
    /** WebhookEvent string the trigger subscribes to (e.g. 'job.done'). */
    event: string;
    /**
     * Example payload shown to users in the flow builder so they can map fields
     * before a real event arrives. Pull from webhook formatter PHP classes.
     */
    sampleData: Payload;
}

/**
 * Factory for per-flow webhook triggers. Each invocation produces a `createTrigger`
 * descriptor that:
 *
 * 1. On enable — generates a per-flow secret, calls `POST /webhooks/Create` with
 *    `context.webhookUrl`, and persists `{ id, secret }` in `context.store`.
 * 2. On run — verifies the `X-SP-Secret` header against the stored secret
 *    (constant-time). Drops the event if verification fails.
 * 3. On disable — calls `POST /webhooks/Delete` with the stored id.
 */
export function createWebhookEventTrigger<Payload extends object>(opts: FactoryOptions<Payload>) {
    return createTrigger({
        auth: simplyprintAuth,
        name: opts.name,
        displayName: opts.displayName,
        description: opts.description,
        type: TriggerStrategy.WEBHOOK,
        props: {
            // Optional readme block — tell users this is a per-flow webhook.
            intro: Property.MarkDown({
                value:
                    'When this flow is enabled, Activepieces registers a dedicated webhook on ' +
                    'your SimplyPrint account and removes it when the flow is disabled. Events are ' +
                    'verified with a unique per-flow secret.',
            }),
        },
        sampleData: opts.sampleData,

        async onEnable(context) {
            const secret = generateWebhookSecret();
            const res = await simplyprintCall<{ webhook: { id: number } }>({
                auth: context.auth,
                method: HttpMethod.POST,
                path: 'webhooks/Create',
                body: {
                    name: `Activepieces: ${opts.displayName}`,
                    description: `Per-flow webhook from Activepieces (${opts.name}). Auto-managed — do not edit.`,
                    url: context.webhookUrl,
                    events: [opts.event],
                    secret,
                    enabled: true,
                },
            });

            const webhookId = res.objects?.webhook?.id;
            if (!webhookId) {
                throw new Error('SimplyPrint did not return a webhook id — event registration failed.');
            }

            await context.store.put<StoredWebhook>('sp_webhook', { id: webhookId, secret });
        },

        async onDisable(context) {
            const stored = await context.store.get<StoredWebhook>('sp_webhook');
            if (!stored?.id) return;

            try {
                await simplyprintCall({
                    auth: context.auth,
                    method: HttpMethod.POST,
                    path: 'webhooks/Delete',
                    body: { id: stored.id },
                });
            } catch {
                // Webhook may already be gone (revoked app, deleted by user). Best-effort.
            }

            await context.store.delete('sp_webhook');
        },

        async run(context) {
            const stored = await context.store.get<StoredWebhook>('sp_webhook');
            const headers = context.payload.headers as Record<string, string | undefined>;
            const header = extractSecretHeader(headers);

            if (!verifySimplyprintSignature(header, stored?.secret)) {
                // Silent drop — event is forged, stale, or the secret was rotated.
                return [];
            }

            return [context.payload.body];
        },
    });
}
