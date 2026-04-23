import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const maintenanceJobOverdueTrigger = createWebhookEventTrigger({
    name: 'maintenance_job_overdue',
    displayName: 'Maintenance Job Overdue',
    description: 'Fires when a scheduled maintenance job becomes overdue on one of your printers.',
    event: 'maintenance.job_overdue',
    sampleData: envelope('maintenance.job_overdue', SAMPLE.maintenanceJobOverdue),
});
