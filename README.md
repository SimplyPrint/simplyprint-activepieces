# SimplyPrint piece for Activepieces

`@simplyprint/activepieces-simplyprint` — connect SimplyPrint to thousands of apps via Activepieces.

[SimplyPrint](https://simplyprint.io) is a 3D printer management platform (queue, printer control, file/filament management, AI failure detection). This piece exposes SimplyPrint as triggers and actions inside the Activepieces flow builder.

## Install

Self-hosted Activepieces (Community Edition or Enterprise):

1. Sign in as a Platform Admin.
2. **Platform Admin → Pieces → Install a piece**.
3. Package type: **NPM Registry**.
4. Piece name: `@simplyprint/activepieces-simplyprint`.
5. Version: latest (check [npmjs.com/package/@simplyprint/activepieces-simplyprint](https://www.npmjs.com/package/@simplyprint/activepieces-simplyprint)) or leave blank for the latest stable.
6. Click **Install**. The piece appears in the flow builder search after a few seconds.

Activepieces Cloud (cloud.activepieces.com) users: not available as a first-party piece yet. Open an issue on this repo if you want it prioritized for upstream submission.

## Connection

This piece uses **OAuth2**. Activepieces ships with SimplyPrint client credentials pre-configured, so users just click **Connect**, get redirected to `simplyprint.io`, approve, and the flow builder has a live token. The connection refreshes automatically.

The SimplyPrint OAuth app accepts any callback URI, so self-hosted Activepieces instances work out of the box — no per-instance allowlist needed.

## Triggers

Each trigger subscribes to a specific SimplyPrint webhook event (see `WebhookEvent` in the SimplyPrint codebase for the full list). The piece registers a unique webhook per flow when you enable it, and unregisters it when you disable the flow.

Incoming payloads are verified against a per-webhook shared secret sent in the `X-SP-Secret` header (the secret is the secret itself, constant-time compared). Forged events are dropped silently.

## Actions

~30 hand-wrapped actions covering printer control, queue management, files, filaments, users/tags/custom fields, plus a generic **Custom API Call** action for any endpoint this piece doesn't wrap directly.

### Upload → Queue → Print

The "I have a local file and I want it printed" flow is three composable actions. Chain whichever subset you need:

- **Upload File** — push a local G-code/STL/3MF to SimplyPrint via `files.simplyprint.io`. Returns a string `fileId` (hex). Requires the Print Farm plan.
- **Add File to Queue** — queue an *existing* file (API file id from Upload File, or a user-file UID). Accepts queue group, target printers, tags, and PRINT_QUEUE custom fields. Insert at top, bottom, or a specific position.
- **Upload File & Add to Queue** — composite of the two above when the file isn't on SimplyPrint yet. Same queue options.
- **Start Print** — wraps `printers/actions/CreateJob`. Pick printers, choose a source (API file id, user-file UID, or queue-item id), and optionally pass shared PRINT_JOB custom fields, per-queue-item `individual_custom_fields`, start options, and an MMS map.

Queue-add actions accept `for_printers` / `tags` / position (top, bottom, or a 1-based index). Start Print owns start options + which printers to fire on.

> **Two upload domains:** `api.simplyprint.io` (main API) serves reads, queue/job management, and printer control. `files.simplyprint.io` (dedicated file service) is where integrations upload files. The old `api.simplyprint.io/.../files/Upload` endpoint is reserved for the web panel and mobile app and rejects API-key/OAuth callers — the piece does not use it.

### Custom fields

Any action that accepts custom fields expects a **JSON object keyed by the custom field's string UUID (`fieldId`)**, not the numeric `id`. The numeric `id` is for admin CRUD only. Values can be strings, numbers, booleans, ISO dates, or arrays (for multi-option fields). The piece converts your object into the backend's `[{customFieldId, value}]` submission shape automatically.

You can look up `fieldId` UUIDs with the **List Custom Fields** action.

## Development

The piece builds standalone against published `@activepieces/*` deps — no AP monorepo required:

```sh
npm install
npm run build         # tsc -p tsconfig.lib.json → dist/
cd tests && npm test  # framework-free vitest suite
```

Publishing is handled by the release workflow (`.github/workflows/release.yml`): tag a version (`git tag v0.5.4 && git push --tags`) and GitHub Actions builds, tests, `npm publish --provenance`'s it via npm Trusted Publishing, and cuts a GitHub Release with the `.tgz` attached.

### Working inside the Activepieces monorepo (optional)

If you're iterating against the AP engine itself and want hot reload, drop this repo into `packages/pieces/community/simplyprint/` of an `activepieces/activepieces` checkout and run:

```sh
nx build pieces-simplyprint
nx lint pieces-simplyprint
```

`package.json` pins concrete published versions for the `@activepieces/*` deps; bun's workspace resolution will still hand out the in-tree packages when the versions match.

### Upstreaming

To ship through AP Cloud + every self-hosted instance, fork `activepieces/activepieces` and submit a PR adding `packages/pieces/community/simplyprint/`. The piece needs no changes beyond renaming `package.json.name` to `@activepieces/piece-simplyprint`.

## License

MIT — see [LICENSE](./LICENSE).

## Related

- [SimplyPrint n8n node](https://github.com/SimplyPrint/n8n-nodes-simplyprint)
- [SimplyPrint Claude Code plugin](https://github.com/SimplyPrint/simplyprint-claude-plugin)
- [SimplyPrint API docs](https://apidocs.simplyprint.io)
