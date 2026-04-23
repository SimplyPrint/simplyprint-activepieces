import { defineConfig } from 'vitest/config';

// We deliberately bypass the parent package's tsconfig.json because it
// extends the Activepieces monorepo's tsconfig.base.json, which isn't
// present in standalone checkouts. The tests only exercise framework-free
// pure functions, so a minimal inline compiler config is sufficient.
export default defineConfig({
    esbuild: {
        tsconfigRaw: {
            compilerOptions: {
                target: 'es2022',
                module: 'esnext',
                moduleResolution: 'bundler',
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                isolatedModules: true,
            },
        },
    },
    test: {
        include: ['**/*.test.ts'],
        environment: 'node',
        globals: false,
    },
});
