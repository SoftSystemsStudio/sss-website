import { defineConfig, devices } from '@playwright/test';

/**
 * Browser smoke tests (e2e/). They run against the production build, so
 * `pnpm build` must have run first; CI builds the workspace before this step.
 *
 *   pnpm --filter frontend build
 *   pnpm --filter frontend test:e2e
 *
 * Fixed port so a stray `next dev` on 3000 is never picked up by mistake.
 */
const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm exec next start -p ${PORT} -H 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
