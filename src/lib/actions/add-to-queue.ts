import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { fileDropdown, queueGroupDropdown } from '../common/props';
import { toSubmissionArray } from '../common/custom-fields';

export const addToQueueAction = createAction({
    auth: simplyprintAuth,
    name: 'add_to_queue',
    displayName: 'Add File to Queue',
    description:
        'Queue a file for printing. Source can be an API-uploaded file (from Upload File), an existing user-file, or an API file ID you already have.',
    props: {
        fileSource: Property.StaticDropdown<'apiFile' | 'userFile'>({
            displayName: 'File source',
            required: true,
            defaultValue: 'apiFile',
            options: {
                options: [
                    { label: 'API file (hash from Upload File)', value: 'apiFile' },
                    { label: 'User file (existing library file)', value: 'userFile' },
                ],
            },
        }),
        apiFileId: Property.ShortText({
            displayName: 'API file ID',
            description:
                'Hex hash returned by Upload File. Required when source is "API file".',
            required: false,
        }),
        userFileId: fileDropdown({ required: false }),
        groupId: queueGroupDropdown({ required: true }),
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
            group: context.propsValue.groupId,
            amount: context.propsValue.amount ?? 1,
            position: context.propsValue.position ?? 'bottom',
        };

        if (source === 'apiFile') {
            const apiFileId = context.propsValue.apiFileId;
            if (!apiFileId) throw new Error('API file ID is required when source is "API file".');
            body['fileId'] = apiFileId;
        } else {
            const uid = context.propsValue.userFileId;
            if (!uid) throw new Error('User file is required when source is "User file".');
            body['filesystem'] = uid;
        }

        const submissions = toSubmissionArray(context.propsValue.customFields ?? {});
        if (submissions.length > 0) {
            body['custom_fields'] = submissions;
        }

        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'queue/AddItem',
            body,
        });
    },
});
