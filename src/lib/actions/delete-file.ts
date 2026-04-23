import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { fileDropdown } from '../common/props';

export const deleteFileAction = createAction({
    auth: simplyprintAuth,
    name: 'delete_file',
    displayName: 'Delete File',
    description: 'Permanently delete a file from SimplyPrint. Destructive — cannot be undone.',
    props: {
        fileId: fileDropdown({ required: true }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'files/Delete',
            body: { id: context.propsValue.fileId },
        });
    },
});
