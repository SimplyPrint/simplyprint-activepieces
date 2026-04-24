/**
 * Realistic sample payloads for each trigger. Field names and nesting match the
 * PHP webhook formatters (ecosystem/app/Helpers/Webhook/Formatter/*.php) and the
 * entities' `getFormattedData()` output. If you change the backend shape, update
 * here too — these drive the "Load sample data" UX in the Activepieces flow
 * builder.
 */

// ---- inner shapes (entity::getFormattedData output) ------------------------

// User::getFormattedData → {id, sso, first_name, last_name, avatar}
const userSample = {
    id: 7,
    sso: false,
    first_name: 'Alex',
    last_name: 'Johnson',
    avatar: 'https://www.gravatar.com/avatar/abc123?s=100',
};

// PrintQueueItem::getFormattedData — shape verified against a real webhook
// delivery (queue.add_item).
const queueItemSample = {
    id: 890,
    filename: 'bracket-v2.gcode',
    note: null as string | null,
    model: true,
    printable: true,
    type: 'model',
    zipPrintable: false,
    zipNoModel: null as boolean | null,
    left: 5,
    printed: 0,
    filesystem_id: 'c677ebfd2de41c58eec387e3c84e7895',
    for: { printers: null, models: null, groups: null },
    tags: null as number[] | null,
    group: 2,
    analysis: null as Record<string, unknown> | null,
    added: '2024-01-15T12:00:00+00:00',
    size: 2_458_112,
    index: null as number | null,
    sort_order: 3,
    user: 'Alex Johnson',
    user_id: 7,
    custom_fields: [] as Array<Record<string, unknown>>,
    quota_warnings: {
        over_quota: false,
        insufficient_balance: false,
        would_exceed: [] as string[],
        details: [] as Array<Record<string, unknown>>,
    },
};

// PrintJob::getFormattedData
const jobSample = {
    id: 456,
    uid: 'pj_abc123',
    panel_url: 'https://simplyprint.io/panel/456',
    printer_id: 123,
    state: 'completed',
    file: 'benchy.gcode',
    percentage: 100,
    time_left: null as number | null,
    current_layer: 210,
    analysis: { estimate: 3600, totalLayers: 210 } as Record<string, unknown>,
    started: 1705320000,
    ended: 1705323600,
    ai: null as Record<string, unknown> | null,
    autoprint: false,
    printer: {
        id: 123,
        name: 'Prusa MK4 - bed 1',
        group: { id: 2, name: 'Production bay' } as { id: number; name: string } | null,
    },
    cost: 0.42,
    duration: 3600,
    skippedObjects: null as Array<Record<string, unknown>> | null,
};

// Printer::getShortFormattedData → {id, name}
const printerShortSample = { id: 123, name: 'Prusa MK4 - bed 1' };

// Filament::getFormattedData (full)
const filamentSample = {
    id: 55,
    uid: 'SP-FILA-000055',
    type: { id: 1, name: 'PLA' },
    brand: 'Prusament',
    brandId: 11,
    brandFilamentId: 101,
    brandColorId: 1001,
    brandVariantId: null as number | null,
    colorName: 'Galaxy Black',
    colorHex: '#101010',
    dia: 1.75,
    note: null as string | null,
    productionId: null as string | null,
    batchId: null as string | null,
    cost: 24.99,
};

// MaintenanceJob::getFormattedData
const maintenanceJobSample = {
    id: 77,
    printer_id: 123,
    printer_name: 'Prusa MK4 - bed 1',
    schedule_id: null as number | null,
    created_by: { id: 7, name: 'Alex Johnson' } as { id: number; name: string } | null,
    title: 'Replace nozzle',
    description: 'Standard 0.4mm nozzle replacement.',
    status: 'overdue',
    priority: 'medium',
    scheduled_date: '2024-01-14T00:00:00+00:00',
    started_at: null as string | null,
    completed_at: null as string | null,
    cancelled_at: null as string | null,
    completion_summary: null as string | null,
    auto_created: false,
    scheduled_date_manually_set: true,
    progress: 0,
    completed_tasks: 0,
    total_tasks: 3,
    required_tasks: 2,
    completed_required_tasks: 0,
    assignees: [] as Array<{ id: number; name: string; avatar: string }>,
    problems: [] as Array<Record<string, unknown>>,
};

