import { Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintAuth } from '../auth';
import { simplyprintCall } from './client';
import { Printer, QueueGroup, Filament, Tag, CustomField, QueueItem } from './types';

const unauth = (label: string) => ({
    disabled: true,
    options: [],
    placeholder: `Connect your SimplyPrint account to load ${label}.`,
});

/**
 * Build a stable printer label. `printers/Get` nests printer fields under
 * `.printer`, and the default response does not include a `groupName` field —
 * just the group id. We display the printer name with a `#id` suffix for
 * disambiguation when names collide (common in multi-bay setups: "A", "B" …).
 */
function printerLabel(p: Printer): string {
    const name = p.printer?.name ?? `Printer #${p.id}`;
    return `${name} (#${p.id})`;
}

export const printerDropdown = (options: { required?: boolean; displayName?: string } = {}) =>
    Property.Dropdown<number, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: options.displayName ?? 'Printer',
        description: 'Pick a printer from your account.',
        required: options.required ?? true,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('printers');
            try {
                const res = await simplyprintCall<{ data: Printer[] }>({
                    auth, method: HttpMethod.GET, path: 'printers/Get',
                });
                const printers = (res.data ?? []) as Printer[];
                return {
                    disabled: false,
                    options: printers.map((p) => ({ label: printerLabel(p), value: p.id })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const queueGroupDropdown = (options: { required?: boolean } = {}) =>
    Property.Dropdown<number, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: 'Queue group',
        description:
            'Which queue group to add the item to. Required if your account has queue groups configured. Leave empty only if no queue groups exist.',
        required: options.required ?? false,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('queue groups');
            try {
                // `queue/groups/Get` returns the groups under `list`, plus a
                // `groups_exist` boolean. We surface the distinction: if the
                // company has groups but the user has no access to any of
                // them, the list is empty but `groups_exist` is true — show
                // a different placeholder in that case.
                const res = await simplyprintCall<{ list?: QueueGroup[]; groups_exist?: boolean }>({
                    auth, method: HttpMethod.GET, path: 'queue/groups/Get',
                });
                const groups = (res.list ?? []) as QueueGroup[];
                if (groups.length === 0) {
                    const placeholder = res.groups_exist
                        ? 'Queue groups exist but you don\'t have access to any of them.'
                        : 'No queue groups configured — leave this field empty.';
                    return { disabled: true, options: [], placeholder };
                }
                return {
                    disabled: false,
                    options: groups.map((g) => ({ label: g.name, value: g.id })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const queueItemDropdown = (options: { required?: boolean } = {}) =>
    Property.Dropdown<number, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: 'Queue item',
        required: options.required ?? true,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('queue items');
            try {
                const res = await simplyprintCall<{ data: QueueItem[] }>({
                    auth, method: HttpMethod.GET, path: 'queue/GetItems',
                });
                const items = (res.data ?? []) as QueueItem[];
                return {
                    disabled: false,
                    options: items.map((i) => ({
                        label: i.filename ?? i.file_name ?? `Queue item #${i.id}`,
                        value: i.id,
                    })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const filamentDropdown = (options: { required?: boolean } = {}) =>
    Property.Dropdown<number, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: 'Filament',
        required: options.required ?? true,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('filaments');
            try {
                const res = await simplyprintCall<{ data: Filament[] }>({
                    auth, method: HttpMethod.GET, path: 'filament/Get',
                });
                const filaments = (res.data ?? []) as Filament[];
                return {
                    disabled: false,
                    options: filaments.map((f) => ({
                        label: [f.brand, f.material, f.name].filter(Boolean).join(' ') || `Filament #${f.id}`,
                        value: f.id,
                    })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

/**
 * `tags/Get` returns `{tags: [...]}` (not `{data: [...]}`) and responds with
 * `status:false` + a message when the account has no custom tags — so we
 * swallow that specific failure as an empty-state placeholder.
 */
async function loadCompanyTags(auth: unknown): Promise<
    | { ok: true; tags: Tag[] }
    | { ok: false; placeholder: string }
> {
    try {
        const res = await simplyprintCall<{ tags: Tag[] }>({
            auth, method: HttpMethod.GET, path: 'tags/Get',
        });
        return { ok: true, tags: (res.tags ?? []) as Tag[] };
    } catch (e) {
        const msg = (e as Error).message ?? '';
        if (/no custom tags/i.test(msg)) {
            return { ok: false, placeholder: 'This account has no custom tags — create one in SimplyPrint first.' };
        }
        return { ok: false, placeholder: msg };
    }
}

export const tagDropdown = (options: { required?: boolean } = {}) =>
    Property.Dropdown<number, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: 'Tag',
        required: options.required ?? true,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('tags');
            const r = await loadCompanyTags(auth);
            if (!r.ok) return { disabled: true, options: [], placeholder: r.placeholder };
            return {
                disabled: false,
                options: r.tags.map((t) => ({ label: t.name, value: t.id })),
            };
        },
    });

export const tagMultiSelectDropdown = (
    options: { required?: boolean; displayName?: string; description?: string } = {},
) =>
    Property.MultiSelectDropdown<number, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: options.displayName ?? 'Tags: Custom tags',
        description:
            options.description ??
            'Custom tags to apply. Leave empty to auto-tag from the gcode file (if applicable).',
        required: options.required ?? false,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('tags');
            const r = await loadCompanyTags(auth);
            if (!r.ok) return { disabled: true, options: [], placeholder: r.placeholder };
            return {
                disabled: false,
                options: r.tags.map((t) => ({ label: t.name, value: t.id })),
            };
        },
    });

/**
 * Nozzle-size prop paired with `buildTagsBody()`. Combined with the
 * nozzle type / volume-type props, contributes to a single-entry
 * `nozzleData` array for nozzle index 0.
 */
export const nozzleSizeProp = () =>
    Property.Number({
        displayName: 'Tags: Nozzle size (mm)',
        description:
            'Target nozzle diameter, e.g. `0.4`. Leave empty to auto-tag from the gcode file.',
        required: false,
    });

/**
 * Nozzle-type prop. Values are the `NozzleType` enum slugs.
 */
export const nozzleTypeProp = () =>
    Property.StaticDropdown<string>({
        displayName: 'Tags: Nozzle type',
        description: 'Nozzle material. Leave empty to auto-tag from the gcode file.',
        required: false,
        options: {
            options: [
                { label: 'Standard (Brass)', value: 'standard' },
                { label: 'Plated Brass', value: 'plated_brass' },
                { label: 'Hardened Steel', value: 'hardened_steel' },
                { label: 'Stainless Steel', value: 'stainless_steel' },
                { label: 'Tungsten Carbide', value: 'tungsten_carbide' },
                { label: 'Ruby Tipped', value: 'ruby_tipped' },
                { label: 'Hemispherical', value: 'hemispherical' },
            ],
        },
    });

/**
 * Nozzle volume-type prop. Values are the `NozzleVolumeType` enum slugs.
 */
export const nozzleVolumeTypeProp = () =>
    Property.StaticDropdown<string>({
        displayName: 'Tags: Nozzle volume type',
        description: 'Nozzle flow category. Leave empty to auto-tag from the gcode file.',
        required: false,
        options: {
            options: [
                { label: 'Standard', value: 'standard' },
                { label: 'High Flow', value: 'high_flow' },
            ],
        },
    });

/**
 * Bed-type dropdown backed by `printers/GetBedTypes`. Lists both the default
 * built-in types (filtered by the company's printer brands/models) and any
 * custom bed types the company has configured. Option values are tagged with
 * an `enum:` or `custom:` prefix so `buildTagsBody()` can route them to the
 * correct field on `TagBedType`.
 */
export const bedTypeDropdown = () =>
    Property.Dropdown<string, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: 'Tags: Bed type',
        description:
            'Printer bed surface. Leave empty to auto-tag from the gcode file.',
        required: false,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('bed types');
            try {
                const res = await simplyprintCall<{
                    bedTypes?: Array<{ type?: string; fullName?: string }>;
                    customBedTypes?: Array<{ id?: number; name?: string }>;
                }>({
                    auth, method: HttpMethod.GET, path: 'printers/GetBedTypes',
                });
                const defaults = (res.bedTypes ?? [])
                    .filter((b) => b.type)
                    .map((b) => ({
                        label: b.fullName ?? (b.type as string),
                        value: `enum:${b.type}`,
                    }));
                const customs = (res.customBedTypes ?? [])
                    .filter((b) => typeof b.id === 'number')
                    .map((b) => ({
                        label: `${b.name ?? `#${b.id}`} (custom)`,
                        value: `custom:${b.id}`,
                    }));
                const all = [...defaults, ...customs];
                if (all.length === 0) {
                    return {
                        disabled: true,
                        options: [],
                        placeholder:
                            'No bed types available for your printers — the gcode analyzer will auto-tag on upload.',
                    };
                }
                return { disabled: false, options: all };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

/**
 * Build the `tags` body field for `queue/AddItem`. Backend's tag-assignment
 * path (TagAssigningController::tagAssignFromPost + TagData schema) accepts:
 *   - `custom` (array of tag IDs)
 *   - `nozzle` (legacy float shorthand)
 *   - `nozzleData` (array of {type, volumeType, size, i}) — preferred
 *   - `bedType.type` (BedTypeEnum slug) OR `bedType.custom` (CustomBedType id)
 * Returns `undefined` when the caller has nothing to send so callers can
 * omit the field entirely.
 */
export function buildTagsBody(input: {
    customTagIds?: number[];
    nozzleSize?: number;
    nozzleType?: string;
    nozzleVolumeType?: string;
    /** Either `enum:<slug>`, `custom:<id>`, or a bare BedTypeEnum slug. */
    bedType?: string;
}): Record<string, unknown> | undefined {
    const tags: Record<string, unknown> = {};

    if (input.customTagIds && input.customTagIds.length > 0) {
        tags['custom'] = input.customTagIds;
    }

    const hasNozzleSize = typeof input.nozzleSize === 'number' && input.nozzleSize > 0;
    const hasNozzleType = typeof input.nozzleType === 'string' && input.nozzleType.length > 0;
    const hasNozzleVolumeType =
        typeof input.nozzleVolumeType === 'string' && input.nozzleVolumeType.length > 0;
    if (hasNozzleSize || hasNozzleType || hasNozzleVolumeType) {
        const entry: Record<string, unknown> = { i: 0 };
        if (hasNozzleSize) entry['size'] = input.nozzleSize;
        if (hasNozzleType) entry['type'] = input.nozzleType;
        if (hasNozzleVolumeType) entry['volumeType'] = input.nozzleVolumeType;
        tags['nozzleData'] = [entry];
    }

    if (input.bedType && input.bedType.trim().length > 0) {
        const raw = input.bedType.trim();
        if (raw.startsWith('custom:')) {
            const id = parseInt(raw.slice('custom:'.length), 10);
            if (Number.isFinite(id) && id > 0) tags['bedType'] = { custom: id };
        } else {
            const slug = raw.startsWith('enum:') ? raw.slice('enum:'.length) : raw;
            if (slug.length > 0) tags['bedType'] = { type: slug };
        }
    }

    return Object.keys(tags).length > 0 ? tags : undefined;
}

export const customFieldDropdown = (options: { required?: boolean; entity?: string } = {}) =>
    Property.Dropdown<number, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: 'Custom field',
        required: options.required ?? true,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('custom fields');
            try {
                const res = await simplyprintCall<{ data: CustomField[] }>({
                    auth, method: HttpMethod.GET, path: 'custom_fields/Get',
                });
                let fields = (res.data ?? []) as CustomField[];
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
                            'Custom-field endpoints are not yet granted to OAuth tokens. Use List Custom Fields to look up IDs.',
                    };
                }
                return { disabled: true, options: [], placeholder: msg };
            }
        },
    });

/**
 * Multi-select of printer models in use on the company. Derived from the
 * `printers/Get` response (each record has `printer.model` populated by
 * `PrinterModel::getFormattedData`) — no dedicated list endpoint needed.
 */
export const printerModelMultiSelectDropdown = (
    options: { required?: boolean; displayName?: string; description?: string } = {},
) =>
    Property.MultiSelectDropdown<number, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: options.displayName ?? 'Target printer models',
        description:
            options.description ??
            'Restrict to printers of specific models. Leave empty to auto-tag from the gcode file (if applicable). Built from the models your printers are using.',
        required: options.required ?? false,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('printer models');
            try {
                const res = await simplyprintCall<{ data: Printer[] }>({
                    auth, method: HttpMethod.GET, path: 'printers/Get',
                });
                const printers = (res.data ?? []) as Printer[];
                const seen = new Map<number, string>();
                for (const p of printers) {
                    const m = p.printer?.model;
                    if (typeof m?.id === 'number' && !seen.has(m.id)) {
                        const label = [m.brand, m.name].filter(Boolean).join(' ') || `Model #${m.id}`;
                        seen.set(m.id, label);
                    }
                }
                if (seen.size === 0) {
                    return {
                        disabled: true,
                        options: [],
                        placeholder: 'No printer models detected — add a printer first.',
                    };
                }
                return {
                    disabled: false,
                    options: Array.from(seen.entries()).map(([id, label]) => ({ label, value: id })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

export const printerMultiSelectDropdown = (
    options: { required?: boolean; displayName?: string; description?: string } = {},
) =>
    Property.MultiSelectDropdown<number, boolean, typeof simplyprintAuth>({
        auth: simplyprintAuth,
        displayName: options.displayName ?? 'Printers',
        description: options.description ?? 'Pick one or more printers from your account.',
        required: options.required ?? true,
        refreshers: ['auth'],
        options: async ({ auth }) => {
            if (!auth) return unauth('printers');
            try {
                const res = await simplyprintCall<{ data: Printer[] }>({
                    auth, method: HttpMethod.GET, path: 'printers/Get',
                });
                const printers = (res.data ?? []) as Printer[];
                return {
                    disabled: false,
                    options: printers.map((p) => ({ label: printerLabel(p), value: p.id })),
                };
            } catch (e) {
                return { disabled: true, options: [], placeholder: (e as Error).message };
            }
        },
    });

/**
 * Position picker for queue inserts: top / bottom / specific (1-based number).
 * Backend accepts `"top"`, `"bottom"`, or a numeric string. Pair this with
 * `queuePositionNumberProp` and resolve via `resolveQueuePosition()` below.
 */
export const queuePositionProp = () =>
    Property.StaticDropdown({
        displayName: 'Insert at',
        description: 'Where in the queue to place the new item.',
        required: false,
        defaultValue: 'bottom',
        options: {
            options: [
                { label: 'Bottom of queue (default)', value: 'bottom' },
                { label: 'Top of queue', value: 'top' },
                { label: 'Specific position', value: 'specific' },
            ],
        },
    });

export const queuePositionNumberProp = () =>
    Property.Number({
        displayName: 'Position number',
        description:
            'Only used when "Insert at" is "Specific position". 1-based index (1 = very top). Requires queue-reorder permission.',
        required: false,
    });

export function resolveQueuePosition(
    picker: string | undefined,
    specificNumber: number | undefined,
): string {
    const v = picker ?? 'bottom';
    if (v === 'top' || v === 'bottom') return v;
    if (v === 'specific') {
        if (typeof specificNumber !== 'number' || specificNumber < 1) {
            throw new Error(
                '"Position number" is required (1 or greater) when "Insert at" is set to "Specific position".',
            );
        }
        return String(Math.floor(specificNumber));
    }
    return 'bottom';
}

export { simplyprintAuth };
