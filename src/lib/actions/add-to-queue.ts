import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import {
    queueGroupDropdown,
    printerMultiSelectDropdown,
    printerModelMultiSelectDropdown,
    tagMultiSelectDropdown,
    nozzleSizeProp,
    nozzleTypeProp,
    nozzleVolumeTypeProp,
    bedTypeDropdown,
    buildTagsBody,
    queuePositionProp,
    queuePositionNumberProp,
    resolveQueuePosition,
} from '../common/props';
import { toSubmissionArray } from '../common/custom-fields';

export const addToQueueAction = createAction({
    auth: simplyprintAuth,
    name: 'add_to_queue',
    displayName: 'Add File to Queue',
    description:
        'Add an existing file (API-uploaded or user-file) to the print queue. For uploading a new file at the same time, use "Upload File & Add to Queue".',
    props: {
        fileSource: Property.StaticDropdown<'apiFile' | 'userFile'>({
            displayName: 'File source',
            required: true,
            defaultValue: 'apiFile',
            options: {
                options: [
                    { label: 'API file (hex id from Upload File action)', value: 'apiFile' },
                    { label: 'User file (existing library file)', value: 'userFile' },
                ],
            },
        }),
        apiFileId: Property.ShortText({
            displayName: 'API file ID',
            description:
                'Hex id returned by Upload File. Required when source is "API file".',
            required: false,
        }),
        userFileUid: Property.ShortText({
            displayName: 'User file UID',
            description:
                'UID of an existing user-file (from "List Files"). Required when source is "User file". Accepts only the single file UID string.',
            required: false,
        }),
        groupId: queueGroupDropdown({ required: false }),
        amount: Property.Number({
            displayName: 'Quantity',
            description: 'Number of copies to queue (defaults to 1).',
            required: false,
            defaultValue: 1,
        }),
        position: queuePositionProp(),
        positionNumber: queuePositionNumberProp(),
        forPrinters: printerMultiSelectDropdown({
            required: false,
            displayName: 'Target printers',
            description:
                'Restrict this queue item to one or more specific printers. Leave empty to allow any eligible printer.',
        }),
        forModels: printerModelMultiSelectDropdown({ required: false }),
        customTags: tagMultiSelectDropdown({ required: false }),
        nozzleSize: nozzleSizeProp(),
        nozzleType: nozzleTypeProp(),
        nozzleVolumeType: nozzleVolumeTypeProp(),
        bedType: bedTypeDropdown(),
        customFields: Property.Object({
            displayName: 'Custom fields',
            description:
                'Optional. Object keyed by custom-field UUID (fieldId) → value. PRINT_QUEUE category is auto-applied.',
            required: false,
        }),
    },
    async run(context) {
        const source = context.propsValue.fileSource ?? 'apiFile';
        const body: Record<string, unknown> = {
            amount: context.propsValue.amount ?? 1,
            position: resolveQueuePosition(
                context.propsValue.position as string | undefined,
                context.propsValue.positionNumber as number | undefined,
            ),
        };

        if (context.propsValue.groupId) body['group'] = context.propsValue.groupId;

        if (source === 'apiFile') {
            const apiFileId = context.propsValue.apiFileId;
            if (!apiFileId) throw new Error('API file ID is required when source is "API file".');
            body['fileId'] = apiFileId;
        } else {
            const uid = context.propsValue.userFileUid;
            if (!uid) throw new Error('User file UID is required when source is "User file".');
            body['filesystem'] = uid;
        }

        const forPrinters = (context.propsValue.forPrinters ?? []) as number[];
        if (forPrinters.length > 0) body['for_printers'] = forPrinters.join(',');

        const forModels = (context.propsValue.forModels ?? []) as number[];
        if (forModels.length > 0) body['for_models'] = forModels.join(',');

        const tags = buildTagsBody({
            customTagIds: context.propsValue.customTags as number[] | undefined,
            nozzleSize: context.propsValue.nozzleSize as number | undefined,
            nozzleType: context.propsValue.nozzleType as string | undefined,
            nozzleVolumeType: context.propsValue.nozzleVolumeType as string | undefined,
            bedType: context.propsValue.bedType as string | undefined,
        });
        if (tags) body['tags'] = tags;

        const submissions = toSubmissionArray(context.propsValue.customFields ?? {});
        if (submissions.length > 0) body['custom_fields'] = submissions;

        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/AddItem',
            body,
        });
    },
});
