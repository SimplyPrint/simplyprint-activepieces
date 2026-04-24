# Changelog

All notable changes to `@simplyprint/activepieces-simplyprint` are documented here.

## 0.5.7

- **Fix: tarball layout so AP's piece installer can actually find the entry point.** Activepieces' REGISTRY installer (`piece-install-service.ts`) hard-codes the path `<pkg>/src/index.js` and ignores `package.json#main`. Our 0.5.4–0.5.6 tarballs placed the compiled entry at `<pkg>/dist/src/index.js`, so every install attempt from the Platform Admin UI threw `ERR_MODULE_NOT_FOUND`, which AP's error handler on 0.82.0 then re-threw as an unrelated "Cannot read properties of undefined (reading 'code')" — an unhelpful 500 that masked the real cause.
- **Publish layout**: build now emits into `dist/` and publishes `dist/` as the tarball root (matching the `@activepieces/piece-*` convention). New `scripts/prepare-dist.mjs` writes a runtime-only `dist/package.json` (metadata + deps, no scripts, no devDependencies) with `main`/`types` pointing at `./src/index.js` / `./src/index.d.ts`, copies README/LICENSE/CHANGELOG next to it, and the release workflow does `npm publish ./dist`. Result: installed tree is `node_modules/@simplyprint/activepieces-simplyprint/src/index.js`, which the AP installer can resolve.
- **Dropped the diagnostic `Debug OIDC claims` step** from `.github/workflows/release.yml` now that Trusted Publishing is confirmed working. Retained for history in the 0.5.6 commit if needed.
- **No piece-level functional changes** vs 0.5.6. Same chunked + streaming upload behavior, same API surface, same OAuth config.

## 0.5.6

- First release published from the CI Release workflow via npm Trusted Publishing (OIDC). 0.5.4 was seeded on npm by a manual `npm publish` to bootstrap the package name; 0.5.5 was an aborted CI attempt (trusted-publisher / `repository.url` shape still being dialed in on the npm side, never landed on the registry); 0.5.6 is the first successful CI release. From here on, all releases go through `.github/workflows/release.yml` triggered by a `v*.*.*` tag push. No functional changes vs 0.5.4.

## 0.5.4

- **Published to npm as `@simplyprint/activepieces-simplyprint`.** Self-hosted Activepieces installs can now pull the piece straight from the registry (Platform Admin → Pieces → Install a piece → NPM Registry → `@simplyprint/activepieces-simplyprint` → version). No fork-and-build required.
- **Package renamed** from `@activepieces/piece-simplyprint` to `@simplyprint/activepieces-simplyprint`. The piece's internal name is derived from `package.json`, so existing flows on any instance that installed the old `.tgz` directly will need to be rebuilt against the new piece identity; flows on instances pulling from the new npm package are unaffected.
- **Workspace deps unpinned to published versions**: `@activepieces/pieces-framework ^0.28.1`, `@activepieces/pieces-common ^0.12.3`, `@activepieces/shared ^0.67.1`. Matches AP 0.82.0 (the current floor for our V2 context usage). Standalone `npm install && npm run build` now works without cloning the AP monorepo.
- **Release workflow** (`.github/workflows/release.yml`): tag push (`v*.*.*`) triggers build + test + `npm publish --provenance` via npm Trusted Publishing (OIDC; no long-lived token). Prerelease tags (e.g. `0.6.0-beta.1`) publish under the `beta` dist-tag so `npm install <pkg>` keeps serving the last stable. GitHub Release auto-created with auto-generated notes and the .tgz attached.
- **No functional changes** — this release exists to establish the npm distribution path for the private beta. Features from 0.5.3 (chunked uploads, URL streaming, Filename override) carry forward unchanged.

## 0.5.3

