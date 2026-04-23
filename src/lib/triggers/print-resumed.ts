import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const printResumedTrigger = createWebhookEventTrigger({
    name: 'print_resumed',
    displayName: 'Print Resumed',
    description: 'Fires when a previously-paused print job resumes.',
    event: 'job.resumed',
    sampleData: envelope('job.resumed', SAMPLE.printResumed),
});
