import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const queueItemAddedTrigger = createWebhookEventTrigger({
    name: 'queue_item_added',
    displayName: 'Queue Item Added',
    description: 'Fires when a new item is added to the print queue.',
    event: 'queue.add_item',
    sampleData: envelope('queue.add_item', SAMPLE.queueItemAdded),
});
