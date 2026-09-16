import { defineConfig } from '@playwright/test';

/**
 * Accessibility and layout checks run against the CONTRACT MOCK, not the live API.
 *
 * Two reasons. The live set changes between runs, so an assertion about it is a
 * flake waiting to happen. And the states where accessibility actually gets hard —
 * an unmeasured value, a band that cannot be carried by colour, a flag that could
 * not be evaluated — are mostly unreachable from live data: no monitored asset has
 * `bandConfidence: "full"`, and none currently answers `priceSource: "none"`.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    // Locally this uses the installed Google Chrome rather than downloading another
    // browser; CI installs Chromium instead, which is what the workflow provisions.
    ...(process.env.CI ? {} : { channel: 'chrome' as const }),
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm mock',
      url: 'http://localhost:4010/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'next dev --port 5173',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { NEXT_PUBLIC_KEEL_API_URL: 'http://localhost:4010' },
    },
  ],
});
