import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const mode = process.env.PW_MODE ?? 'preview';

const isDevMode = mode === 'dev';

const port = isDevMode ? 5173 : 4173;
const host = '127.0.0.1';
const baseURL = `http://${host}:${port}`;

const webServerCommand = isDevMode
  ? `npm run dev -- --host ${host} --port ${port}`
  : `npm run build && npm run preview -- --host ${host} --port ${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: isCI ? 1 : undefined,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
  },
});
