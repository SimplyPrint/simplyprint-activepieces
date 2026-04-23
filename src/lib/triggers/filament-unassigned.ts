import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const filamentUnassignedTrigger = createWebhookEventTrigger({
    name: 'filament_unassigned',
    displayName: 'Filament Unassigned',
    description: 'Fires when a filament spool is removed from a printer.',
    event: 'filament.unassigned',
    sampleData: envelope('filament.unassigned', SAMPLE.filamentUnassigned),
});
