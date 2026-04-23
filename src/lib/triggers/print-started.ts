import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const printStartedTrigger = createWebhookEventTrigger({
    name: 'print_started',
    displayName: 'Print Started',
    description: 'Fires when a print job starts on any of your printers.',
    event: 'job.started',
    sampleData: envelope('job.started', SAMPLE.printStarted),
});
