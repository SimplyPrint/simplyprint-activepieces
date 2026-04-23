/**
 * Pointing at test.simplyprint.io for the initial end-to-end testing round
 * against activepieces.sp3d.io. Revert to the production URLs (commented below)
 * before bumping the piece version for public release or upstream PR.
 *
 * NOTE: `files` always targets the production files.simplyprint.io domain.
 * SimplyPrint's files API is a globally-shared service, and file ids are
 * accepted by both test and production API endpoints; there is no
 * files.test.simplyprint.io.
 */
export const BASE_URL = {
    api: 'https://test.simplyprint.io/api',
    panel: 'https://test.simplyprint.io',
    files: 'https://files.simplyprint.io',
    // api: 'https://simplyprint.io/api',
    // panel: 'https://simplyprint.io',
    // files: 'https://files.simplyprint.io',
} as const;

export type CompanyId = number;