// MaintenanceProblem::getFormattedData
const maintenanceProblemSample = {
    id: 99,
    printer_id: 123,
    printer_name: 'Prusa MK4 - bed 1',
    problem_type: { id: 3, name: 'Extruder clicking' } as Record<string, unknown> | null,
    reported_by: { id: 7, name: 'Alex Johnson' } as { id: number; name: string } | null,
    print_job_id: null as number | null,
    description: 'Clicking noise, possible clogged hotend.',
    status: 'open',
    resolved_at: null as string | null,
    resolved_by_job_id: null as number | null,
    linked_jobs: [] as Array<{ id: number; title: string; status: string }>,
    custom_field_values: [] as Array<Record<string, unknown>>,
    created_at: '2024-01-15T12:00:00+00:00',
};

// ---- top-level wrappers (mirror buildRawWebhookData in each formatter) -----

export const SAMPLE = {
    // JobStartedFormatter: {job, user, started_by}
    printStarted: { job: jobSample, user: userSample, started_by: userSample },
    // JobPausedFormatter: {job}
    printPaused: { job: jobSample },
    // JobResumedFormatter: {job}
    printResumed: { job: jobSample },
    // JobDoneFormatter: {job}
    printFinished: { job: jobSample },
    // JobFailedFormatter: {job}
    printFailed: { job: jobSample },
    // JobCancelledFormatter: {job, user}
    printCancelled: { job: jobSample, user: userSample },
    // QueueItemAddedFormatter: {queue_item, user}
    queueItemAdded: { queue_item: queueItemSample, user: userSample },
    // QueueItemApprovedFormatter: {queue_item, approved_by}
    queueItemApproved: { queue_item: queueItemSample, approved_by: userSample },
    // QueueItemDeniedFormatter: {queue_item, denied_by, reason, removed}
    queueItemDenied: {
        queue_item: queueItemSample,
        denied_by: userSample,
        reason: 'Wrong material for this printer.',
        removed: false,
    },
    // QueueItemPendingApprovalFormatter: {queue_item, user}
    queueItemPendingApproval: { queue_item: queueItemSample, user: userSample },
    // FilamentAssignedFormatter: {filament, printer, user, replaced_spool}
    filamentAssigned: {
        filament: filamentSample,
        printer: printerShortSample,
        user: userSample,
        replaced_spool: null as typeof filamentSample | null,
    },
    // FilamentUnassignedFormatter: {filament, printer, user}
    filamentUnassigned: {
        filament: filamentSample,
        printer: printerShortSample,
        user: userSample,
    },
    // PrinterAIFailureDetectedFormatter: {job, image, failures}
    aiFailureDetected: {
        job: jobSample,
        image: 'https://cdn.simplyprint.io/ai/failure-123.jpg',
        failures: [{ confidence: 0.92, type: 'spaghetti' }],
    },
    // MaintenanceJobOverdueFormatter: {job, printer, scheduled_date}
    maintenanceJobOverdue: {
        job: maintenanceJobSample,
        printer: printerShortSample,
        scheduled_date: '2024-01-14T00:00:00+00:00',
    },
    // MaintenanceProblemReportedFormatter: {problem, printer, user}
    maintenanceProblemReported: {
        problem: maintenanceProblemSample,
        printer: printerShortSample,
        user: userSample,
    },
};

export function envelope<T extends object>(event: string, data: T) {
    return {
        webhook_id: 42,
        event,
        timestamp: 1705320000,
        data,
    };
}
