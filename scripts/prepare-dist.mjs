// Post-build step that turns `dist/` into a publishable package root.
//
// Why this exists: Activepieces' REGISTRY piece installer hard-codes the
// entry point to `<pkg>/src/index.js` and ignores `package.json#main`.
// Publishing from the repo root with the conventional `tsc -> dist/` layout
// puts the compiled entry at `<pkg>/dist/src/index.js` in the tarball,
// which AP can't find (ERR_MODULE_NOT_FOUND at piece install time, masked
// as an unhelpful "Cannot read properties of undefined (reading 'code')"
// in the Platform Admin UI on AP 0.82.0).
//
// Workaround: publish `dist/` as the tarball root. After tsc emits JS into
// `dist/src/…`, this script writes a runtime-only `dist/package.json` and
// copies the user-facing docs next to it. The release workflow then does
// `npm publish ./dist`, so the installed tree becomes
// `node_modules/@simplyprint/activepieces-simplyprint/src/index.js` —
// matching the `@activepieces/piece-*` convention that AP's loader
// expects.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

if (!existsSync(dist)) {
    console.error(`[prepare-dist] ${dist} does not exist — run tsc first.`);
    process.exit(1);
}

// 1. Runtime-only package.json: strip build tooling so `npm publish ./dist`
//    doesn't try to re-run prepublishOnly / build, and consumers don't
//    install dev tooling. Rewrite main/types to the paths inside the
//    tarball (src/…) since dist/ becomes the package root on publish.
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const publishPkg = {
    ...pkg,
    main: './src/index.js',
    types: './src/index.d.ts',
};
// Drop fields that only make sense in the source-repo context.
delete publishPkg.scripts;
delete publishPkg.devDependencies;
delete publishPkg.files; // dist/ is already exactly what we want to ship

writeFileSync(join(dist, 'package.json'), JSON.stringify(publishPkg, null, 2) + '\n');

// 2. Copy docs so the npmjs.com package page renders with the same README
//    as GitHub, and LICENSE/CHANGELOG are discoverable inside the tarball.
for (const name of ['README.md', 'LICENSE', 'CHANGELOG.md']) {
    const src = join(root, name);
    if (existsSync(src)) copyFileSync(src, join(dist, name));
}

console.info(`[prepare-dist] dist/ ready for "npm publish ./dist"`);
