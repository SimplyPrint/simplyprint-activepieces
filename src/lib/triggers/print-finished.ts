import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const printFinishedTrigger = createWebhookEventTrigger({
    name: 'print_finished',
    displayName: 'Print Finished',
    description: 'Fires when a print job finishes successfully.',
    event: 'job.done',
    sampleData: envelope('job.done', SAMPLE.printFinished),
});
