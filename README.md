# SimplyPrint piece for Activepieces

`@activepieces/piece-simplyprint` — connect SimplyPrint to thousands of apps via Activepieces.

[SimplyPrint](https://simplyprint.io) is a 3D printer management platform (queue, printer control, file/filament management, AI failure detection). This piece exposes SimplyPrint as triggers and actions inside the Activepieces flow builder.

## Connection

This piece uses **OAuth2**. When you create a SimplyPrint connection, you'll be redirected to `simplyprint.io` to approve access to your account. The connection refreshes automatically.

### Redirect URIs to whitelist

When registering the Activepieces OAuth application inside SimplyPrint, whitelist:

- `https://cloud.activepieces.com/redirect` (Activepieces Cloud)
- `https://<your-activepieces-host>/redirect` (self-hosted)

## Triggers

Each trigger subscribes to a specific SimplyPrint webhook event (see `WebhookEvent` in the SimplyPrint codebase for the full list). The piece registers a unique webhook per flow when you enable it, and unregisters it when you disable the flow.

Incoming payloads are verified against a per-webhook shared secret sent in the `X-SP-Secret` header (the secret is the secret itself, constant-time compared). Forged events are dropped silently.

## Actions

~30 hand-wrapped actions covering printer control, queue management, files, filaments, users/tags/custom fields, plus a generic **Custom API Call** action for any endpoint this piece doesn't wrap directly.

### Upload → Queue → Print

The hero flow for "I have a local file and I want it printed" is covered end-to-end:

- **Upload File** — push a local G-code/STL/3MF to SimplyPrint via the dedicated `files.simplyprint.io` files-upload API. Returns a string `fileId` (hex bucket hash). Requires the Print Farm plan.
- **Add File to Queue** — queue a file. Source is either an API file id (hex hash from Upload File) or an existing user-file UID. Accepts a `Custom fields` object (PRINT_QUEUE category is auto-applied).
- **Start Print** — wraps `printers/actions/CreateJob`. Pick one or more printers, choose a file source (API file id, user-file UID, or queue-item ID), and optionally send shared PRINT_JOB custom fields, per-queue-item `individual_custom_fields`, start options, and an MMS map.
- **Upload, Queue, and Print** — single composite action: uploads via the files API, adds to queue with `fileId`, and optionally starts a CreateJob using `queue_file`. Separate custom-field objects for PRINT_QUEUE (queue item) and PRINT_JOB (started job) so each scope lands on the right entity.

> **Two upload domains:** `api.simplyprint.io` (main API) serves reads, queue/job management, and printer control. `files.simplyprint.io` (dedicated file service) is where integrations upload files. The old `api.simplyprint.io/.../files/Upload` endpoint is reserved for the web panel and mobile app and rejects API-key/OAuth callers — the piece does not use it.

### Custom fields

Any action that accepts custom fields expects a **JSON object keyed by the custom field's string UUID (`fieldId`)**, not the numeric `id`. The numeric `id` is for admin CRUD only. Values can be strings, numbers, booleans, ISO dates, or arrays (for multi-option fields). The piece converts your object into the backend's `[{customFieldId, value}]` submission shape automatically.

You can look up `fieldId` UUIDs with the **List Custom Fields** action.

## Development

This piece is designed to live inside the [Activepieces monorepo](https://github.com/activepieces/activepieces) at `packages/pieces/community/simplyprint/`. The `package.json` uses `workspace:*` for the `@activepieces/*` dependencies, so a standalone install won't work — you need to symlink or drop the source into an AP monorepo checkout first.

**Option A: contribute upstream (preferred).** Clone the AP monorepo, drop this folder into `packages/pieces/community/simplyprint/`, register it in the root `tsconfig.base.json`, and open a PR against `activepieces/activepieces`. Once merged, updates ship to AP Cloud + every auto-syncing self-host.

**Option B: side-load on a self-hosted AP instance.** Build a `.tgz` with `npm run build && cd dist && npm pack`, then upload it via AP's admin piece-management endpoint on your instance.

**Option C: development in-place.** If you maintain a fork of the AP monorepo, clone it as a sibling of this folder and sync via rsync:

```sh
rsync -a --delete ./ ../activepieces/packages/pieces/community/simplyprint/
```

### Typecheck + lint locally

```sh
npm run build   # requires being inside an AP monorepo checkout
npm run lint
```

## License

MIT — see [LICENSE](./LICENSE).

## Related

- [SimplyPrint n8n node](https://github.com/SimplyPrint/n8n-nodes-simplyprint)
- [SimplyPrint Claude Code plugin](https://github.com/SimplyPrint/simplyprint-claude-plugin)
- [SimplyPrint API docs](https://apidocs.simplyprint.io)
