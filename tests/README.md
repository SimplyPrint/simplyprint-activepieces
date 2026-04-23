# Unit tests

Standalone test runner for `@activepieces/piece-simplyprint`.

The main `package.json` uses `workspace:*` for Activepieces framework dependencies, which blocks a plain `npm install` outside the AP monorepo. Tests live here so they can run with just `vitest` + `typescript` installed — no framework required.

Covered units (framework-free pure helpers only):

- `src/lib/common/custom-fields.ts` → `toSubmissionArray` — payload coercion for every endpoint that accepts `custom_fields`.
- `src/lib/common/signature.ts` → `generateWebhookSecret`, `verifySimplyprintSignature`, `extractSecretHeader` — webhook signature handling.

Actions, triggers, and helpers that depend on the AP framework context (`createAction`, `httpClient`, `Property.*`, etc.) are covered upstream by AP's integration test harness and are not re-tested here.

## Run

```sh
cd tests
npm install
npm test
```

Or in watch mode during development:

```sh
npm run test:watch
```

## Adding a test

1. Drop `<name>.test.ts` in this folder.
2. Import only from `../src/lib/common/<file>.ts` — helpers that do not transitively import `@activepieces/*`.
3. Run `npm test` to verify.

If you need to test a file that imports from the framework, either add it to the upstream AP test suite or extract the pure logic into `common/` first.
