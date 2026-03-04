import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment-specific .env file based on SF_ENV
const sfEnv = process.env.SF_ENV;
const envFile = sfEnv ? `.env.${sfEnv}` : '.env';
dotenv.config({ path: path.resolve(__dirname, envFile) });

const isDocMode = process.env.CAPTURE_DOCS === 'true';
const hasSessionToken = !!process.env.SF_SESSION_ID;

export default defineConfig({
  testDir: './tests',
  fullyParallel: !isDocMode,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: isDocMode ? 1 : (process.env.CI ? 20 : undefined),
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-data/test-results.json' }],
    ['list'],
  ],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.SF_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        // Interactive login needs a visible browser; token-based can run headless
        headless: hasSessionToken,
      },
    },
    {
      name: 'smoke',
      testDir: './tests/smoke',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
    {
      name: 'regression',
      testDir: './tests/regression',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
    {
      name: 'visual',
      testDir: './tests/visual',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
    {
      name: 'unit',
      testDir: './tests/unit',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
