/**
 * Shared helpers for building SimplyPrint custom-field submission payloads.
 *
 * Every endpoint that accepts custom-field values (`queue/AddItem`,
 * `printers/actions/CreateJob`, `files/Upload`, `custom_fields/SubmitValues`)
 * expects the same shape:
 *
 *   [{ customFieldId: "<uuid string>", value: { string?|number?|boolean?|date?|options?[] } }]
 *
 * `customFieldId` is the **string UUID `fieldId`** — not the numeric `id`.
 */

export type CustomFieldScalar = string | number | boolean | Date | null | undefined;
export type CustomFieldInputValue = CustomFieldScalar | CustomFieldScalar[];

export interface CustomFieldValueSubmission {
    customFieldId: string;
    value: {
        string?: string;
        number?: number;
        boolean?: boolean;
        date?: string;
        options?: string[];
    };
}

function coerceValue(raw: unknown): CustomFieldValueSubmission['value'] {
    if (raw === null || raw === undefined) return { string: '' };

    if (Array.isArray(raw)) {
        return { options: raw.map((v) => String(v)) };
    }

    if (raw instanceof Date) {
        return { date: raw.toISOString() };
    }

    switch (typeof raw) {
        case 'boolean':
            return { boolean: raw };
        case 'number':
            return { number: raw };
        case 'string': {
            const trimmed = raw.trim();
            if (trimmed === 'true') return { boolean: true };
            if (trimmed === 'false') return { boolean: false };
            if (trimmed !== '' && !Number.isNaN(Number(trimmed)) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
                return { number: Number(trimmed) };
            }
            return { string: raw };
        }
        default:
            return { string: String(raw) };
    }
}

/**
 * Convert a user-friendly `{ fieldId: value }` object (as produced by
 * Property.Object in the AP UI) into the backend's array submission shape.
 * Entries with an undefined or empty-string key are dropped.
 */
export function toSubmissionArray(
    input: Record<string, unknown> | null | undefined,
): CustomFieldValueSubmission[] {
    if (!input || typeof input !== 'object') return [];
    const out: CustomFieldValueSubmission[] = [];
    for (const [fieldId, value] of Object.entries(input)) {
        if (!fieldId) continue;
        out.push({ customFieldId: String(fieldId), value: coerceValue(value) });
    }
    return out;
}
