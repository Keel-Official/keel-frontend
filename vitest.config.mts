import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      // The server-side API reader, replaced by a double that answers "not
      // reached". The real module opens with `import 'server-only'`, which throws
      // outside a React Server Component, and every function in it performs a real
      // HTTP request; a unit suite that depends on a deployment being up is not a
      // unit suite. tests/doubles/keel-server.ts says why the unreachable answer is
      // the case worth pinning. The pattern matches the relative spellings
      // components use as well as the `@/` one.
      {
        find: /^(?:@\/|(?:\.\.\/)+)lib\/keel\/api\/server$/,
        replacement: fileURLToPath(
          new URL('./tests/doubles/keel-server.ts', import.meta.url),
        ),
      },
      // The same `@/*` alias tsconfig defines. Vitest does not read tsconfig paths,
      // so without this a test importing a page fails on the page's own imports
      // rather than on anything the test is checking. It is LAST because an alias
      // list is matched in order, and `@/lib/keel/api/server` has to reach the
      // entry above before this one rewrites its prefix.
      { find: '@', replacement: fileURLToPath(new URL('.', import.meta.url)) },
    ],
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
  },
});
