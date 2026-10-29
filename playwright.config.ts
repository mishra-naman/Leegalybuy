import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list']],
  use: {
    launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] },
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PW_CHANNEL || 'chrome',
        viewport: { width: 1231, height: 791 },
      },
    },
  ],
  webServer: {
    command: `${process.platform === 'win32' ? 'npm.cmd' : 'npm'} run dev -- --port 5173`,
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
});
