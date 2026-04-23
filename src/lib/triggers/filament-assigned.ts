import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const filamentAssignedTrigger = createWebhookEventTrigger({
    name: 'filament_assigned',
    displayName: 'Filament Assigned',
    description: 'Fires when a filament spool is assigned to a printer.',
    event: 'filament.assigned',
    sampleData: envelope('filament.assigned', SAMPLE.filamentAssigned),
});
