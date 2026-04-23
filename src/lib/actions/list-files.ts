import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { PrintFile } from '../common/types';

export const listFilesAction = createAction({
    auth: simplyprintAuth,
    name: 'list_files',
    displayName: 'List Files',
    description: 'List files in your SimplyPrint account, optionally within a folder.',
    props: {
        folderId: Property.Number({
            displayName: 'Folder ID',
            description: 'Leave empty to list root-level files.',
            required: false,
        }),
    },
    async run(context) {
        const queryParams: Record<string, string> = {};
        if (context.propsValue.folderId) {
            queryParams['folder_id'] = String(context.propsValue.folderId);
        }
        const res = await simplyprintCall<{ data: PrintFile[] }>({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'files/Get',
            queryParams,
        });
        return (res.objects?.data ?? []) as PrintFile[];
    },
});
