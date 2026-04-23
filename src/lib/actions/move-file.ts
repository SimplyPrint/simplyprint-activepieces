import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { fileDropdown } from '../common/props';

export const moveFileAction = createAction({
    auth: simplyprintAuth,
    name: 'move_file',
    displayName: 'Move File',
    description: 'Move a file to a different folder.',
    props: {
        fileId: fileDropdown({ required: true }),
        targetFolderId: Property.Number({
            displayName: 'Target folder ID',
            description: 'Destination folder. Use 0 for the root folder.',
            required: true,
        }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'files/Move',
            body: {
                files: [context.propsValue.fileId],
                target: context.propsValue.targetFolderId,
            },
        });
    },
});
