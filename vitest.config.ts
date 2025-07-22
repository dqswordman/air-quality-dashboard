import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['tests/client/**', 'jsdom'],
      ['tests/server/**', 'node'],
    ],
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      lines: 85,
    },
  },
});