- **Chunked uploads for files over 100 MiB.** `Upload File` and `Upload File & Add to Queue` now send the input in 95 MiB parts (5 MiB headroom under the server cap) via the `totalSize` + `continueToken` protocol documented on `files.simplyprint.io`. Small files stay single-shot.
- **Memory-safe streaming uploads via HTTPS URL.** New optional `File URL` input on both actions — the piece `fetch()`es the URL and streams its body directly into the chunked upload with ~95 MiB peak RAM regardless of source size. Use this for multi-hundred-MB / GB slicer files from cloud storage. The URL must return a `Content-Length` header (S3 pre-signed, Dropbox raw, etc.); missing/invalid Content-Length fails loudly rather than buffering. The existing `File` input still works and is fine for builder-picked files, but comes with AP's hard limit: the engine's file-property processor materializes the full payload into RAM before `run()` starts, so `File` uploads keep the whole payload in memory during transfer; `File URL` does not.
- **New optional `Filename` input on both upload actions** — free-text override for the name stored on SimplyPrint. Extension must match the actual content (backend infers file type from the extension, not the bytes). Required with `File URL` unless the URL path ends in a filename with an extension; optional with `File` (defaults to source filename).
- **Buffered and streaming drivers share one state machine** in `common/chunked-upload.ts` — framework-free, unit-tested in `tests/chunked-upload.test.ts` (22 cases: single-shot, multi-chunk token threading, short-tail, zero-copy slicing, under-/overcounted Content-Length detection, boundary-spanning source pieces, small-piece coalescing, protocol-violation errors). `files.ts` is a thin `sendPart` wrapper.
- **Resilience check on Content-Length**: streamed uploads validate bytes-sent == declared totalSize AND drain the source after the last part to detect undercounting. Silent truncation is not possible.

## 0.5.2

- **Expand Tags coverage on queue-add actions** to match the full backend `TagData` schema. New props:
  - **Tags: Nozzle type** — StaticDropdown of the 7 `NozzleType` enum values (Standard/Brass, Plated Brass, Hardened Steel, Stainless Steel, Tungsten Carbide, Ruby Tipped, Hemispherical).
  - **Tags: Nozzle volume type** — StaticDropdown of the 2 `NozzleVolumeType` enum values (Standard, High Flow).
  - **Tags: Bed type** — was a free-text slug, now a live dropdown sourced from `printers/GetBedTypes` that combines the built-in types (auto-filtered to your printer brands/models) with any custom bed types the account has configured. Option values are tagged `enum:<slug>` or `custom:<id>` and routed into the right field on `TagBedType` at submission.
  - **Tags: Custom tags** — now prefixed `Tags:` for visual grouping with the rest.
  - All tag props default to empty so gcode auto-tagging stays the primary path.
- **`buildTagsBody()` upgrade** — size + type + volume-type collapse into a single `nozzleData[0]` entry (preferred modern shape) instead of the deprecated legacy `nozzle` float. Bed type parsing handles both `enum:<slug>` and `custom:<id>` option values.
- **Drop the inconsistent "(optional)" label suffix on "Target printers"** — Activepieces shows "Optional" automatically next to non-required fields, so the explicit suffix was redundant and only appeared on one of the two targeting fields. Both "Target printers" and "Target printer models" now have clean labels + descriptions explaining leave-empty behaviour.
- Skipped this pass: multi-nozzle `nozzleData[]` arrays and the `material[]` array (filament profile / color / width per extruder). Both need their own dropdown backends (`FilamentProfile` list endpoint, per-extruder UX) — follow-up ticket.

## 0.5.1

- Correct trademark casing of **AutoPrint** in user-visible trigger display names and descriptions (was "Autoprint"). Internal identifiers (backend event strings, published snake_case `name`s, response JSON field names) stay lowercase — they're wire identifiers, not trademark references.

## 0.5.0

- **All 62 webhook events now shipped as triggers**, matching the n8n node's coverage. Full list lives in `lib/triggers/_catalog.ts` — one table-driven entry per `WebhookEvent` enum case (excluding the internal `test` debug event). New categories: bed cleared, objects skipped, printer state changes (AutoPrint / nozzle size / material / tags / out-of-order), company AutoPrint toggle, queue delete / empty / move / revive, filament CRUD, AI state / false-positive / AutoPrint max cycles, organization user signup & pending, 4 balance events, 4 quota events, 20 maintenance events (job lifecycle, problems, tasks, schedules, spare parts, stock). The 15 per-trigger files are deleted; their published `name`s are preserved in the catalog so existing flows don't break.
- **Fix queue-groups dropdown showing "no groups" when groups exist.** `queue/groups/Get` returns the groups under `list` (not `data`). Also surface `groups_exist: true` + empty list as a distinct placeholder ("groups exist but you don't have access to any"), which can happen with restricted user permissions.
- **Fix broken custom-tag assignment.** Backend's `queue/AddItem` `tags` param is a composite object (`{custom: [ids], nozzle, bedType: {type}}`) — the piece was sending a bare array, which `TagAssigningController::tagAssignFromPost` silently ignored. Custom tags have never actually been attached to queue items via the piece; they are now.
- **New "Nozzle size (mm)" and "Bed type" inputs** on `Add File to Queue` + `Upload File & Add to Queue`. Both leave-empty-to-auto-derive from gcode. Bed type accepts a `BedTypeEnum` slug (free text — kept as a string rather than a 50-option dropdown that would drift from the backend enum).
- **"Tags" dropdown → "Custom tags"** with clearer description ("leave empty to auto-tag from the gcode file"). `tagMultiSelectDropdown` renamed in the UI only; import name is unchanged.

