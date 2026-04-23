export interface Printer {
    id: number;
    name: string;
    model?: string | null;
    state?: string | null;
    group_id?: number | null;
    serial?: string | null;
}

export interface QueueItem {
    id: number;
    file_id: number;
    file_name?: string | null;
    group_id?: number | null;
    order?: number | null;
    created_at?: string | null;
}

export interface QueueGroup {
    id: number;
    name: string;
}

export interface PrintFile {
    id: number;
    name: string;
    folder_id?: number | null;
    size?: number | null;
    file_type?: string | null;
}

export interface Filament {
    id: number;
    name?: string | null;
    brand?: string | null;
    material?: string | null;
    color_hex?: string | null;
    weight_remaining?: number | null;
}

export interface Tag {
    id: number;
    name: string;
    color?: string | null;
}

export interface CustomField {
    id: number;
    /**
     * Stable string UUID. This is what the submission endpoints
     * (queue/AddItem, CreateJob, files/Upload, custom_fields/SubmitValues)
     * expect under `customFieldId`. The numeric `id` is for admin CRUD only.
     */
    fieldId?: string;
    name: string;
    field_type: string;
    entity: string;
}

/**
 * Envelope of every incoming SimplyPrint webhook delivery when the webhook
 * format is `SIMPLYPRINT` (the default). See `WebhookData::getSimplyPrintWebhookPayload`.
 *
 * - `webhook_id` is the id of the sending webhook (same as the one we stored on enable).
 * - `event` is the `WebhookEvent` string (e.g. "job.done").
 * - `timestamp` is Unix seconds.
 * - `data` is event-specific; each trigger narrows the type.
 */
export interface WebhookPayload<T = Record<string, unknown>> {
    webhook_id: number;
    event: string;
    timestamp: number;
    data: T;
}
