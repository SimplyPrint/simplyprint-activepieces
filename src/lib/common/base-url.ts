/**
 * Production endpoints. Swap to the `test.simplyprint.io` pair below during
 * end-to-end testing against the staging backend; `files` stays on the prod
 * bucket either way (globally shared; file ids are accepted by both API
 * endpoints; there is no `files.test.simplyprint.io`).
 */
export const BASE_URL = {
    api: 'https://simplyprint.io/api',
    panel: 'https://simplyprint.io',
    files: 'https://files.simplyprint.io',
    // api: 'https://test.simplyprint.io/api',
    // panel: 'https://test.simplyprint.io',
    // files: 'https://files.simplyprint.io',
} as const;

export type CompanyId = number;