## 0.4.3

- Trigger `test()` now requests `limit=5` from `webhooks/GetSamplePayload` and returns every sample, so the Activepieces flow builder shows the last handful of real events to map against instead of just one. Falls back to the single static `_samples.ts` entry if the backend doesn't support the endpoint.

## 0.4.2

- **Live sample data in the flow builder.** Trigger `test()` now fetches a realistic payload from `GET /api/{company}/webhooks/GetSamplePayload?event=<event>&limit=1` instead of returning the static `_samples.ts` mock. Response shape is byte-identical to a real delivery (only `webhook_id` is forced to `0` for samples). Users see actual-production-shape data when they click "Load sample data" in the Activepieces flow builder, eliminating the drift-from-real-webhook class of bug. The static `_samples.ts` entry is retained as a graceful fallback for older backends / scope errors / network failures.

## 0.4.1

- **Fix "Tags" dropdown (was always empty).** Endpoint is `tags/Get` which was right, but it returns `{tags: [...]}` not `{data: [...]}`, and responds with `status:false` + a message when the account has zero custom tags. Both read-paths fixed and the empty-state is now surfaced as a clear placeholder in the dropdown and as `[]` from the `List Tags` action.
- **New "Target printer models" multi-select** on `Add File to Queue` + `Upload File & Add to Queue`. Derived on the fly from each printer's embedded `printer.model` (no new backend endpoint needed). Maps to `for_models` on `queue/AddItem`.
- **Remove broken File dropdown.** Accounts can have thousands of files in nested folders — a dropdown is the wrong shape. The user-file source on `Add File to Queue` is now a text field for the user-file UID string (matches what the backend actually accepts — `filesystem` is a string UID, not a numeric id — so the dropdown was also the wrong type). Use "List Files" to look up UIDs.
- **Fix "List Files"** endpoint path: `files/Get` (404) → `files/GetFiles`. Query param is `f` (folder id, -1 = all, 0 = root) not `folder_id`. Added optional `search` and `globalSearch` props.
- **Fix "Move File"** endpoint: path was `files/Move` (non-existent) → `files/MoveFiles`. Method was POST → GET with comma-separated `files` + `folder` query params. Input is now a text field for UID(s), comma-separated to move multiple.
- **Remove "Get File" action.** No single-file-fetch endpoint exists for OAuth callers on the backend. Use `List Files` with a `search` to locate a file.
- **Remove "Delete File" action.** `files/DeleteFile` is OAuth-disabled server-side (`$oauth_disabled = true`), so the action would always 403. Will return when the backend grants OAuth access.

## 0.4.0

- **Removed "Trigger Test Webhook" action.** Wasn't useful inside a flow builder — a debug-oriented endpoint that doesn't belong as a user-facing automation step. Users who had flows referencing it will need to remove that step.
- **Split "Upload, Queue, and Print" into composable actions.** The old composite did too much. Now there are three clean actions:
  - **Upload File** — unchanged (uploads a local file, returns hex file id).
  - **Add File to Queue** — existing file (API file id or user-file) → queue. Now accepts target printers, tags, specific insert position, and custom fields.
  - **Upload File & Add to Queue** — composite of upload + queue when the file isn't on SimplyPrint yet. Same queue options.
  - **Start Print** — unchanged (queue-item / user-file / API-file → CreateJob with start options, printers, MMS map, custom fields).
  - **Breaking**: existing flows using the old "Upload, Queue, and Print" will still load (same action id) but the print-start step is no longer bundled — chain **Start Print** after to restore the behavior.
- **Fix `queueGroupDropdown` path.** Was calling `queue/GetQueueGroups` (404). Correct path is `queue/groups/Get`. Dropdown now also shows a clear empty-state when the account has no queue groups and clarifies that the field is required when groups exist.
- **Fix `printerDropdown` / `printerMultiSelectDropdown` labels.** Were reading `p.name` / `p.model`, which don't exist on `printers/Get` — printer fields are nested under `.printer`. Labels are now `Name (#id)` sourced from `p.printer.name`. `Printer` TypeScript type updated to the real shape.
- **New queue-add props**: `for_printers` (multi-select), `tags` (multi-select via new `tagMultiSelectDropdown`), specific insert position (picker + number). Map 1:1 to `queue/AddItem`'s `for_printers`, `tags`, `position` params.
- Known limitation: `for_models` and `for_groups` (queue-item targets by printer model / printer group) aren't exposed in this release — the corresponding list endpoints aren't OAuth-reachable. Will ship in a follow-up once the backend lists are available.

