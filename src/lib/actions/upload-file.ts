import { createAction, Property } from '@activepieces/pieces-framework';

import { simplyprintAuth } from '../auth';
import { uploadUserFile } from '../common/files';

/**
 * Upload a file (G-code, STL, 3MF) into SimplyPrint via the API files
 * service (files.simplyprint.io). Returns a string file id (hex bucket
 * hash) that can be used as `fileId` on Add File to Queue or `file_id` on
 * Start Print.
 */
export const uploadFileAction = createAction({
    auth: simplyprintAuth,
    name: 'upload_file',
    displayName: 'Upload File',
    description:
        'Upload a file to SimplyPrint (max 100 MB per part). Returns the API file id — pass it to "Add File to Queue" or "Start Print" later.',
    props: {
        file: Property.File({
            displayName: 'File',
            description: 'File data (G-code, STL, 3MF).',
            required: true,
        }),
    },
    async run(context) {
        const file = context.propsValue.file;
        if (!file) throw new Error('No file provided.');

        const { fileId, name, size, expiresAt, raw } = await uploadUserFile({
            auth: context.auth,
            file: { filename: file.filename, data: file.data },
        });

        return { fileId, name, size, expiresAt, raw };
    },
});
