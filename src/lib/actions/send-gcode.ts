import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from '../common/client';
import { printerDropdown } from '../common/props';

export const sendGcodeAction = createAction({
    auth: simplyprintAuth,
    name: 'send_gcode',
    displayName: 'Send G-code',
    description: 'Send raw G-code commands to an operational printer (requires Print Farm plan).',
    props: {
        printerId: printerDropdown({ required: true }),
        gcode: Property.Array({
            displayName: 'G-code lines',
            description: 'One G-code command per entry, e.g. "G28", "M104 S200".',
            required: true,
        }),
    },
    async run(context) {
        const gcode = (context.propsValue.gcode ?? []) as string[];
        if (gcode.length === 0) throw new Error('Provide at least one G-code line.');
        if (gcode.length > 200) throw new Error('Up to 200 G-code lines per request.');

        return await simplyprintCall({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'printers/actions/SendGcode',
            queryParams: { pid: String(context.propsValue.printerId) },
            body: { gcode },
        });
    },
});
