import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['tests/client/**', 'jsdom'],
      ['tests/server/**', 'node'],
    ],
    setupFiles: './tests/setup.ts',
  },
});
