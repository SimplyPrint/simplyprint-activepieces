import { Property } from '@activepieces/pieces-framework';

/**
 * Optional slicer / print-time options passed to `printers/actions/CreateJob`.
 * The backend JSON-decodes this, so integrations stringify before sending.
 */
export interface StartOptions {
    nozzle?: string;
    filament_material?: string;
    print_speed?: string;
    layer_height?: string;
    infill?: string;
    quality?: string;
    [k: string]: unknown;
}

export function buildStartOptionsProp() {
    return Property.Object({
        displayName: 'Start options',
        description:
            'Optional slicer/print-time metadata (nozzle, filament_material, print_speed, layer_height, infill, quality). Arbitrary keys allowed.',
        required: false,
    });
}

/**
 * The CreateJob backend expects `start_options` as a JSON-encoded string.
 * Returns `null` when there is nothing to send so callers can omit the field
 * from the body instead of shipping `"null"`.
 */
export function normalizeStartOptions(
    raw: Record<string, unknown> | null | undefined,
): string | null {
    if (!raw || typeof raw !== 'object') return null;
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
        if (v === undefined || v === null || v === '') continue;
        cleaned[k] = v;
    }
    if (Object.keys(cleaned).length === 0) return null;
    return JSON.stringify(cleaned);
}
