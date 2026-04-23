import { createWebhookEventTrigger } from './_factory';
import { SAMPLE, envelope } from './_samples';

export const aiFailureDetectedTrigger = createWebhookEventTrigger({
    name: 'ai_failure_detected',
    displayName: 'AI Failure Detected',
    description: 'Fires when SimplyPrint AI detects a likely print failure (spaghetti, layer shift, etc.).',
    event: 'printer.ai_failure_detected',
    sampleData: envelope('printer.ai_failure_detected', SAMPLE.aiFailureDetected),
});
