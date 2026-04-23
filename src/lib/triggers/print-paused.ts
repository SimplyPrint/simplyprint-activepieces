import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const printPausedTrigger = createWebhookEventTrigger({
    name: 'print_paused',
    displayName: 'Print Paused',
    description: 'Fires when a print job is paused.',
    event: 'job.paused',
    sampleData: envelope('job.paused', SAMPLE.printPaused),
});
