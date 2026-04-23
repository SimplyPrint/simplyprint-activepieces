# Changelog

All notable changes to `@activepieces/piece-simplyprint` are documented here.

## Unreleased

- Upload flow switched to `files.simplyprint.io` (the integration-reachable file-upload service). `Upload File` now returns a hex file id that downstream actions accept as `fileId` on `queue/AddItem` or `file_id` on `printers/actions/CreateJob`.
- New **Start Print** action wrapping `printers/actions/CreateJob`. Accepts three file sources: API file id (hex hash), user-file UID, or existing queue item id. Supports shared PRINT_JOB custom fields plus `individual_custom_fields`, `start_options`, and `mms_map`.
- New **Upload, Queue, and Print** composite action: single node that uploads, queues, and optionally starts a print on selected printers.
- **Add File to Queue** now offers a source dropdown (API file vs user-file) and accepts PRINT_QUEUE custom fields at creation time.
- **Set Custom Field Values** bug-fixed: values are now submitted as the backend-shape `[{customFieldId, value}]` array. `category` and `subCategory` are lowercase enums (`print`, `print_queue`, `print_job`, `user_file`, `printer`, `filament`, `user`) per the backend.
- **Upload File** now optionally accepts custom fields (USER_FILE scope).
- Custom-field dropdowns degrade gracefully on OAuth 403 until the backend flip lands.
- Added `custom_fields.write` to the OAuth scope list.

## 0.2.0

Initial public release.
