import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const printCancelledTrigger = createWebhookEventTrigger({
    name: 'print_cancelled',
    displayName: 'Print Cancelled',
    description: 'Fires when a print job is cancelled by a user or by AutoPrint.',
    event: 'job.cancelled',
    sampleData: envelope('job.cancelled', SAMPLE.printCancelled),
});
