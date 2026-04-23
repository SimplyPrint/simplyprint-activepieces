import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        include: ['**/*.test.ts'],
        environment: 'node',
        globals: false,
        root: resolve(__dirname),
    },
});
