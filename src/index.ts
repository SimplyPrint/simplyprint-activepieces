import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';

import { simplyprintAuth } from './lib/auth';

// Actions — printer control
import { listPrintersAction } from './lib/actions/list-printers';
import { getPrinterAction } from './lib/actions/get-printer';
import { pausePrintAction } from './lib/actions/pause-print';
import { resumePrintAction } from './lib/actions/resume-print';
import { cancelPrintAction } from './lib/actions/cancel-print';
import { sendGcodeAction } from './lib/actions/send-gcode';
import { startPrintAction } from './lib/actions/start-print';

// Actions — queue
import { listQueueAction } from './lib/actions/list-queue';
import { listQueueGroupsAction } from './lib/actions/list-queue-groups';
import { addToQueueAction } from './lib/actions/add-to-queue';
import { updateQueueItemAction } from './lib/actions/update-queue-item';
import { moveQueueItemAction } from './lib/actions/move-queue-item';
import { removeFromQueueAction } from './lib/actions/remove-from-queue';
import { reviveQueueItemAction } from './lib/actions/revive-queue-item';
import { emptyQueueAction } from './lib/actions/empty-queue';
import { listPendingQueueItemsAction } from './lib/actions/list-pending-queue-items';
import { approveQueueItemAction } from './lib/actions/approve-queue-item';
import { denyQueueItemAction } from './lib/actions/deny-queue-item';

// Actions — files
import { listFilesAction } from './lib/actions/list-files';
import { getFileAction } from './lib/actions/get-file';
import { uploadFileAction } from './lib/actions/upload-file';
import { uploadAndQueueAction } from './lib/actions/upload-and-queue';
import { moveFileAction } from './lib/actions/move-file';
import { deleteFileAction } from './lib/actions/delete-file';

// Actions — filament
import { listFilamentsAction } from './lib/actions/list-filaments';
import { getFilamentAction } from './lib/actions/get-filament';
import { assignFilamentAction } from './lib/actions/assign-filament';
import { unassignFilamentAction } from './lib/actions/unassign-filament';

// Actions — org / metadata
import { getCurrentUserAction } from './lib/actions/get-current-user';
import { listTagsAction } from './lib/actions/list-tags';
import { listCustomFieldsAction } from './lib/actions/list-custom-fields';
import { setCustomFieldValuesAction } from './lib/actions/set-custom-field-values';
import { listPrintHistoryAction } from './lib/actions/list-print-history';
import { getStatisticsAction } from './lib/actions/get-statistics';

// Actions — utility
import { triggerTestWebhookAction } from './lib/actions/trigger-test-webhook';
import { customApiCallAction } from './lib/actions/custom-api-call';

// Triggers
import { printStartedTrigger } from './lib/triggers/print-started';
import { printPausedTrigger } from './lib/triggers/print-paused';
import { printResumedTrigger } from './lib/triggers/print-resumed';
import { printFinishedTrigger } from './lib/triggers/print-finished';
import { printFailedTrigger } from './lib/triggers/print-failed';
import { printCancelledTrigger } from './lib/triggers/print-cancelled';
import { queueItemAddedTrigger } from './lib/triggers/queue-item-added';
import { queueItemApprovedTrigger } from './lib/triggers/queue-item-approved';
import { queueItemDeniedTrigger } from './lib/triggers/queue-item-denied';
import { queueItemPendingApprovalTrigger } from './lib/triggers/queue-item-pending-approval';
import { filamentAssignedTrigger } from './lib/triggers/filament-assigned';
import { filamentUnassignedTrigger } from './lib/triggers/filament-unassigned';
import { aiFailureDetectedTrigger } from './lib/triggers/ai-failure-detected';
import { maintenanceJobOverdueTrigger } from './lib/triggers/maintenance-job-overdue';
import { maintenanceProblemReportedTrigger } from './lib/triggers/maintenance-problem-reported';

export const simplyprint = createPiece({
    displayName: 'SimplyPrint',
    description:
        '3D printer fleet management: monitor printers, manage the print queue, track filament, and automate print jobs.',
    auth: simplyprintAuth,
    minimumSupportedRelease: '0.82.0',
    logoUrl: 'https://cdn.simplyprint.io/i/static/logo/png/2x/icon_white_background_rounded.png',
    categories: [PieceCategory.PRODUCTIVITY],
    authors: ['simplyprint'],
    actions: [
        // Printer control
        listPrintersAction,
        getPrinterAction,
        pausePrintAction,
        resumePrintAction,
        cancelPrintAction,
        sendGcodeAction,
        startPrintAction,
        // Queue
        listQueueAction,
        listQueueGroupsAction,
        addToQueueAction,
        updateQueueItemAction,
        moveQueueItemAction,
        removeFromQueueAction,
        reviveQueueItemAction,
        emptyQueueAction,
        listPendingQueueItemsAction,
        approveQueueItemAction,
        denyQueueItemAction,
        // Files
        listFilesAction,
        getFileAction,
        uploadFileAction,
        uploadAndQueueAction,
        moveFileAction,
        deleteFileAction,
        // Filaments
        listFilamentsAction,
        getFilamentAction,
        assignFilamentAction,
        unassignFilamentAction,
        // Org / metadata
        getCurrentUserAction,
        listTagsAction,
        listCustomFieldsAction,
        setCustomFieldValuesAction,
        listPrintHistoryAction,
        getStatisticsAction,
        // Utility
        triggerTestWebhookAction,
        customApiCallAction,
    ],
    triggers: [
        printStartedTrigger,
        printPausedTrigger,
        printResumedTrigger,
        printFinishedTrigger,
        printFailedTrigger,
        printCancelledTrigger,
        queueItemAddedTrigger,
        queueItemApprovedTrigger,
        queueItemDeniedTrigger,
        queueItemPendingApprovalTrigger,
        filamentAssignedTrigger,
        filamentUnassignedTrigger,
        aiFailureDetectedTrigger,
        maintenanceJobOverdueTrigger,
        maintenanceProblemReportedTrigger,
    ],
});
