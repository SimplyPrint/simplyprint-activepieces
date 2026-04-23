import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const queueItemDeniedTrigger = createWebhookEventTrigger({
    name: 'queue_item_denied',
    displayName: 'Queue Item Denied',
    description: 'Fires when a pending queue item is denied (rejected).',
    event: 'queue.item_denied',
    sampleData: envelope('queue.item_denied', SAMPLE.queueItemDenied),
});
