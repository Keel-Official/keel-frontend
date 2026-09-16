import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.pnpm-store/**',
    '.artifacts/**',
    'test-results/**',
    'playwright-report/**',
    // keel-web is a separate app with its own flat config.
    'keel-web/**',
  ]),
]);

export default eslintConfig;
