import { HttpMethod } from '@activepieces/pieces-common';

import { simplyprintCall } from './client';
import { Filament } from './types';

/**
 * Resolve a user-supplied filament identifier to its numeric spool ID.
 *
 * Accepts either:
 *   - A pure positive integer — treated as the spool's numeric `id` and
 *     returned as-is (no round-trip to the API).
 *   - Anything else — looked up against the company's spool list as a
 *     short ID (`uid`, the 4-character alphanumeric code printed on QR
 *     stickers / NFC tags). Match is case-insensitive.
 *
 * The lookup uses `filament/GetFilament` with `compact:true`, which returns
 * a flat list of spools restricted to AI-relevant fields. Throws when the
 * identifier doesn't resolve.
 *
 * Why client-side: `filament/GetFilament` doesn't expose a `uid` filter
 * server-side, only `pid` / `brand` / `material_type` / `color` / etc. A
 * dedicated lookup endpoint would be cheaper for huge accounts but the
 * compact response is small enough (a few hundred spools max in practice)
 * that one extra request when the user supplies a uid is fine.
 */
export async function resolveFilamentId(
    auth: unknown,
    identifier: string | number,
): Promise<number> {
    const raw = String(identifier ?? '').trim();
    if (!raw) throw new Error('Filament ID or short ID is required.');

    // Pure positive integer → assume it's the spool ID. Skip the lookup so
    // automation flows pulling a numeric id from a trigger pay nothing.
    if (/^\d+$/.test(raw)) {
        const n = parseInt(raw, 10);
        if (n > 0) return n;
    }

    const res = await simplyprintCall<{ filament: Record<string, Filament> | Filament[] }>({
        auth, method: HttpMethod.POST, path: 'filament/GetFilament',
        body: { compact: true },
    });
    const map = res.filament ?? {};
    const list = Array.isArray(map) ? map : Object.values(map);

    const lower = raw.toLowerCase();
    const found = list.find((f) => (f.uid ?? '').toLowerCase() === lower);
    if (!found) {
        throw new Error(
            `No filament found with short ID "${raw}" on this account. Pass either the numeric spool ID or the 4-character short ID printed on the QR sticker.`,
        );
    }
    return Number(found.id);
}
