import { defineConfig, expect } from '@playwright/test';

require('dotenv').config();

const toMatchSchema = require('./lib/utils/expect-schema');
expect.extend(toMatchSchema);

process.env.PLAYWRIGHT_EXPERIMENTAL_FEATURES = '1';

const credentials = {
  user: process.env.TEST_USER_EMPLOYEE,
  password: process.env.TEST_PASSWORD,
};

export default defineConfig({
  timeout: process.env.CI ? 180000 : 90000,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['allure-playwright',
      {
        environmentInfo: {
          E2E_NODE_VERSION: process.version,
          E2E_OS: process.platform,
        },
        failTestOnFailedStep: true,
      },
    ],
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports' }],
  ],

  projects: [
    {
      name: 'api',
      testMatch: '**/api/*/*.api.test.js',
      fullyParallel: true,
      workers: process.env.CI ? 10 : 3,
      use: {
        baseURL: process.env.EMPLOYEE_MANAGEMENT_API,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
    {
      name: 'e2e',
      outputDir: 'test-results',
      testMatch: '**/e2e/*/*.e2e.test.js',
      fullyParallel: true,
      workers: process.env.CI ? 8 : 5,
      use: {
        credentials,
        baseURL: process.env.EMPLOYEE_MANAGEMENT_E2E,
        browsers: ['chromium'],
        viewport: { width: 1440, height: 900 },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        video: 'retain-on-failure',
        bypassCSP: true,
        actionTimeout: 30000,
        navigationTimeout: 60000,
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
          headless: !!process.env.CI,
        },
      },
    },
  ],

  expect: {
    timeout: process.env.CI ? 45000 : 15000,
  },
});
