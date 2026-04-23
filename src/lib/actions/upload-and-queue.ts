import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { uploadUserFile } from '../common/files';
import { queueGroupDropdown, printerMultiSelectDropdown } from '../common/props';
import { toSubmissionArray } from '../common/custom-fields';
import { buildStartOptionsProp, normalizeStartOptions } from '../common/start-options';

/**
 * Composite action: upload a local file via the API files service, add it
 * to the print queue, and optionally start a print job on one or more
 * printers. This is the hero "one-node" flow for automations that receive
 * a file and want it printed.
 */
export const uploadAndQueueAction = createAction({
    auth: simplyprintAuth,
    name: 'upload_and_queue',
    displayName: 'Upload, Queue, and Print',
    description:
        'Upload a file to SimplyPrint, add it to the print queue, and optionally start it on printers — all in one step.',
    props: {
        file: Property.File({
            displayName: 'File',
            description: 'File data (G-code, STL, 3MF).',
            required: true,
        }),
        queueGroupId: queueGroupDropdown({ required: true }),
        amount: Property.Number({
            displayName: 'Quantity',
            description: 'Number of copies to queue (defaults to 1).',
            required: false,
            defaultValue: 1,
        }),
        position: Property.StaticDropdown({
            displayName: 'Insert at',
            required: false,
            defaultValue: 'bottom',
            options: {
                options: [
                    { label: 'Top of queue', value: 'top' },
                    { label: 'Bottom of queue', value: 'bottom' },
                ],
            },
        }),
        queueCustomFields: Property.Object({
            displayName: 'Queue custom fields',
            description:
                'Optional. Object keyed by custom-field UUID (fieldId) → value, applied to the new queue item (PRINT_QUEUE).',
            required: false,
        }),
        startOnPrinterIds: printerMultiSelectDropdown({
            required: false,
            displayName: 'Start on printers',
        }),
        printCustomFields: Property.Object({
            displayName: 'Print custom fields',
            description:
                'Optional. Object keyed by custom-field UUID (fieldId) → value, applied to the started print job (PRINT_JOB). Ignored when no printers are selected.',
            required: false,
        }),
        startOptions: buildStartOptionsProp(),
    },
    async run(context) {
        const file = context.propsValue.file;
        if (!file) throw new Error('No file provided.');

        const uploadResult = await uploadUserFile({
            auth: context.auth,
            file: { filename: file.filename, data: file.data },
        });

        const queueBody: Record<string, unknown> = {
            fileId: uploadResult.fileId,
            group: context.propsValue.queueGroupId,
            amount: context.propsValue.amount ?? 1,
            position: context.propsValue.position ?? 'bottom',
        };
        const queueSubmissions = toSubmissionArray(context.propsValue.queueCustomFields ?? {});
        if (queueSubmissions.length > 0) queueBody['custom_fields'] = queueSubmissions;

        const queueResp = await simplyprintCall<{ created_id?: number; id?: number }>({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/AddItem',
            body: queueBody,
        });
        const queueObjects = (queueResp.objects ?? {}) as Record<string, unknown>;
        const queueItemId =
            (queueResp['created_id'] as number | undefined) ??
            (queueObjects['created_id'] as number | undefined) ??
            (queueObjects['id'] as number | undefined) ??
            null;

        const startOnPrinterIds = (context.propsValue.startOnPrinterIds ?? []) as number[];
        if (startOnPrinterIds.length === 0) {
            return {
                fileId: uploadResult.fileId,
                queueItemId,
                jobIds: null,
                raw: { upload: uploadResult.raw, queue: queueResp, start: null },
            };
        }

        const startBody: Record<string, unknown> = {
            pid: startOnPrinterIds.join(','),
        };
        if (queueItemId) {
            startBody['queue_file'] = queueItemId;
        } else {
            startBody['file_id'] = uploadResult.fileId;
        }

        const printSubmissions = toSubmissionArray(context.propsValue.printCustomFields ?? {});
        if (printSubmissions.length > 0) startBody['custom_fields'] = printSubmissions;

        const startOptions = normalizeStartOptions(
            context.propsValue.startOptions as Record<string, unknown> | undefined,
        );
        if (startOptions) startBody['start_options'] = startOptions;

        const startResp = await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'printers/actions/CreateJob',
            body: startBody,
        });
        const startObjects = (startResp.objects ?? {}) as Record<string, unknown>;
        const jobIds =
            startObjects['job_ids'] ?? startObjects['jobIds'] ?? startObjects['jobs'] ?? null;

        return {
            fileId: uploadResult.fileId,
            queueItemId,
            jobIds,
            raw: { upload: uploadResult.raw, queue: queueResp, start: startResp },
        };
    },
});