## 0.3.8

- Rewrite webhook `sampleData` against the real PHP formatter output (`ecosystem/app/Helpers/Webhook/Formatter/*.php` + entity `getFormattedData()` methods). Several wrapper keys and inner fields were fabricated and didn't exist on the real payload — e.g. `queue_item.file_name` should be `queue_item.filename`, `queue_item.group_id` should be `queue_item.group`, Queue Item Approved wraps under `approved_by` not `user`, Queue Item Denied has `denied_by`/`reason`/`removed` not `user`, Maintenance Job Overdue wraps under `job` not `maintenance_job`, Print Paused/Resumed only include `{job}` (not `{job, user}`), `user.name`/`user.email` don't exist (real fields are `first_name`/`last_name`/`avatar`/`sso`). Users' existing flows that reference the old sample paths will need to repoint to the correct fields.

## 0.3.7

- Finish the response-envelope sweep: `upload-and-queue.ts` had two residual `queueResp.objects` / `startResp.objects` reads that TS rejected against the flattened `SimplyprintResponse<T>` type. Replaced with direct top-level reads on the response (same pattern as `start-print.ts`).

## 0.3.6

- **Response envelope fix (big one).** The SimplyPrint backend flattens `$this->objects` into the top-level response body via `array_merge` in `AjaxBaseController::respond()`, so fields like `data`, `webhook`, `user` sit at the top level alongside `status`, **not** nested under `objects`. Our client was reading `res.objects?.data` / `res.objects?.webhook?.id` which was always `undefined`. Consequences of the bug: all list actions (printers, files, filaments, tags, custom fields, queue, queue-groups, pending-queue) returned empty arrays; all webhook trigger registrations threw "SimplyPrint did not return a webhook id" *after* successfully creating a webhook on SP's side, leaving zombies. Fixed by rewriting `SimplyprintResponse<T>` as `{ status; message? } & T` and sweeping 18 call-sites.

## 0.3.5

- Fix OAuth2 URLs. `authUrl` is `/panel/oauth2/authorize` (integration client registry; the `Pattern()` helper prepends `/panel`), and `tokenUrl` is `/api/0/oauth2/Token`. The previous `/oauth/authorize` + `/oauth/token` routed to SimplyPrint's MCP Dynamic Client Registration flow, which uses a different client registry and rejected the pre-registered integration client with "Unknown OAuth client".

## 0.3.4

- `Property.Dropdown` / `Property.MultiSelectDropdown` declarations use `<number, boolean, typeof simplyprintAuth>` — the `required` factory argument is a `boolean`, so a literal second generic can't narrow it. Matches the AP framework idiom and fixes type inference on the options callback. Removed the `name` field on `createPiece` (derived from `package.json`).
- OAuth2-only authentication. The API-key path is removed for v1; a future release may reintroduce it via a unified connection picker.
- Upload flow switched to `files.simplyprint.io` (the integration-reachable file-upload service). **Upload File** now returns a hex file id that downstream actions accept as `fileId` on `queue/AddItem` or `file_id` on `printers/actions/CreateJob`.
- New **Start Print** action wrapping `printers/actions/CreateJob`. Accepts three file sources: API file id (hex hash), user-file UID, or existing queue item id. Supports shared PRINT_JOB custom fields plus `individual_custom_fields`, `start_options`, and `mms_map`.
- New **Upload, Queue, and Print** composite action: single node that uploads, queues, and optionally starts a print on selected printers.
- **Add File to Queue** now offers a source dropdown (API file vs user-file) and accepts PRINT_QUEUE custom fields at creation time.
- **Set Custom Field Values** bug-fixed: values are now submitted as the backend-shape `[{customFieldId, value}]` array. `category` and `subCategory` are lowercase enums (`print`, `print_queue`, `print_job`, `user_file`, `printer`, `filament`, `user`) per the backend.
- **Upload File** now optionally accepts custom fields (USER_FILE scope).
- Custom-field dropdowns degrade gracefully when the backend returns 403 for OAuth callers.
- Webhook triggers now implement `test()` so the flow builder shows a sample payload before the first live event.
- Dropdown props now declare `refreshers: ['auth']` so option lists reload on connection change.

## 0.2.0

Initial public release.
