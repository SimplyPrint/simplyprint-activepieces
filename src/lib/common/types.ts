/**
 * `PrinterModel::getFormattedData()` output — embedded under
 * `printer.model` in each printer record from `printers/Get`.
 */
export interface PrinterModelInfo {
    id?: number;
    name?: string;
    brand?: string;
    [key: string]: unknown;
}

/**
 * Shape returned by `printers/Get` (per-item). The printer's own fields
 * (name, state, group id, model, …) are nested under `.printer`. `id` at the
 * top level is the printer id.
 */
export interface Printer {
    id: number;
    sort_order?: number;
    printer?: {
        name?: string;
        state?: string;
        /** Group id (0 when no group). Group *name* is not in the default response. */
        group?: number;
        online?: boolean;
        tags?: number[];
        model?: PrinterModelInfo;
        [key: string]: unknown;
    };
    filament?: unknown;
    job?: unknown;
}

/**
 * `queue/GetItems` / `queue/GetItem` / webhook `queue_item` shape.
 * `filename` is the canonical field (older aliases tolerated for resilience).
 */
export interface QueueItem {
    id: number;
    filename?: string | null;
    /** Legacy alias; older webhook samples used this. */
    file_name?: string | null;
    group?: number | null;
    sort_order?: number | null;
    left?: number | null;
    printed?: number | null;
    filesystem_id?: string | null;
    user_id?: number | null;
    added?: string | null;
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

/**
 * Shape returned by `filament/GetFilament` (per spool). Field names mirror
 * `Filament::getFormattedData()` — `type` is the material type object,
 * `colorName`/`colorHex` are the spool colour, `left` is grams remaining.
 * The endpoint normally returns these keyed-by-id under `filament`; the piece
 * always passes `compact=true` to flatten to a list.
 */
export interface Filament {
    id: number;
    uid?: string | null;
    brand?: string | null;
    type?: { id?: number; name?: string } | string | null;
    colorName?: string | null;
    colorHex?: string | null;
    colorGroup?: string | null;
    left?: number | null;
    total?: number | null;
    printer?: number | null;
    extruder?: number | null;
    nozzle?: number | null;
    isNearEmpty?: boolean;
    emptiedAt?: string | null;
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
