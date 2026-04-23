import { describe, it, expect } from 'vitest';

import { toSubmissionArray } from '../src/lib/common/custom-fields';

describe('toSubmissionArray', () => {
    it('returns [] for null / undefined / non-objects', () => {
        expect(toSubmissionArray(null)).toEqual([]);
        expect(toSubmissionArray(undefined)).toEqual([]);
        expect(toSubmissionArray({} as Record<string, unknown>)).toEqual([]);
        // Non-object inputs (e.g. accidental string) are treated as empty.
        expect(toSubmissionArray('not an object' as unknown as Record<string, unknown>)).toEqual([]);
    });

    it('maps string values to { string: value }', () => {
        expect(toSubmissionArray({ project: 'acme' })).toEqual([
            { customFieldId: 'project', value: { string: 'acme' } },
        ]);
    });

    it('maps numeric-looking strings to { number }', () => {
        expect(toSubmissionArray({ temp: '215' })).toEqual([
            { customFieldId: 'temp', value: { number: 215 } },
        ]);
        expect(toSubmissionArray({ temp: '-4.5' })).toEqual([
            { customFieldId: 'temp', value: { number: -4.5 } },
        ]);
    });

    it('does NOT coerce scientific or hex strings to numbers', () => {
        // 1e3 is valid Number() but we reject it via the strict regex — avoids
        // surprising the user when a field_id like "1e3" looks numeric.
        expect(toSubmissionArray({ code: '1e3' })).toEqual([
            { customFieldId: 'code', value: { string: '1e3' } },
        ]);
        expect(toSubmissionArray({ code: '0xff' })).toEqual([
            { customFieldId: 'code', value: { string: '0xff' } },
        ]);
    });

    it('maps raw numbers to { number }', () => {
        expect(toSubmissionArray({ temp: 215 })).toEqual([
            { customFieldId: 'temp', value: { number: 215 } },
        ]);
    });

    it('maps raw booleans and "true"/"false" strings to { boolean }', () => {
        expect(toSubmissionArray({ on: true })).toEqual([
            { customFieldId: 'on', value: { boolean: true } },
        ]);
        expect(toSubmissionArray({ on: 'true' })).toEqual([
            { customFieldId: 'on', value: { boolean: true } },
        ]);
        expect(toSubmissionArray({ on: 'FALSE ' })).toEqual([
            { customFieldId: 'on', value: { boolean: false } },
        ]);
    });

    it('maps Date instances to ISO { date } strings', () => {
        const d = new Date('2026-04-23T10:00:00.000Z');
        expect(toSubmissionArray({ deadline: d })).toEqual([
            { customFieldId: 'deadline', value: { date: '2026-04-23T10:00:00.000Z' } },
        ]);
    });

    it('maps arrays to { options } of stringified entries', () => {
        expect(toSubmissionArray({ tags: ['red', 'blue', 7] })).toEqual([
            { customFieldId: 'tags', value: { options: ['red', 'blue', '7'] } },
        ]);
    });

    it('maps null/undefined values to { string: "" }', () => {
        expect(toSubmissionArray({ note: null })).toEqual([
            { customFieldId: 'note', value: { string: '' } },
        ]);
        expect(toSubmissionArray({ note: undefined })).toEqual([
            { customFieldId: 'note', value: { string: '' } },
        ]);
    });

    it('preserves insertion order and keeps all keys except empty-string keys', () => {
        const result = toSubmissionArray({
            a: 'x',
            '': 'skipped',
            b: 1,
            c: true,
        });
        expect(result.map((r) => r.customFieldId)).toEqual(['a', 'b', 'c']);
    });

    it('accepts UUID-style custom field IDs (the expected production shape)', () => {
        const fieldId = '7d4e6f0a-9c3b-4b2a-8e1d-3c5a2b1f0d9e';
        expect(toSubmissionArray({ [fieldId]: 'PETG' })).toEqual([
            { customFieldId: fieldId, value: { string: 'PETG' } },
        ]);
    });
});
