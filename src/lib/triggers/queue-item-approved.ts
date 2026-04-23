import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const queueItemApprovedTrigger = createWebhookEventTrigger({
    name: 'queue_item_approved',
    displayName: 'Queue Item Approved',
    description: 'Fires when a pending queue item is approved.',
    event: 'queue.item_approved',
    sampleData: envelope('queue.item_approved', SAMPLE.queueItemApproved),
});
