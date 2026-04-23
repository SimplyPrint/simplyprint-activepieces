import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { fileDropdown } from '../common/props';

export const getFileAction = createAction({
    auth: simplyprintAuth,
    name: 'get_file',
    displayName: 'Get File',
    description: 'Fetch metadata for a single file by ID.',
    props: {
        fileId: fileDropdown({ required: true }),
    },
    async run(context) {
        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'files/Get',
            queryParams: { id: String(context.propsValue.fileId) },
        });
    },
});
