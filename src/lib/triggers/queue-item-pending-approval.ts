import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const queueItemPendingApprovalTrigger = createWebhookEventTrigger({
    name: 'queue_item_pending_approval',
    displayName: 'Queue Item Pending Approval',
    description: 'Fires when a queue item is submitted and awaiting approval.',
    event: 'queue.item_pending_approval',
    sampleData: envelope('queue.item_pending_approval', SAMPLE.queueItemPendingApproval),
});
