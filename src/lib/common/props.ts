import { Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from './client';
import { Printer, QueueGroup, PrintFile, Filament, Tag, CustomField, QueueItem } from './types';

const unauth = (label: string) => ({
    disabled: true,
    options: [],
    placeholder: `Connect your SimplyPrint account to load ${label}.`,
});

export const printerDropdown = (options: { required?: boolean; displayName?: string } = {}) =>
    Property.Dropdown<number>({
        auth: simplyprintAuth,
        displayName: options.displayName ?? 'Printer',
        description: 'Pick a printer from your account.',
        required: options.required ?? true,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) return unauth('printers');
            try {
                const res = await simplyprintCall<{ data: Printer[] }>({
                    auth, method: HttpMethod.GET, path: 'printers/Get',
                });
                const printers = (res.objects?.data ?? []) as Printer[];
                return {
                    disabled: false,
                    options: printers.map((p) => ({
                        label: p.name + (p.model ? ` (${p.model})` : ''),
                        value: p.id,
                    })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const queueGroupDropdown = (options: { required?: boolean } = {}) =>
    Property.Dropdown<number>({
        auth: simplyprintAuth,
        displayName: 'Queue group',
        description: 'Which queue group to target. Leave empty for the default group.',
        required: options.required ?? false,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) return unauth('queue groups');
            try {
                const res = await simplyprintCall<{ data: QueueGroup[] }>({
                    auth, method: HttpMethod.GET, path: 'queue/GetQueueGroups',
                });
                const groups = (res.objects?.data ?? []) as QueueGroup[];
                return {
                    disabled: false,
                    options: groups.map((g) => ({ label: g.name, value: g.id })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const fileDropdown = (options: { required?: boolean } = {}) =>
    Property.Dropdown<number>({
        auth: simplyprintAuth,
        displayName: 'File',
        description: 'Pick a file from your account.',
        required: options.required ?? true,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) return unauth('files');
            try {
                const res = await simplyprintCall<{ data: PrintFile[] }>({
                    auth, method: HttpMethod.GET, path: 'files/Get',
                });
                const files = (res.objects?.data ?? []) as PrintFile[];
                return {
                    disabled: false,
                    options: files.map((f) => ({ label: f.name, value: f.id })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const queueItemDropdown = (options: { required?: boolean } = {}) =>
    Property.Dropdown<number>({
        auth: simplyprintAuth,
        displayName: 'Queue item',
        required: options.required ?? true,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) return unauth('queue items');
            try {
                const res = await simplyprintCall<{ data: QueueItem[] }>({
                    auth, method: HttpMethod.GET, path: 'queue/Get',
                });
                const items = (res.objects?.data ?? []) as QueueItem[];
                return {
                    disabled: false,
                    options: items.map((i) => ({
                        label: i.file_name ?? `Queue item #${i.id}`,
                        value: i.id,
                    })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const filamentDropdown = (options: { required?: boolean } = {}) =>
    Property.Dropdown<number>({
        auth: simplyprintAuth,
        displayName: 'Filament',
        required: options.required ?? true,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) return unauth('filaments');
            try {
                const res = await simplyprintCall<{ data: Filament[] }>({
                    auth, method: HttpMethod.GET, path: 'filament/Get',
                });
                const filaments = (res.objects?.data ?? []) as Filament[];
                return {
                    disabled: false,
                    options: filaments.map((f) => ({
                        label: [f.brand, f.material, f.name].filter(Boolean).join(' '),
                        value: f.id,
                    })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const tagDropdown = (options: { required?: boolean } = {}) =>
    Property.Dropdown<number>({
        auth: simplyprintAuth,
        displayName: 'Tag',
        required: options.required ?? true,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) return unauth('tags');
            try {
                const res = await simplyprintCall<{ data: Tag[] }>({
                    auth, method: HttpMethod.GET, path: 'tags/Get',
                });
                const tags = (res.objects?.data ?? []) as Tag[];
                return {
                    disabled: false,
                    options: tags.map((t) => ({ label: t.name, value: t.id })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const customFieldDropdown = (options: { required?: boolean; entity?: string } = {}) =>
    Property.Dropdown<number>({
        auth: simplyprintAuth,
        displayName: 'Custom field',
        required: options.required ?? true,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) return unauth('custom fields');
            try {
                const res = await simplyprintCall<{ data: CustomField[] }>({
                    auth, method: HttpMethod.GET, path: 'custom_fields/Get',
                });
                let fields = (res.objects?.data ?? []) as CustomField[];
                if (options.entity) fields = fields.filter((f) => f.entity === options.entity);
                return {
                    disabled: false,
                    options: fields.map((f) => ({
                        label: `${f.name} (${f.field_type})`,
                        value: f.id,
                    })),
                };
            } catch (e) {
                const msg = (e as Error).message ?? '';
                if (/\b403\b|forbidden|oauth/i.test(msg)) {
                    return {
                        disabled: true,
                        options: [],
                        placeholder:
                            'Custom-field dropdown requires API-key auth today. Use List Custom Fields to look up IDs, or switch credential to API key.',
                    };
                }
                return { disabled: true, options: [], placeholder: msg };
            }
        },
    });

export const printerMultiSelectDropdown = (options: { required?: boolean; displayName?: string } = {}) =>
    Property.MultiSelectDropdown<number>({
        auth: simplyprintAuth,
        displayName: options.displayName ?? 'Printers',
        description: 'Pick one or more printers from your account.',
        required: options.required ?? true,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) return unauth('printers');
            try {
                const res = await simplyprintCall<{ data: Printer[] }>({
                    auth, method: HttpMethod.GET, path: 'printers/Get',
                });
                const printers = (res.objects?.data ?? []) as Printer[];
                return {
                    disabled: false,
                    options: printers.map((p) => ({
                        label: p.name + (p.model ? ` (${p.model})` : ''),
                        value: p.id,
                    })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

// Re-export so actions/triggers can consume the auth type alongside these dropdowns.
export { simplyprintAuth };
