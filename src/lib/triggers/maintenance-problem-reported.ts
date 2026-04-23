import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const maintenanceProblemReportedTrigger = createWebhookEventTrigger({
    name: 'maintenance_problem_reported',
    displayName: 'Maintenance Problem Reported',
    description: 'Fires when a user reports a maintenance problem on a printer.',
    event: 'maintenance.problem_reported',
    sampleData: envelope('maintenance.problem_reported', SAMPLE.maintenanceProblemReported),
});
