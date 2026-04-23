import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const printFailedTrigger = createWebhookEventTrigger({
    name: 'print_failed',
    displayName: 'Print Failed',
    description: 'Fires when a print job fails (mid-print error, disconnect, etc.).',
    event: 'job.failed',
    sampleData: envelope('job.failed', SAMPLE.printFailed),
});
