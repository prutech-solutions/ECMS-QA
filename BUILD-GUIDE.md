# Salesforce Playwright QA Regression Testing Framework — Build Guide

> **Purpose**: Hand this document to an AI assistant to recreate this Salesforce QA testing framework from scratch. It contains every architectural decision, file, pattern, and lesson learned.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Directory Structure](#2-architecture--directory-structure)
3. [Step 1 — Initialize the Project](#3-step-1--initialize-the-project)
4. [Step 2 — TypeScript Configuration](#4-step-2--typescript-configuration)
5. [Step 3 — Environment Configuration](#5-step-3--environment-configuration)
6. [Step 4 — Playwright Configuration](#6-step-4--playwright-configuration)
7. [Step 5 — Salesforce Wait Helpers (Critical)](#7-step-5--salesforce-wait-helpers-critical)
8. [Step 6 — Page Objects](#8-step-6--page-objects)
9. [Step 7 — Component Objects](#9-step-7--component-objects)
10. [Step 8 — Helper Utilities](#10-step-8--helper-utilities)
11. [Step 9 — Custom Playwright Fixtures](#11-step-9--custom-playwright-fixtures)
12. [Step 10 — Authentication](#12-step-10--authentication)
13. [Step 11 — Writing Tests (Patterns & Conventions)](#13-step-11--writing-tests-patterns--conventions)
14. [Step 12 — Documentation Capture & Report Generation](#14-step-12--documentation-capture--report-generation)
15. [Step 13 — CI/CD with GitHub Actions](#15-step-13--cicd-with-github-actions)
16. [Step 14 — Git Configuration](#16-step-14--git-configuration)
17. [Module-Based Test Organization](#17-module-based-test-organization)
18. [HTML Report System — Module Dashboard & Summary Views](#18-html-report-system--module-dashboard--summary-views)
19. [Salesforce-Specific Lessons Learned](#19-salesforce-specific-lessons-learned)
20. [Quick Start Checklist](#20-quick-start-checklist)

---

## 1. Project Overview

This is a **Playwright-based QA regression testing framework** built specifically for **Salesforce Lightning Experience**. It is object-agnostic (works with any standard or custom Salesforce object) and designed for enterprise QA teams managing test cases across multiple modules.

### Key Design Decisions

- **User-story-driven tests**, not CRUD-based — tests describe what a user accomplishes, not database operations
- **Object-agnostic page objects** — `RecordFormPage`, `ListViewPage`, `RecordDetailPage` work with ANY Salesforce object
- **No passwords stored anywhere** — interactive login for local dev (supports SSO/MFA), session token for CI
- **Multi-environment support** — `.env`, `.env.sandbox`, `.env.dev`, `.env.prod` with `SF_ENV` variable to switch
- **20 parallel workers** in CI for speed, sequential mode for documentation capture
- **Documentation generation** — tests double as training guides with step-by-step screenshots
- **Module-based organization** — tests are grouped by Salesforce module (Budget, Attendance, Enrollment, etc.) for reporting and tracking

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Test runner | Playwright (`@playwright/test ^1.50.0`) |
| Language | TypeScript 5.7+ (`strict: true`) |
| Runtime | Node.js 20+ with `tsx` for TypeScript execution |
| Environment | `dotenv` for multi-environment config |
| Reports | Custom Python HTML generator + Playwright built-in HTML report |
| CI/CD | GitHub Actions (smoke on push, regression nightly) |
| Salesforce API (optional) | `jsforce ^3.6.0` for data setup/teardown |

---

## 2. Architecture & Directory Structure

```
project-root/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
│
├── src/                              # All source code
│   ├── config/
│   │   └── environments.ts           # Multi-environment .env loader
│   ├── types/
│   │   └── environment.types.ts      # TypeScript interfaces
│   ├── fixtures/
│   │   └── salesforce.fixture.ts     # Custom Playwright fixtures (THE import for all tests)
│   ├── pages/                        # Page Object Model
│   │   ├── base.page.ts              # Base class — navigation, waits, toasts, fields
│   │   ├── login.page.ts             # Authentication (frontdoor.jsp + interactive)
│   │   ├── list-view.page.ts         # List view operations
│   │   ├── record-form.page.ts       # Create/edit form interactions
│   │   ├── record-detail.page.ts     # Record detail page (read, inline edit, actions)
│   │   └── components/
│   │       ├── toast.component.ts    # Toast notification assertions
│   │       ├── modal.component.ts    # Modal/dialog interactions
│   │       └── related-list.component.ts  # Related list operations
│   └── helpers/
│       ├── wait-helpers.ts           # 4-phase Salesforce wait strategy (CRITICAL)
│       ├── iframe-helpers.ts         # Visualforce iframe handling
│       ├── navigation-helpers.ts     # App Launcher, tab nav, URL nav
│       └── doc-capture.ts            # Screenshot & metadata capture for reports
│
├── tests/                            # Test files
│   ├── auth.setup.ts                 # Authentication setup (runs before all test projects)
│   ├── smoke/                        # Fast smoke tests
│   │   └── [module]-*.spec.ts
│   ├── regression/                   # Full regression tests organized by module
│   │   ├── budget/
│   │   │   └── budget-*.spec.ts
│   │   ├── attendance/
│   │   │   └── attendance-*.spec.ts
│   │   ├── enrollment/
│   │   ├── screening/
│   │   ├── incident/
│   │   ├── invoice/
│   │   ├── seat-capacity/
│   │   ├── monitoring-coaching/
│   │   ├── checklist/
│   │   └── [more modules]/
│   └── unit/                         # Unit tests for helpers (no Salesforce needed)
│       └── wait-helpers.spec.ts
│
├── scripts/
│   └── auth-interactive.ts           # Interactive login helper
│
├── docs/
│   ├── scripts/
│   │   └── generate-reports.py       # HTML report generator
│   └── output/                       # Generated HTML reports
│
├── .github/workflows/
│   ├── ci.yml                        # Smoke tests on push/PR
│   ├── regression-nightly.yml        # Nightly regression (Mon-Fri 2am UTC)
│   └── generate-docs.yml             # Manual documentation generation
│
├── screenshots/                      # Generated screenshots (gitignored)
│   └── .gitkeep
├── test-data/                        # Generated test metadata (gitignored)
│   └── .gitkeep
└── playwright/
    └── .auth/user.json               # Cached session (gitignored)
```

---

## 3. Step 1 — Initialize the Project

### package.json

```json
{
  "name": "salesforce-qa-testing",
  "version": "1.0.0",
  "description": "Reusable Playwright-based QA testing framework for Salesforce",
  "scripts": {
    "auth": "npx tsx scripts/auth-interactive.ts",
    "test": "npx playwright test",
    "test:smoke": "npx playwright test --project=smoke",
    "test:regression": "npx playwright test --project=regression",
    "test:visual": "npx playwright test --project=visual",
    "test:sandbox": "SF_ENV=sandbox npx playwright test",
    "test:dev": "SF_ENV=dev npx playwright test",
    "test:prod": "SF_ENV=prod npx playwright test",
    "test:document": "CAPTURE_DOCS=true npx playwright test --workers=1; python3 docs/scripts/generate-reports.py",
    "test:headed": "npx playwright test --headed",
    "test:debug": "npx playwright test --debug",
    "test:ui": "npx playwright test --ui",
    "report": "npx playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@types/node": "^25.3.2",
    "dotenv": "^16.4.7",
    "tsx": "^4.21.0",
    "typescript": "^5.7.0"
  },
  "optionalDependencies": {
    "jsforce": "^3.6.0"
  }
}
```

### Install

```bash
npm install
npx playwright install chromium
```

Only Chromium is needed — Salesforce Lightning targets Chrome.

---

## 4. Step 2 — TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@config/*": ["src/config/*"],
      "@fixtures/*": ["src/fixtures/*"],
      "@helpers/*": ["src/helpers/*"],
      "@pages/*": ["src/pages/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "playwright.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Key decisions**:
- `module: "NodeNext"` — required for Playwright + TypeScript ESM compatibility
- Path aliases (`@pages/*`, `@helpers/*`, etc.) — cleaner imports but note that Playwright resolves these via tsconfig, NOT via bundler
- All imports must end in `.js` extension (e.g., `from './base.page.js'`) even though the source files are `.ts` — this is a NodeNext requirement

---

## 5. Step 3 — Environment Configuration

### .env.example

```bash
# Salesforce Environment Configuration
# Copy this file to .env, .env.sandbox, .env.dev, or .env.prod
# Set SF_ENV to choose which file to load (default: no suffix -> .env)

# Required: Your Salesforce org URL
SF_BASE_URL=https://your-org.lightning.force.com

# Login URL (standard Salesforce login or your SSO/custom domain)
SF_LOGIN_URL=https://login.salesforce.com

# --- Authentication ---
# LOCAL: Run `npm run auth` to log in interactively. No credentials needed here.
# CI:   Set SF_SESSION_ID as a GitHub secret (from Salesforce session or Connected App).
# SF_SESSION_ID=

# Documentation mode (set automatically by npm run test:document)
# CAPTURE_DOCS=true
```

### src/types/environment.types.ts

```typescript
export interface SalesforceEnvironment {
  baseUrl: string;
  loginUrl: string;
  /** Salesforce session ID — used for CI or token-based auth */
  sessionId?: string;
}

export interface TestConfig {
  environment: SalesforceEnvironment;
  captureDocsEnabled: boolean;
  envName: string;
}
```

### src/config/environments.ts

```typescript
import * as dotenv from 'dotenv';
import * as path from 'path';
import type { SalesforceEnvironment, TestConfig } from '../types/environment.types.js';

function loadEnvFile(): string {
  const sfEnv = process.env.SF_ENV || '';
  const envFile = sfEnv ? `.env.${sfEnv}` : '.env';
  const envPath = path.resolve(process.cwd(), envFile);
  dotenv.config({ path: envPath });
  return sfEnv || 'default';
}

export function getEnvironment(): SalesforceEnvironment {
  return {
    baseUrl: requireEnv('SF_BASE_URL'),
    loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    sessionId: process.env.SF_SESSION_ID,
  };
}

export function getTestConfig(): TestConfig {
  const envName = loadEnvFile();
  return {
    environment: getEnvironment(),
    captureDocsEnabled: process.env.CAPTURE_DOCS === 'true',
    envName,
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Check your .env file or set SF_ENV to load the correct config.`
    );
  }
  return value;
}
```

**How multi-environment works**: Set `SF_ENV=sandbox` to load `.env.sandbox`. Default loads `.env`. The `npm run test:sandbox` / `test:dev` / `test:prod` scripts set this automatically.

---

## 6. Step 4 — Playwright Configuration

### playwright.config.ts

```typescript
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
```

**Key decisions**:
- `fullyParallel: !isDocMode` — sequential for doc capture (screenshots must be deterministic), parallel otherwise
- `workers: 20` in CI — Salesforce handles parallel sessions well
- `retries: 2` in CI, `0` locally — Salesforce can be flaky in CI due to network timing
- `timeout: 60_000` — Salesforce pages can be slow; 60s per test is safe
- `actionTimeout: 15_000` — individual clicks/fills timeout at 15s
- `navigationTimeout: 30_000` — page navigations timeout at 30s
- **setup project** — runs `auth.setup.ts` before smoke/regression, headless when using session token, headed for interactive login
- **storageState** — all test projects reuse the cached auth session from `playwright/.auth/user.json`

---

## 7. Step 5 — Salesforce Wait Helpers (Critical)

This is the **most important file in the framework**. Salesforce Lightning is an SPA built on the Aura framework that uses aggressive lazy loading, skeleton screens, and asynchronous rendering. Standard `page.waitForLoadState('networkidle')` does NOT work reliably.

### src/helpers/wait-helpers.ts

```typescript
import { type Page } from '@playwright/test';

export interface SalesforceWaitOptions {
  /** Only run Phase 1 (spinners + domcontentloaded). Skips Aura and DOM stability. */
  spinnersOnly?: boolean;
  /** DOM quiescence interval in ms for Phase 4 (default 300). */
  settleMs?: number;
  /** Overall timeout in ms (default 30000). */
  timeout?: number;
  /** Skip the DOM stability phase entirely. */
  skipDomStability?: boolean;
  /** Skip waiting for skeleton/placeholder loaders to clear. */
  skipSkeletonWait?: boolean;
}

const DEFAULT_OPTIONS: Required<SalesforceWaitOptions> = {
  spinnersOnly: false,
  settleMs: 300,
  timeout: 30_000,
  skipDomStability: false,
  skipSkeletonWait: false,
};

/**
 * Master wait for Salesforce Lightning pages.
 *
 * Phase 1 (Hard signals):    domcontentloaded + all spinners hidden
 * Phase 2 (Soft signals):    Aura idle (best-effort, 5s timeout)
 * Phase 3 (Visual stability): Skeleton/stencil loaders gone
 * Phase 4 (DOM stability):    No DOM mutations for `settleMs`
 */
export async function waitForSalesforcePage(
  page: Page,
  options?: SalesforceWaitOptions
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // --- Phase 1: Hard signals (must pass) ---
  await page.waitForLoadState('domcontentloaded');
  await waitForAllSpinners(page, opts.timeout);

  if (opts.spinnersOnly) return;

  // --- Phase 2: Soft signals (best-effort) ---
  await waitForAuraIdle(page, 5_000);

  // --- Phase 3: Skeleton / stencil loaders ---
  if (!opts.skipSkeletonWait) {
    await waitForSkeletonLoaders(page, opts.timeout);
  }

  // --- Phase 4: DOM stability ---
  if (!opts.skipDomStability) {
    await waitForDomStability(page, opts.settleMs, opts.timeout);
  }
}

/**
 * Wait for ALL Lightning spinner variants to disappear.
 */
export async function waitForAllSpinners(page: Page, timeout = 30_000): Promise<void> {
  await page
    .locator('.slds-spinner_container')
    .waitFor({ state: 'hidden', timeout })
    .catch(() => {});

  await page
    .locator('lightning-spinner')
    .waitFor({ state: 'hidden', timeout })
    .catch(() => {});
}

/**
 * Wait for skeleton/stencil loaders to finish rendering.
 */
export async function waitForSkeletonLoaders(page: Page, timeout = 10_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const stencils = document.querySelectorAll(
        [
          'force-record-layout-stencil',
          'records-record-layout-stencil',
          'lst-list-view-manager-stencil',
          'force-list-view-manager-stencil',
          '.forceListViewManagerPendingGrid',
          '.stencil',
          'runtime_platform_tables-stencil-row',
        ].join(',')
      );
      if (stencils.length > 0) return false;

      const animated = document.querySelectorAll('.slds-is-animated, [class*="stencil"]');
      for (const el of animated) {
        if ((el as HTMLElement).offsetParent !== null) return false;
      }
      return true;
    },
    { timeout }
  ).catch(() => {});
}

export async function waitForSpinners(page: Page, timeout = 30_000): Promise<void> {
  await waitForAllSpinners(page, timeout);
}

/**
 * Wait for Aura framework to finish processing.
 */
export async function waitForAuraIdle(page: Page, timeout = 30_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const aura = (window as any).$A;
      if (!aura) return true; // Not an Aura page
      return !aura.eventService?.hasPendingEvents?.();
    },
    { timeout }
  ).catch(() => {});
}

/**
 * Wait until the DOM stops mutating for `quiesceMs` milliseconds.
 * Uses a MutationObserver to detect when the page has settled.
 */
export async function waitForDomStability(
  page: Page,
  quiesceMs = 200,
  timeout = 30_000
): Promise<void> {
  await page.evaluate(
    ({ quiesceMs, timeout }) => {
      return new Promise<void>((resolve) => {
        let timer: ReturnType<typeof setTimeout>;
        const deadline = setTimeout(resolve, timeout);

        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            observer.disconnect();
            clearTimeout(deadline);
            resolve();
          }, quiesceMs);
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });

        timer = setTimeout(() => {
          observer.disconnect();
          clearTimeout(deadline);
          resolve();
        }, quiesceMs);
      });
    },
    { quiesceMs, timeout }
  ).catch(() => {});
}

export async function waitForPageReady(page: Page): Promise<void> {
  await waitForSalesforcePage(page);
}

export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10_000
): Promise<void> {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout });
}

export async function retryAction(
  action: () => Promise<void>,
  maxRetries = 3,
  delayMs = 1000
): Promise<void> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await action();
      return;
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}
```

### Why this 4-phase approach?

| Problem | Solution |
|---------|----------|
| `networkidle` fires too early because Salesforce lazy-loads sections | Phase 1 checks spinners directly |
| Aura framework has pending events even after spinners disappear | Phase 2 checks `$A.eventService.hasPendingEvents()` |
| Skeleton screens (shimmer bars) render before data loads | Phase 3 waits for all stencil elements to disappear |
| Small DOM updates trickle in after the page looks "ready" | Phase 4 uses MutationObserver to wait for DOM to stop changing |

**All phases use `.catch(() => {})` to gracefully handle pages where a particular signal doesn't exist (e.g., non-Aura pages, pages without stencils).**

---

## 8. Step 6 — Page Objects

### Design Principles

1. **All page objects extend `BasePage`** which provides navigation, waits, toast handling, and field helpers
2. **Object-agnostic** — `ListViewPage.navigateToListView('Account')` works for ANY object
3. **Methods return Promises** — always `async`
4. **Use Playwright's `getByRole`, `getByLabel` locators** — more reliable than CSS selectors for Salesforce Lightning
5. **Every navigation method calls `waitForLightningReady()`** — no manual waits needed in tests

### src/pages/base.page.ts

```typescript
import { type Page, type Locator, expect } from '@playwright/test';
import { waitForSalesforcePage, waitForSpinners } from '../helpers/wait-helpers.js';

export class BasePage {
  constructor(protected page: Page) {}

  // --- Navigation ---
  async navigateToUrl(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForLightningReady();
  }

  async navigateToObject(objectApiName: string): Promise<void> {
    await this.page.goto(`/lightning/o/${objectApiName}/list`);
    await this.waitForLightningReady();
  }

  async navigateToRecord(recordId: string): Promise<void> {
    await this.page.goto(`/lightning/r/${recordId}/view`);
    await this.waitForLightningReady();
  }

  async navigateToNewRecord(objectApiName: string): Promise<void> {
    await this.page.goto(`/lightning/o/${objectApiName}/new`);
    await this.waitForLightningReady();
  }

  // --- Lightning Waits ---
  async waitForLightningReady(): Promise<void> {
    await waitForSalesforcePage(this.page);
  }

  async waitForSpinnerToDisappear(): Promise<void> {
    await waitForSpinners(this.page);
  }

  // --- Toast Notifications ---
  async getToastMessage(): Promise<string> {
    const toast = this.page.locator('div.toastMessage');
    await toast.waitFor({ state: 'visible', timeout: 10_000 });
    return await toast.innerText();
  }

  async expectToastSuccess(expectedText?: string): Promise<void> {
    const toast = this.page.locator('div.forceActionsText');
    await toast.waitFor({ state: 'visible', timeout: 10_000 });
    if (expectedText) {
      await expect(toast).toContainText(expectedText);
    }
  }

  async dismissToast(): Promise<void> {
    const closeButton = this.page.locator('button.toastClose');
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }
  }

  // --- Common Field Interactions ---
  getFieldByLabel(label: string): Locator {
    return this.page.getByLabel(label);
  }

  async getFieldValue(fieldLabel: string): Promise<string> {
    const field = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .slds-form-element__static`
    );
    if (await field.isVisible().catch(() => false)) {
      return await field.innerText();
    }
    const input = this.page.getByLabel(fieldLabel);
    return await input.inputValue().catch(() => '');
  }

  async isFieldEditable(fieldLabel: string): Promise<boolean> {
    const input = this.page.getByLabel(fieldLabel);
    if (await input.isVisible().catch(() => false)) {
      return await input.isEditable();
    }
    return false;
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
```

### src/pages/login.page.ts

```typescript
import { type Page } from '@playwright/test';
import type { SalesforceEnvironment } from '../types/environment.types.js';

export class LoginPage {
  constructor(private page: Page) {}

  /**
   * Authenticate via Salesforce session ID using frontdoor.jsp.
   * This is the CI/headless auth method — no username/password needed.
   */
  async loginWithSessionId(env: SalesforceEnvironment): Promise<void> {
    if (!env.sessionId) {
      throw new Error(
        'SF_SESSION_ID not set. Run `npm run auth` to log in interactively, ' +
        'or set SF_SESSION_ID in your environment for CI.'
      );
    }
    await this.page.goto(
      `${env.baseUrl}/secur/frontdoor.jsp?sid=${env.sessionId}`
    );
    await this.page.waitForURL('**/lightning/**', { timeout: 60_000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Interactive login — opens login page, waits up to 5 min for user to complete.
   * Handles SSO, MFA, any login flow automatically.
   */
  async loginInteractive(env: SalesforceEnvironment): Promise<void> {
    await this.page.goto(env.loginUrl);
    console.log('\n  Log in to Salesforce in the browser window...\n');
    await this.page.waitForURL('**/lightning/**', { timeout: 300_000 });
    await this.page.waitForLoadState('domcontentloaded');
  }
}
```

### src/pages/list-view.page.ts

```typescript
import { type Page, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

export class ListViewPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToListView(objectApiName: string, listViewName?: string): Promise<void> {
    if (listViewName) {
      await this.page.goto(`/lightning/o/${objectApiName}/list?filterName=${listViewName}`);
    } else {
      await this.page.goto(`/lightning/o/${objectApiName}/list`);
    }
    await this.waitForLightningReady();
    await this.waitForListToLoad();
  }

  async waitForListToLoad(): Promise<void> {
    await this.page.locator(
      'table[role="grid"], lightning-datatable, lst-list-view-manager-header'
    ).first().waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {});
    await this.waitForSpinnerToDisappear();
  }

  async selectListView(viewName: string): Promise<void> {
    const listViewButton = this.page.locator(
      'button[title="Select a List View"], button.listViewDropDown'
    ).first();
    await listViewButton.click();
    await this.page.getByRole('option', { name: viewName }).click();
    await this.waitForListToLoad();
  }

  async clickRecord(recordName: string): Promise<void> {
    await this.page.getByRole('link', { name: recordName }).first().click();
    await this.waitForLightningReady();
  }

  async getRecordCount(): Promise<number> {
    const countText = this.page.locator(
      '.countSortedByFilteredBy, span.itemsCount'
    ).first();
    const text = await countText.innerText().catch(() => '0 items');
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async isRecordInList(recordName: string): Promise<boolean> {
    const link = this.page.getByRole('link', { name: recordName }).first();
    return await link.isVisible().catch(() => false);
  }

  async expectRecordInList(recordName: string): Promise<void> {
    await expect(this.page.getByRole('link', { name: recordName }).first()).toBeVisible();
  }

  async expectRecordNotInList(recordName: string): Promise<void> {
    await expect(this.page.getByRole('link', { name: recordName }).first()).not.toBeVisible();
  }

  async clickNewButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'New' }).click();
    await this.waitForLightningReady();
  }

  async searchList(searchText: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder('Search this list...');
    await searchInput.fill(searchText);
    await searchInput.press('Enter');
    await this.waitForListToLoad();
  }

  async selectRow(recordName: string): Promise<void> {
    const row = this.page.locator(`tr:has(a:text("${recordName}"))`);
    await row.locator('input[type="checkbox"]').check();
  }

  async selectAllRows(): Promise<void> {
    await this.page.locator('thead input[type="checkbox"], th input[type="checkbox"]').first().check();
  }

  async sortByColumn(columnLabel: string): Promise<void> {
    await this.page.getByRole('columnheader', { name: columnLabel }).click();
    await this.waitForListToLoad();
  }

  async getColumnValues(columnIndex: number): Promise<string[]> {
    const cells = this.page.locator(`table[role="grid"] tbody tr td:nth-child(${columnIndex + 1})`);
    const count = await cells.count();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      values.push((await cells.nth(i).innerText()).trim());
    }
    return values;
  }
}
```

### src/pages/record-form.page.ts

```typescript
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

export class RecordFormPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // --- Record Type Selection ---
  async selectRecordType(recordTypeName: string): Promise<void> {
    const radio = this.page.getByRole('radio', { name: recordTypeName });
    await radio.check();
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.waitForLightningReady();
    await this.waitForFormReady();
  }

  async hasRecordTypeSelector(): Promise<boolean> {
    try {
      await this.page.getByRole('button', { name: 'Next' }).waitFor({
        state: 'visible',
        timeout: 5_000,
      });
      return true;
    } catch {
      return false;
    }
  }

  async waitForFormReady(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save', exact: true }).waitFor({
      state: 'visible',
      timeout: 15_000,
    });
  }

  // --- Field Interactions ---
  async fillField(label: string, value: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: label });
    await input.click();
    await input.clear();
    await input.fill(value);
  }

  async fillTextArea(label: string, value: string): Promise<void> {
    const textarea = this.page.getByRole('textbox', { name: label });
    await textarea.click();
    await textarea.clear();
    await textarea.fill(value);
  }

  async selectPicklist(label: string, value: string): Promise<void> {
    const combobox = this.page.getByRole('combobox', { name: label });
    await combobox.click();
    await this.page.getByRole('option', { name: value }).click();
  }

  async selectLookup(label: string, searchText: string, selectText?: string): Promise<void> {
    const lookupInput = this.page.getByRole('combobox', { name: label });
    await lookupInput.click();
    await lookupInput.fill(searchText);
    const resultText = selectText || searchText;
    await this.page
      .locator(`lightning-base-combobox-item[role="option"]`)
      .filter({ hasText: resultText })
      .first()
      .click();
  }

  async setCheckbox(label: string, checked: boolean): Promise<void> {
    const checkbox = this.page.getByLabel(label, { exact: false });
    if (checked) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  async setDate(label: string, dateValue: string): Promise<void> {
    const dateInput = this.page.getByLabel(label, { exact: false });
    await dateInput.click();
    await dateInput.clear();
    await dateInput.fill(dateValue);
    await dateInput.press('Tab'); // Close date picker and confirm
  }

  // --- Form Actions ---
  async save(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.waitForSpinnerToDisappear();
  }

  async saveAndNew(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save & New' }).click();
    await this.waitForSpinnerToDisappear();
  }

  async cancel(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  // --- Validation ---
  async expectFieldError(label: string, errorText: string): Promise<void> {
    const errorMessage = this.page.locator(
      `lightning-input:has(label:text("${label}")) .slds-form-element__help, ` +
      `lightning-textarea:has(label:text("${label}")) .slds-form-element__help, ` +
      `lightning-combobox:has(label:text("${label}")) .slds-form-element__help`
    );
    await expect(errorMessage).toContainText(errorText);
  }

  async expectPageError(errorText: string): Promise<void> {
    await expect(this.page.locator('.forceFormPageError, .pageError')).toContainText(errorText);
  }

  async isFieldPresent(label: string): Promise<boolean> {
    return await this.page.getByLabel(label, { exact: false }).isVisible().catch(() => false);
  }

  async isFieldRequired(label: string): Promise<boolean> {
    const requiredIndicator = this.page.locator(
      `lightning-input:has(label:text("${label}")) abbr[title="required"], ` +
      `lightning-textarea:has(label:text("${label}")) abbr[title="required"], ` +
      `lightning-combobox:has(label:text("${label}")) abbr[title="required"]`
    );
    return await requiredIndicator.isVisible().catch(() => false);
  }

  // --- Bulk Operations ---
  async fillFields(fields: Record<string, string>): Promise<void> {
    for (const [label, value] of Object.entries(fields)) {
      await this.fillField(label, value);
    }
  }

  async fillForm(config: {
    fields?: Record<string, string>;
    picklists?: Record<string, string>;
    lookups?: Record<string, string>;
    checkboxes?: Record<string, boolean>;
    dates?: Record<string, string>;
  }): Promise<void> {
    if (config.fields) {
      for (const [label, value] of Object.entries(config.fields)) {
        await this.fillField(label, value);
      }
    }
    if (config.picklists) {
      for (const [label, value] of Object.entries(config.picklists)) {
        await this.selectPicklist(label, value);
      }
    }
    if (config.lookups) {
      for (const [label, value] of Object.entries(config.lookups)) {
        await this.selectLookup(label, value);
      }
    }
    if (config.checkboxes) {
      for (const [label, value] of Object.entries(config.checkboxes)) {
        await this.setCheckbox(label, value);
      }
    }
    if (config.dates) {
      for (const [label, value] of Object.entries(config.dates)) {
        await this.setDate(label, value);
      }
    }
  }
}
```

### src/pages/record-detail.page.ts

```typescript
import { type Page, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

export class RecordDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // --- Tabs ---
  async clickDetailsTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Details' }).click();
    await this.waitForLightningReady();
  }

  async clickRelatedTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Related' }).click();
    await this.waitForLightningReady();
  }

  // --- Field Values ---
  async getDetailFieldValue(fieldLabel: string): Promise<string> {
    const fieldValue = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .test-id__field-value`
    ).first();
    if (await fieldValue.isVisible().catch(() => false)) {
      return (await fieldValue.innerText()).trim();
    }
    const fallback = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .slds-form-element__static`
    ).first();
    return (await fallback.innerText().catch(() => '')).trim();
  }

  async expectFieldValue(fieldLabel: string, expectedValue: string): Promise<void> {
    const value = await this.getDetailFieldValue(fieldLabel);
    expect(value).toContain(expectedValue);
  }

  async expectFieldPresent(fieldLabel: string): Promise<void> {
    await expect(this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}"))`
    ).first()).toBeVisible();
  }

  async expectFieldNotPresent(fieldLabel: string): Promise<void> {
    await expect(this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}"))`
    ).first()).not.toBeVisible();
  }

  // --- Editability ---
  async isFieldReadOnly(fieldLabel: string): Promise<boolean> {
    const staticValue = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .slds-form-element__static`
    ).first();
    const inputField = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) input, ` +
      `records-record-layout-item:has(span:text("${fieldLabel}")) textarea`
    ).first();
    const hasStatic = await staticValue.isVisible().catch(() => false);
    const hasInput = await inputField.isVisible().catch(() => false);
    return hasStatic && !hasInput;
  }

  async expectFieldReadOnly(fieldLabel: string): Promise<void> {
    expect(await this.isFieldReadOnly(fieldLabel), `Expected "${fieldLabel}" to be read-only`).toBe(true);
  }

  async expectFieldEditable(fieldLabel: string): Promise<void> {
    expect(await this.isFieldReadOnly(fieldLabel), `Expected "${fieldLabel}" to be editable`).toBe(false);
  }

  // --- Inline Edit ---
  async clickInlineEdit(fieldLabel: string): Promise<void> {
    const fieldArea = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .test-id__field-value`
    ).first();
    await fieldArea.dblclick();
    await this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) input, ` +
      `records-record-layout-item:has(span:text("${fieldLabel}")) textarea`
    ).first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async inlineEditField(fieldLabel: string, newValue: string): Promise<void> {
    await this.clickInlineEdit(fieldLabel);
    const input = this.page.getByRole('textbox', { name: fieldLabel });
    await input.clear();
    await input.fill(newValue);
  }

  async saveInlineEdit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.waitForSpinnerToDisappear();
  }

  // --- Record Actions ---
  async clickEdit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Edit' }).click();
    await this.waitForLightningReady();
  }

  async clickDelete(): Promise<void> {
    await this.page.locator('lightning-button-menu[slot="actions"]').click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
  }

  async confirmDelete(): Promise<void> {
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await this.waitForSpinnerToDisappear();
  }

  async clickClone(): Promise<void> {
    await this.page.locator('lightning-button-menu[slot="actions"]').click();
    await this.page.getByRole('menuitem', { name: 'Clone' }).click();
    await this.waitForLightningReady();
  }

  // --- Related Lists ---
  getRelatedList(listLabel: string) {
    return this.page.locator(
      `lst-related-list-single-container:has(span:text("${listLabel}"))`
    );
  }

  async getRelatedListCount(listLabel: string): Promise<number> {
    const countBadge = this.getRelatedList(listLabel).locator('.count');
    const text = await countBadge.innerText().catch(() => '0');
    return parseInt(text.replace(/[()]/g, ''), 10) || 0;
  }

  // --- Highlights Panel ---
  async getRecordName(): Promise<string> {
    const header = this.page.locator('main').getByRole('heading', { level: 1 }).first();
    const fullText = (await header.innerText()).trim();
    const parts = fullText.split('\n');
    return parts[parts.length - 1].trim();
  }

  async expectRecordName(expectedName: string): Promise<void> {
    expect(await this.getRecordName()).toContain(expectedName);
  }
}
```

---

## 9. Step 7 — Component Objects

### src/pages/components/toast.component.ts

```typescript
import { type Page, expect } from '@playwright/test';

export class ToastComponent {
  constructor(private page: Page) {}

  private get toastContainer() {
    return this.page.locator('div.toastContainer');
  }

  private get toastMessage() {
    return this.page.locator('div.toastMessage, span.toastMessage');
  }

  private get toastClose() {
    return this.page.locator('button.toastClose');
  }

  async waitForToast(timeout = 10_000): Promise<void> {
    await this.toastContainer.waitFor({ state: 'visible', timeout });
  }

  async getMessage(): Promise<string> {
    await this.waitForToast();
    return (await this.toastMessage.first().innerText()).trim();
  }

  async expectSuccess(message?: string): Promise<void> {
    await this.waitForToast();
    if (message) {
      await expect(this.toastMessage.first()).toContainText(message);
    }
    await expect(
      this.page.locator('.forceVisualMessageQueue .toastMessage').first()
    ).toBeVisible();
  }

  async expectError(message?: string): Promise<void> {
    await this.waitForToast();
    if (message) {
      await expect(this.toastMessage.first()).toContainText(message);
    }
  }

  async expectWarning(message?: string): Promise<void> {
    await this.waitForToast();
    if (message) {
      await expect(this.toastMessage.first()).toContainText(message);
    }
  }

  async dismiss(): Promise<void> {
    if (await this.toastClose.first().isVisible().catch(() => false)) {
      await this.toastClose.first().click();
    }
  }

  async dismissAll(): Promise<void> {
    const closeButtons = this.toastClose;
    const count = await closeButtons.count();
    for (let i = 0; i < count; i++) {
      await closeButtons.nth(i).click().catch(() => {});
    }
  }
}
```

### src/pages/components/modal.component.ts

```typescript
import { type Page, expect } from '@playwright/test';

export class ModalComponent {
  constructor(private page: Page) {}

  private get modal() {
    return this.page.locator('section[role="dialog"], div.modal-container').first();
  }

  private get modalHeader() {
    return this.modal.locator('h2, h1, .modal-header h2').first();
  }

  private get modalBody() {
    return this.modal.locator('.modal-body, .slds-modal__content').first();
  }

  async waitForModal(timeout = 10_000): Promise<void> {
    await this.modal.waitFor({ state: 'visible', timeout });
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible().catch(() => false);
  }

  async getTitle(): Promise<string> {
    await this.waitForModal();
    return (await this.modalHeader.innerText()).trim();
  }

  async expectTitle(expectedTitle: string): Promise<void> {
    await this.waitForModal();
    await expect(this.modalHeader).toContainText(expectedTitle);
  }

  async clickButton(buttonName: string): Promise<void> {
    await this.modal.getByRole('button', { name: buttonName }).click();
  }

  async clickSave(): Promise<void> { await this.clickButton('Save'); }
  async clickCancel(): Promise<void> { await this.clickButton('Cancel'); }

  async clickConfirm(): Promise<void> {
    await this.modal.getByRole('button', { name: /Delete|Confirm|OK|Yes/i }).first().click();
  }

  async close(): Promise<void> {
    await this.modal.locator('button[title="Close"], button.slds-modal__close').first().click();
  }

  async expectVisible(): Promise<void> { await expect(this.modal).toBeVisible(); }
  async expectHidden(): Promise<void> { await expect(this.modal).not.toBeVisible(); }

  async getBodyText(): Promise<string> {
    return (await this.modalBody.innerText()).trim();
  }
}
```

### src/pages/components/related-list.component.ts

```typescript
import { type Page, type Locator, expect } from '@playwright/test';

export class RelatedListComponent {
  private container: Locator;

  constructor(private page: Page, listLabel: string) {
    this.container = page.locator(
      `lst-related-list-single-container:has(span:text("${listLabel}")), ` +
      `article:has(span:text("${listLabel}"))`
    ).first();
  }

  static create(page: Page, listLabel: string): RelatedListComponent {
    return new RelatedListComponent(page, listLabel);
  }

  async isVisible(): Promise<boolean> {
    return await this.container.isVisible().catch(() => false);
  }

  async expectVisible(): Promise<void> { await expect(this.container).toBeVisible(); }

  async getCount(): Promise<number> {
    const countEl = this.container.locator('span.count, span[title]').first();
    const text = await countEl.innerText().catch(() => '(0)');
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async expectCount(expectedCount: number): Promise<void> {
    expect(await this.getCount()).toBe(expectedCount);
  }

  async clickViewAll(): Promise<void> {
    await this.container.getByRole('link', { name: /View All/i }).click();
  }

  async clickNew(): Promise<void> {
    await this.container.getByRole('button', { name: 'New' }).click();
  }

  async clickRecord(recordName: string): Promise<void> {
    await this.container.getByRole('link', { name: recordName }).first().click();
  }

  async isRecordPresent(recordName: string): Promise<boolean> {
    return await this.container.getByRole('link', { name: recordName }).first().isVisible().catch(() => false);
  }

  async expectRecordPresent(recordName: string): Promise<void> {
    await expect(this.container.getByRole('link', { name: recordName }).first()).toBeVisible();
  }

  async expectRecordNotPresent(recordName: string): Promise<void> {
    await expect(this.container.getByRole('link', { name: recordName }).first()).not.toBeVisible();
  }

  async getRecordNames(): Promise<string[]> {
    const links = this.container.locator('table tbody tr a[data-refid="recordId"]');
    const count = await links.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push((await links.nth(i).innerText()).trim());
    }
    return names;
  }

  async openRowActions(recordName: string): Promise<void> {
    const row = this.container.locator(`tr:has(a:text("${recordName}"))`);
    await row.locator('lightning-button-menu, button[title="Show Actions"]').first().click();
  }

  async clickRowAction(recordName: string, actionName: string): Promise<void> {
    await this.openRowActions(recordName);
    await this.page.getByRole('menuitem', { name: actionName }).click();
  }
}
```

---

## 10. Step 8 — Helper Utilities

### src/helpers/iframe-helpers.ts

For Salesforce orgs with Visualforce pages embedded in Lightning:

```typescript
import { type Page, type FrameLocator } from '@playwright/test';

export function getVFIframe(page: Page, nameOrTitle: string): FrameLocator {
  return page.frameLocator(`iframe[name="${nameOrTitle}"], iframe[title="${nameOrTitle}"]`);
}

export function getVFIframeBySrc(page: Page, srcPattern: string): FrameLocator {
  return page.frameLocator(`iframe[src*="${srcPattern}"]`);
}

export async function waitForVFIframe(
  page: Page, nameOrTitle: string, timeout = 30_000
): Promise<FrameLocator> {
  await page.locator(
    `iframe[name="${nameOrTitle}"], iframe[title="${nameOrTitle}"]`
  ).first().waitFor({ state: 'attached', timeout });
  return getVFIframe(page, nameOrTitle);
}

export function getNestedIframe(
  page: Page, outerNameOrTitle: string, innerNameOrTitle: string
): FrameLocator {
  return getVFIframe(page, outerNameOrTitle).frameLocator(
    `iframe[name="${innerNameOrTitle}"], iframe[title="${innerNameOrTitle}"]`
  );
}

export async function evalInVFIframe(
  page: Page, nameOrTitle: string, script: string
): Promise<any> {
  const frame = page.frame({ name: nameOrTitle });
  if (!frame) throw new Error(`Frame "${nameOrTitle}" not found`);
  return await frame.evaluate(script);
}
```

### src/helpers/navigation-helpers.ts

```typescript
import { type Page } from '@playwright/test';
import { waitForSpinners, waitForPageReady } from './wait-helpers.js';

export async function navigateViaAppLauncher(page: Page, searchText: string): Promise<void> {
  await page.locator('button.slds-global-actions__item[title="App Launcher"]').click();
  await page.locator('div.appLauncherMenu').waitFor({ state: 'visible' });
  const searchInput = page.locator('input[placeholder="Search apps and items..."]');
  await searchInput.fill(searchText);
  await page.locator('one-app-launcher-menu-item mark').first().waitFor({
    state: 'visible', timeout: 10_000,
  });
  await page.getByRole('option', { name: searchText }).first().click();
  await waitForPageReady(page);
}

export async function navigateToTab(page: Page, tabLabel: string): Promise<void> {
  await page.locator(`one-app-nav-bar-item-root a[title="${tabLabel}"]`).click();
  await waitForPageReady(page);
}

export async function navigateToPath(page: Page, urlPath: string): Promise<void> {
  await page.goto(urlPath);
  await waitForPageReady(page);
}

export async function navigateToObjectHome(page: Page, objectApiName: string): Promise<void> {
  await page.goto(`/lightning/o/${objectApiName}/home`);
  await waitForPageReady(page);
}

export async function navigateToRecord(page: Page, recordId: string): Promise<void> {
  await page.goto(`/lightning/r/${recordId}/view`);
  await waitForPageReady(page);
}

export async function navigateToNewRecord(page: Page, objectApiName: string): Promise<void> {
  await page.goto(`/lightning/o/${objectApiName}/new`);
  await waitForSpinners(page);
}

export async function navigateToSetup(page: Page): Promise<void> {
  await page.locator('button.setupGear, div.setupGear button').first().click();
  await page.getByRole('menuitem', { name: 'Setup' }).click();
  const [newPage] = await Promise.all([page.context().waitForEvent('page')]);
  await newPage.waitForLoadState('domcontentloaded');
}

export function extractRecordIdFromUrl(url: string): string | null {
  const match = url.match(/\/lightning\/r\/\w+\/(\w{15,18})\//);
  return match ? match[1] : null;
}
```

### src/helpers/doc-capture.ts

```typescript
import { type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { waitForSalesforcePage, type SalesforceWaitOptions } from './wait-helpers.js';

interface StepMetadata {
  step: number;
  name: string;
  description: string;
  screenshot: string;
  timestamp: string;
  type: 'step' | 'note' | 'error';
  detail?: string;
}

export interface TestDocData {
  testName: string;
  userStory?: string;
  status: 'passed' | 'failed' | 'unknown';
  error?: string;
  steps: StepMetadata[];
  startTime: string;
  endTime?: string;
  duration?: number;
}

/**
 * Documentation capture helper.
 * Only captures screenshots and metadata when CAPTURE_DOCS=true.
 */
export class DocCapture {
  private steps: StepMetadata[] = [];
  private stepCounter = 0;
  private testDir: string;
  private enabled: boolean;
  private testName: string;
  private startTime: string;
  private _userStory?: string;
  private defaultWaitOptions?: SalesforceWaitOptions;

  constructor(private page: Page, testName: string, waitOptions?: SalesforceWaitOptions) {
    this.enabled = process.env.CAPTURE_DOCS === 'true';
    this.testName = this.sanitizeName(testName);
    this.testDir = path.join(process.cwd(), 'screenshots', this.testName);
    this.startTime = new Date().toISOString();
    // Longer settle time so lazy-loaded sections finish rendering before screenshots
    this.defaultWaitOptions = { settleMs: 2500, skipSkeletonWait: true, ...waitOptions };

    if (this.enabled) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }
  }

  get isEnabled(): boolean { return this.enabled; }

  set userStory(story: string) { this._userStory = story; }

  async step(description: string, name?: string): Promise<void> {
    if (!this.enabled) return;

    this.stepCounter++;
    const stepNum = String(this.stepCounter).padStart(2, '0');
    const stepName = name || this.slugify(description);
    const screenshotFile = `step-${stepNum}-${stepName}.png`;
    const screenshotPath = path.join(this.testDir, screenshotFile);

    await waitForSalesforcePage(this.page, this.defaultWaitOptions);
    await this.hideFloatingOverlays();
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    await this.restoreFloatingOverlays();

    this.steps.push({
      step: this.stepCounter, name: stepName, description,
      screenshot: screenshotFile, timestamp: new Date().toISOString(), type: 'step',
    });
  }

  note(message: string): void {
    if (!this.enabled) return;
    this.stepCounter++;
    this.steps.push({
      step: this.stepCounter, name: 'note', description: message,
      screenshot: '', timestamp: new Date().toISOString(), type: 'note',
    });
  }

  async error(description: string, errorDetail?: string): Promise<void> {
    if (!this.enabled) return;
    this.stepCounter++;
    const stepNum = String(this.stepCounter).padStart(2, '0');
    const screenshotFile = `step-${stepNum}-error.png`;
    await this.page.screenshot({
      path: path.join(this.testDir, screenshotFile), fullPage: true,
    }).catch(() => {});
    this.steps.push({
      step: this.stepCounter, name: 'error', description,
      screenshot: screenshotFile, timestamp: new Date().toISOString(),
      type: 'error', detail: errorDetail,
    });
  }

  async stepElement(description: string, selector: string, name?: string): Promise<void> {
    if (!this.enabled) return;
    this.stepCounter++;
    const stepNum = String(this.stepCounter).padStart(2, '0');
    const stepName = name || this.slugify(description);
    const screenshotFile = `step-${stepNum}-${stepName}.png`;
    await waitForSalesforcePage(this.page, this.defaultWaitOptions);
    await this.page.locator(selector).first().screenshot({
      path: path.join(this.testDir, screenshotFile),
    });
    this.steps.push({
      step: this.stepCounter, name: stepName, description,
      screenshot: screenshotFile, timestamp: new Date().toISOString(), type: 'step',
    });
  }

  async finalize(status: 'passed' | 'failed' | 'unknown' = 'unknown', testError?: string): Promise<void> {
    if (!this.enabled || this.steps.length === 0) return;

    if (status === 'failed' && testError && !this.steps.some(s => s.type === 'error')) {
      await this.error('Test failed', testError);
    }

    const endTime = new Date().toISOString();
    const data: TestDocData = {
      testName: this.testName,
      userStory: this._userStory,
      status,
      error: status === 'failed' ? testError : undefined,
      steps: this.steps,
      startTime: this.startTime,
      endTime,
      duration: new Date(endTime).getTime() - new Date(this.startTime).getTime(),
    };

    const metadataDir = path.join(process.cwd(), 'test-data');
    fs.mkdirSync(metadataDir, { recursive: true });
    fs.writeFileSync(
      path.join(metadataDir, `${this.testName}.json`),
      JSON.stringify(data, null, 2)
    );
  }

  private async hideFloatingOverlays(): Promise<void> {
    await this.page.evaluate(() => {
      for (const el of document.querySelectorAll('body *')) {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed') {
          const htmlEl = el as HTMLElement;
          htmlEl.dataset.docCaptureDisplay = htmlEl.style.display;
          htmlEl.style.setProperty('display', 'none', 'important');
        }
      }
    }).catch(() => {});
  }

  private async restoreFloatingOverlays(): Promise<void> {
    await this.page.evaluate(() => {
      document.querySelectorAll('[data-doc-capture-display]').forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = htmlEl.dataset.docCaptureDisplay || '';
        delete htmlEl.dataset.docCaptureDisplay;
      });
    }).catch(() => {});
  }

  private sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50);
  }
}
```

---

## 11. Step 9 — Custom Playwright Fixtures

This is **THE import** that all test files use. It provides page objects and doc capture as fixtures.

### src/fixtures/salesforce.fixture.ts

```typescript
import { test as base } from '@playwright/test';
import { BasePage } from '../pages/base.page.js';
import { RecordFormPage } from '../pages/record-form.page.js';
import { RecordDetailPage } from '../pages/record-detail.page.js';
import { ListViewPage } from '../pages/list-view.page.js';
import { ToastComponent } from '../pages/components/toast.component.js';
import { ModalComponent } from '../pages/components/modal.component.js';
import { DocCapture } from '../helpers/doc-capture.js';

type SalesforceFixtures = {
  basePage: BasePage;
  recordForm: RecordFormPage;
  recordDetail: RecordDetailPage;
  listView: ListViewPage;
  toast: ToastComponent;
  modal: ModalComponent;
  docCapture: DocCapture;
};

export const test = base.extend<SalesforceFixtures>({
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  recordForm: async ({ page }, use) => {
    await use(new RecordFormPage(page));
  },
  recordDetail: async ({ page }, use) => {
    await use(new RecordDetailPage(page));
  },
  listView: async ({ page }, use) => {
    await use(new ListViewPage(page));
  },
  toast: async ({ page }, use) => {
    await use(new ToastComponent(page));
  },
  modal: async ({ page }, use) => {
    await use(new ModalComponent(page));
  },
  docCapture: async ({ page }, use, testInfo) => {
    const capture = new DocCapture(page, testInfo.title);
    // Set user story from the describe block title
    if (testInfo.titlePath.length > 1) {
      capture.userStory = testInfo.titlePath[testInfo.titlePath.length - 2];
    }
    await use(capture);
    // Auto-finalize with test outcome
    const status = testInfo.status === 'passed' ? 'passed'
      : testInfo.status === 'failed' ? 'failed'
      : 'unknown';
    await capture.finalize(status, testInfo.error?.message);
  },
});

export { expect } from '@playwright/test';
```

**Key design**: The `docCapture` fixture automatically picks up the `test.describe()` block title as the `userStory` for grouping in reports. It auto-finalizes after each test with pass/fail status.

---

## 12. Step 10 — Authentication

### tests/auth.setup.ts

```typescript
import { test as setup } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page.js';
import { getEnvironment } from '../src/config/environments.js';
import * as fs from 'fs';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const env = getEnvironment();
  const loginPage = new LoginPage(page);

  // Check if we already have a cached session
  if (fs.existsSync(authFile)) {
    const cached = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    if (cached.cookies?.length > 0) {
      await page.context().addCookies(cached.cookies);
      await page.goto(`${env.baseUrl}/lightning/page/home`);
      if (page.url().includes('/lightning/')) {
        await page.context().storageState({ path: authFile });
        return;  // Session still valid
      }
    }
  }

  // Authenticate fresh
  if (env.sessionId) {
    await loginPage.loginWithSessionId(env);  // CI mode
  } else {
    await loginPage.loginInteractive(env);     // Local mode
  }

  await page.context().storageState({ path: authFile });
});
```

### scripts/auth-interactive.ts

```typescript
import { chromium } from '@playwright/test';
import { getTestConfig } from '../src/config/environments.js';
import * as fs from 'fs';
import * as path from 'path';

const authDir = path.resolve(process.cwd(), 'playwright/.auth');
const authFile = path.join(authDir, 'user.json');

async function main() {
  const { environment: env } = getTestConfig();

  console.log('');
  console.log('  Salesforce Interactive Login');
  console.log('  --------------------------------');
  console.log(`  Org: ${env.baseUrl}`);
  console.log('');
  console.log('  A browser window will open. Log in to Salesforce.');
  console.log('  The window will close automatically once you reach the home page.');
  console.log('');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(env.loginUrl);
  await page.waitForURL('**/lightning/**', { timeout: 300_000 });
  await page.waitForLoadState('domcontentloaded');

  fs.mkdirSync(authDir, { recursive: true });
  await context.storageState({ path: authFile });
  await browser.close();

  console.log('');
  console.log('  Session saved to playwright/.auth/user.json');
  console.log('  You can now run tests: npm run test:smoke');
  console.log('');
}

main().catch((err) => {
  console.error('Authentication failed:', err.message);
  process.exit(1);
});
```

**Authentication flow**:
1. **Local**: `npm run auth` opens a headed browser. You log in manually (SSO, MFA, whatever your org uses). Session is cached.
2. **CI**: Set `SF_SESSION_ID` as a GitHub secret. Tests use `frontdoor.jsp?sid=` to authenticate headlessly.
3. **Session reuse**: `auth.setup.ts` checks if the cached session is still valid before re-authenticating.

---

## 13. Step 11 — Writing Tests (Patterns & Conventions)

### Test File Convention

Every test file follows this pattern:

```typescript
/**
 * USER STORY: As a [role], I need to [action] so that [outcome].
 *
 * Acceptance criteria:
 *   - [criterion 1]
 *   - [criterion 2]
 */
import { test, expect } from '../../src/fixtures/salesforce.fixture.js';

test.describe('User story title (becomes the grouping in reports)', () => {
  test('specific action or scenario being tested', async ({
    listView,      // Destructure only the fixtures you need
    recordForm,
    recordDetail,
    toast,
    modal,
    docCapture,
  }, testInfo) => {

    // Step 1: Navigate
    await listView.navigateToListView('YourObject__c');
    await docCapture.step('Open the object list view');

    // Step 2: Take action
    await listView.clickNewButton();
    await docCapture.step('Click New');

    // Step 3: Fill form
    await recordForm.fillForm({
      fields: { 'Field Label': 'value' },
      picklists: { 'Status': 'Active' },
      lookups: { 'Parent Account': 'search text' },
      dates: { 'Start Date': '01/15/2026' },
      checkboxes: { 'Is Active': true },
    });
    await docCapture.step('Fill in the form fields');

    // Step 4: Save and verify
    await recordForm.save();
    const message = await toast.getMessage();
    expect(message).toContain('was created');
    await docCapture.step('Save and verify success');
  });
});
```

### Key Conventions

1. **Always import from the fixture**, not from `@playwright/test` directly:
   ```typescript
   import { test, expect } from '../../src/fixtures/salesforce.fixture.js';
   ```

2. **Use `docCapture.step()` after every significant action** — this captures screenshots for the training guide. It no-ops when `CAPTURE_DOCS` is not set, so it's always safe.

3. **Use unique test data** with worker index + timestamp to prevent parallel test collisions:
   ```typescript
   function testRecordName(workerIndex: number): string {
     return `QA Test ${Date.now()}_${workerIndex}`;
   }
   ```

4. **`test.describe()` title = user story** — the fixture automatically uses this as the grouping in reports.

5. **Never hardcode delays** — use the page object's built-in waits. If you need to wait, use `waitForLightningReady()` or `waitForSpinnerToDisappear()`.

6. **Organize by module** — tests go in `tests/regression/[module-name]/`.

### Example: Module-Specific Test (Incident Module)

```typescript
import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

test.describe('Case worker creates and manages an Incident report', () => {
  test('can create a new Incident from the list view', async ({
    listView, recordForm, toast, docCapture,
  }, testInfo) => {
    const incidentName = `QA Incident ${Date.now()}_${testInfo.workerIndex}`;

    await listView.navigateToListView('Incident__c');
    await docCapture.step('Navigate to the Incidents list');

    await listView.clickNewButton();
    await docCapture.step('Click New to create an Incident');

    await recordForm.fillForm({
      fields: { 'Incident Name': incidentName },
      picklists: { 'Type': 'Safety', 'Severity': 'Medium' },
      dates: { 'Incident Date': '02/15/2026' },
    });
    await docCapture.step('Fill in the Incident details');

    await recordForm.save();
    expect(await toast.getMessage()).toContain('was created');
    await docCapture.step('Save and confirm success');
  });

  test('can update the status of an existing Incident', async ({
    listView, recordDetail, recordForm, docCapture,
  }) => {
    await listView.navigateToListView('Incident__c');
    await docCapture.step('Navigate to Incidents');

    const page = listView['page'];
    const firstRecord = page.locator('table[role="grid"] tbody tr a').first();
    if (await firstRecord.isVisible()) {
      await firstRecord.click();
      await recordDetail.waitForLightningReady();
      await docCapture.step('Open an existing Incident');

      await recordDetail.clickEdit();
      await recordForm.selectPicklist('Status', 'Under Review');
      await recordForm.save();
      await docCapture.step('Change status to Under Review and save');
    }
  });
});
```

---

## 14. Step 12 — Documentation Capture & Report Generation

### How It Works

1. Run `npm run test:document` — sets `CAPTURE_DOCS=true`, runs tests sequentially, then generates HTML reports
2. Each test with `docCapture.step()` calls saves:
   - Screenshots to `screenshots/[test-name]/step-XX-description.png`
   - Metadata JSON to `test-data/[test-name].json`
3. Python script reads all metadata + screenshots and generates standalone HTML reports with embedded base64 images

### docs/scripts/generate-reports.py

This script generates two HTML reports:
- **test-results.html** — pass/fail table grouped by suite with error messages sanitized for business users
- **training-guide.html** — step-by-step walkthrough with screenshots, grouped by user story, with collapsible sections

The report uses a module-based hierarchy for organizing tests. Here is the complete script:

```python
#!/usr/bin/env python3
"""
Generate reports from Playwright test results and doc capture metadata.

Reads:
  - test-data/test-results.json  (Playwright JSON reporter output)
  - test-data/*.json             (doc capture step metadata)
  - screenshots/                 (step-by-step screenshots)

Outputs:
  - docs/output/test-results.html
  - docs/output/training-guide.html
"""

import base64
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEST_DATA_DIR = PROJECT_ROOT / "test-data"
SCREENSHOTS_DIR = PROJECT_ROOT / "screenshots"
OUTPUT_DIR = PROJECT_ROOT / "docs" / "output"


def load_test_results():
    results_file = TEST_DATA_DIR / "test-results.json"
    if not results_file.exists():
        return None
    with open(results_file) as f:
        return json.load(f)


def load_doc_captures():
    captures = []
    for json_file in sorted(TEST_DATA_DIR.glob("*.json")):
        if json_file.name == "test-results.json":
            continue
        with open(json_file) as f:
            captures.append(json.load(f))
    return captures


def img_to_base64(path):
    if not path.exists():
        return ""
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/png;base64,{data}"


def esc(text):
    return (text or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def sanitize_error(raw: str) -> str:
    """Translate Playwright errors into plain-English for business users."""
    if not raw:
        return ""

    text = re.sub(r"\x1b\[[0-9;]*m", "", raw)
    text = re.sub(r"\[[\d;]*m", "", text)

    m = re.search(r'toBeVisible\(\) failed', text)
    if m:
        field = re.search(r'text\("([^"]+)"\)', text)
        field_name = field.group(1) if field else "a required element"
        timeout = re.search(r'Timeout:\s*(\d+)ms', text)
        secs = int(timeout.group(1)) // 1000 if timeout else 10
        return (
            f'The field "{field_name}" was not found on the page.\n'
            f"The page may not have loaded completely within {secs} seconds, "
            f"or the page layout may not include this field for the current user profile."
        )

    m = re.search(r"getByLabel\('([^']+)'\) resolved to (\d+) elements", text)
    if m:
        return (
            f'The test was unable to interact with the "{m.group(1)}" field.\n'
            f"This usually means a required field on the form was not filled in "
            f"or the form was not ready for input."
        )

    m = re.search(r"Expected:\s*>\s*(\d+)", text)
    n = re.search(r"Received:\s*(\d+)", text)
    if m and n:
        expected_min = int(m.group(1))
        actual = int(n.group(1))
        if expected_min == 0 and actual == 0:
            return (
                "Expected to find at least one record, but none were found.\n"
                "The related list may be empty, or the records may not be linked."
            )
        return f"Expected more than {expected_min} records, but found {actual}."

    m = re.search(r'Expected substring:\s*"(.+?)"', text)
    n = re.search(r'Received string:\s*"(.+?)"', text)
    if m and n:
        return f'Expected "{m.group(1)}", but got "{n.group(1)}".'

    m = re.search(r"Expected:\s*(.+)", text)
    n = re.search(r"Received:\s*(.+)", text)
    if m and n:
        return f'Expected "{m.group(1).strip().strip(chr(34))}" but got "{n.group(1).strip().strip(chr(34))}".'

    m = re.search(r"Timeout\s*(\d+)ms exceeded", text)
    if m:
        secs = int(m.group(1)) // 1000
        return f"The page did not finish loading within {secs} seconds."

    if "Target page, context or browser has been closed" in text:
        return "The browser was closed before the action completed (test infrastructure issue)."

    lines = [l.strip() for l in text.strip().splitlines() if l.strip()]
    return lines[0] if lines else text.strip()


# --- CSS shared by both reports (Salesforce-themed) ---
CSS = """<style>
  :root { --accent: #0176d3; --bg: #f4f6f9; --card: #fff; --text: #181818;
          --border: #d8dde6; --green: #2e844a; --red: #ba0517; --amber: #a96404; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         background: var(--bg); color: var(--text); line-height: 1.6; }
  .container { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem; }
  h1 { font-size: 1.75rem; color: var(--accent); border-bottom: 3px solid var(--accent);
       padding-bottom: 0.5rem; margin-bottom: 0.25rem; }
  .subtitle { color: #666; font-size: 0.95rem; margin-bottom: 2rem; }
  h2 { font-size: 1.35rem; margin-top: 2rem; margin-bottom: 1rem; color: #333; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; background: var(--card);
          border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  th, td { padding: 0.6rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: #f8f9fb; font-weight: 600; font-size: 0.85rem; text-transform: uppercase;
       letter-spacing: 0.03em; color: #555; }
  .badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 4px;
           font-size: 0.8rem; font-weight: 600; }
  .badge-pass { background: #e3f5e9; color: var(--green); }
  .badge-fail { background: #fce4e4; color: var(--red); }
  .badge-skip { background: #f0f0f0; color: #666; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                   gap: 1rem; margin: 1rem 0; }
  .summary-box { background: var(--card); border-radius: 8px; padding: 1rem; text-align: center;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .summary-box .num { font-size: 2rem; font-weight: 700; }
  .summary-box .label { font-size: 0.8rem; color: #666; text-transform: uppercase; }
  details.story { background: var(--card); border-radius: 8px; margin: 1rem 0;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden; }
  details.story summary { padding: 1rem 1.25rem; cursor: pointer; font-weight: 600;
                           font-size: 1.05rem; display: flex; align-items: center;
                           gap: 0.75rem; user-select: none; list-style: none; }
  details.story summary::-webkit-details-marker { display: none; }
  details.story summary::before { content: '\\25B6'; font-size: 0.7rem; transition: transform 0.2s;
                                   color: #999; flex-shrink: 0; }
  details.story[open] summary::before { transform: rotate(90deg); }
  details.story summary .title { flex: 1; }
  details.story summary .meta { font-size: 0.8rem; font-weight: 400; color: #888; }
  details.story .story-body { padding: 0 1.25rem 1.25rem; }
  .step { display: flex; gap: 1rem; padding: 1rem 0; border-top: 1px solid var(--border); }
  .step:first-child { border-top: none; }
  .step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent);
              color: #fff; text-align: center; line-height: 28px; font-weight: 700;
              font-size: 0.85rem; flex-shrink: 0; }
  .step-content { flex: 1; min-width: 0; }
  .step-desc { font-weight: 500; margin-bottom: 0.5rem; }
  .screenshot { max-width: 100%; border: 1px solid var(--border); border-radius: 6px; }
  .callout { border-left: 4px solid; border-radius: 4px; padding: 0.75rem 1rem;
             margin: 0.5rem 0; font-size: 0.9rem; }
  .callout-note { border-color: var(--accent); background: #eaf4fd; }
  .callout-error { border-color: var(--red); background: #fce4e4; }
  .callout-error .error-detail { margin-top: 0.5rem; font-family: monospace;
                                  font-size: 0.8rem; white-space: pre-wrap;
                                  max-height: 200px; overflow-y: auto; color: #666; }
  .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border);
            color: #999; font-size: 0.8rem; text-align: center; }
</style>"""


def html_page(title, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
{CSS}
</head>
<body>
<div class="container">
{body}
<div class="footer">Generated by Salesforce QA Testing Framework</div>
</div>
</body>
</html>"""


def generate_test_results_html(results):
    # ... generates pass/fail table grouped by suite
    # See full implementation in project source
    pass


def generate_training_guide_html(captures):
    # ... generates step-by-step training guide with screenshots
    # Groups by user story, embeds base64 screenshots
    # See full implementation in project source
    pass


def main():
    fmt = "html"
    if "--format" in sys.argv:
        idx = sys.argv.index("--format")
        if idx + 1 < len(sys.argv):
            fmt = sys.argv[idx + 1]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print("Generating QA reports...")

    results = load_test_results()
    if results:
        html = generate_test_results_html(results)
        if html:
            (OUTPUT_DIR / "test-results.html").write_text(html)

    captures = load_doc_captures()
    if captures:
        html = generate_training_guide_html(captures)
        if html:
            (OUTPUT_DIR / "training-guide.html").write_text(html)

    print("Done!")


if __name__ == "__main__":
    main()
```

> **Note**: The full `generate_test_results_html` and `generate_training_guide_html` implementations are in the project source. The key pattern is: read JSON metadata + screenshots, embed as base64, output standalone HTML with the CSS above.

---

## 15. Step 13 — CI/CD with GitHub Actions

### .github/workflows/ci.yml — Smoke on Push/PR

```yaml
name: CI - Smoke Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  SF_BASE_URL: ${{ secrets.SF_BASE_URL }}
  SF_LOGIN_URL: ${{ secrets.SF_LOGIN_URL }}
  SF_SESSION_ID: ${{ secrets.SF_SESSION_ID }}

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=setup
      - run: npx playwright test --project=smoke --workers=1
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: smoke-test-report
          path: |
            playwright-report/
            test-data/test-results.json
          retention-days: 14
```

### .github/workflows/regression-nightly.yml — Nightly Regression

```yaml
name: Regression - Nightly

on:
  schedule:
    - cron: '0 2 * * 1-5'  # Mon-Fri 2:00 AM UTC
  workflow_dispatch:
    inputs:
      environment:
        description: 'Salesforce environment'
        required: false
        default: ''
        type: string

env:
  SF_ENV: ${{ inputs.environment || '' }}
  SF_BASE_URL: ${{ secrets.SF_BASE_URL }}
  SF_LOGIN_URL: ${{ secrets.SF_LOGIN_URL }}
  SF_SESSION_ID: ${{ secrets.SF_SESSION_ID }}

jobs:
  regression:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=setup
      - run: npx playwright test --project=regression --workers=20
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: regression-test-report
          path: |
            playwright-report/
            test-data/test-results.json
          retention-days: 30
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: failure-screenshots
          path: test-results/
          retention-days: 14
```

### .github/workflows/generate-docs.yml — Documentation Generation

```yaml
name: Generate Documentation

on:
  workflow_dispatch:
    inputs:
      format:
        description: 'Output format'
        required: false
        default: 'html'
        type: choice
        options:
          - html
          - pdf

env:
  SF_BASE_URL: ${{ secrets.SF_BASE_URL }}
  SF_LOGIN_URL: ${{ secrets.SF_LOGIN_URL }}
  SF_SESSION_ID: ${{ secrets.SF_SESSION_ID }}
  CAPTURE_DOCS: 'true'

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - uses: quarto-dev/quarto-actions/setup@v2
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=setup
      - run: npx playwright test --workers=1
      - run: python docs/scripts/generate-reports.py --format ${{ inputs.format || 'html' }}
      - uses: actions/upload-artifact@v4
        with:
          name: qa-documentation
          path: docs/output/
          retention-days: 90
      - uses: actions/upload-artifact@v4
        with:
          name: procedure-screenshots
          path: screenshots/
          retention-days: 90
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SF_BASE_URL` | Your Salesforce org URL (e.g., `https://your-org.lightning.force.com`) |
| `SF_LOGIN_URL` | Login endpoint (e.g., `https://login.salesforce.com`) |
| `SF_SESSION_ID` | A valid Salesforce session token for headless auth |

---

## 16. Step 14 — Git Configuration

### .gitignore

```gitignore
# Dependencies
node_modules/
dist/

# Environment files
.env
.env.sandbox
.env.dev
.env.prod
.env.local

# Playwright
playwright/.auth/
playwright-report/
blob-report/
test-results/

# Screenshots and test data (generated during runs)
screenshots/*
!screenshots/.gitkeep
test-data/*
!test-data/.gitkeep

# Quarto output
docs/output/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

### Create required .gitkeep files

```bash
mkdir -p screenshots test-data docs/output playwright/.auth
touch screenshots/.gitkeep test-data/.gitkeep docs/output/.gitkeep
```

---

## 17. Module-Based Test Organization

Tests are organized by Salesforce module under `tests/regression/`. Each module gets its own directory:

```
tests/regression/
├── budget/
│   ├── budget-create.spec.ts
│   ├── budget-edit.spec.ts
│   ├── budget-validation.spec.ts
│   └── budget-workflow.spec.ts
├── attendance/
│   ├── attendance-create.spec.ts
│   └── attendance-verification.spec.ts
├── enrollment/
├── screening/
├── incident/
├── invoice/
├── seat-capacity/
├── monitoring-coaching/
├── checklist/
├── checklist-templates/
├── procurement/
├── document-management/
├── data-migration/
└── esms-integration/
```

### Module List (for tracking)

| # | Module | Priority | Description |
|---|--------|----------|-------------|
| 1 | Budget | High | Budget creation, editing, approval workflows |
| 2 | Attendance | High | Attendance tracking and verification |
| 3 | Invoice | High | Invoice generation and processing |
| 4 | Screening | High | Screening module workflows |
| 5 | Enrollment | High | Enrollment processing |
| 6 | Seat & Capacity | High | Seat and capacity management |
| 7 | Monitoring/Coaching Logs | High | Monitoring and coaching log management |
| 8 | Incident | High | Incident reporting and management |
| 9 | Checklist | High | Checklist creation and completion |
| 10 | Checklist Templates | High | Checklist template management |
| 11 | Procurement | Medium | Procurement workflows |
| 12 | Document Management | Medium | Document management |
| 13 | Data Migration | Medium | Data migration testing |
| 14 | ESMS Integration | Medium | Integration with external systems |
| 15 | Reporting / Dashboard | Medium | Report and dashboard verification |

### Module Tag Convention

Each test file's `test.describe()` block should include the module name for report grouping. The convention is:

```typescript
// File: tests/regression/budget/budget-create.spec.ts

// The describe block title serves as the user story AND module grouping
test.describe('Budget - Create a new budget allocation', () => {
  // The prefix "Budget - " is used by the report generator to group by module
  test('can create a budget from the list view', async ({ ... }) => {
    // ...
  });
});
```

The report generator extracts the module from the `userStory` field (which comes from the `test.describe()` title) by looking for the prefix before the first ` - `.

---

## 18. HTML Report System — Module Dashboard & Summary Views

The reporting system generates HTML with two views:

### View 1: Module Dashboard (Summary Table)

Shows aggregate statistics per module — matches the tracking spreadsheet:

| Module | # Created | # Passed | # Failed | # Blocked | # No Run | Passed% | Failed% |
|--------|-----------|----------|----------|-----------|----------|---------|---------|
| Budget | 146 | 100 | 0 | 0 | 0 | 68.49% | 0.00% |
| Incident | 56 | 50 | 5 | 0 | 0 | 89.29% | 8.93% |
| ... | ... | ... | ... | ... | ... | ... | ... |
| **Total** | **562** | **436** | **25** | **53** | **151** | **77.58%** | **4.45%** |

### View 2: Training Guide (per module, per user story)

The hierarchy is:

```
Module (top-level collapsible)
  └── User Story (collapsible section)
       └── Test Case (procedure with steps)
            └── Step 1: Screenshot + description
            └── Step 2: Screenshot + description
            └── ...
```

This adds one more parent level (Module) above the existing user story grouping that the training guide already uses.

### How to implement in generate-reports.py

The key change to the report generator is to:

1. **Extract module name** from the `userStory` field (e.g., "Budget - Create a new budget" → module = "Budget")
2. **Group captures by module first**, then by user story within each module
3. **Add a module summary table** at the top of the report
4. **Nest the existing user story collapsible sections** inside module-level collapsible sections

The doc capture metadata JSON supports this naturally — the `userStory` field already contains the module prefix from the `test.describe()` block.

---

## 19. Salesforce-Specific Lessons Learned

### Lightning Selectors That Work

| Element | Selector Strategy |
|---------|------------------|
| Text fields | `page.getByRole('textbox', { name: label })` |
| Picklists | `page.getByRole('combobox', { name: label })` then `getByRole('option', { name: value })` |
| Lookups | `getByRole('combobox', { name: label })` → fill → `lightning-base-combobox-item[role="option"]` |
| Checkboxes | `page.getByLabel(label)` then `.check()` / `.uncheck()` |
| Dates | `page.getByLabel(label)` → fill → `press('Tab')` to close picker |
| Buttons | `page.getByRole('button', { name: 'Save', exact: true })` |
| Tabs | `page.getByRole('tab', { name: 'Details' })` |
| Radio buttons | `page.getByRole('radio', { name: recordTypeName })` |
| Record type selector | Check for "Next" button visibility as signal |
| Field values (detail) | `records-record-layout-item:has(span:text("Label")) .test-id__field-value` |
| Field values (fallback) | `records-record-layout-item:has(span:text("Label")) .slds-form-element__static` |
| Related lists | `lst-related-list-single-container:has(span:text("ListName"))` |
| List view count | `.countSortedByFilteredBy, span.itemsCount` |
| Toast messages | `div.toastMessage, span.toastMessage` |
| Spinners | `.slds-spinner_container`, `lightning-spinner` |
| Actions menu | `lightning-button-menu[slot="actions"]` |
| Menu items | `page.getByRole('menuitem', { name: 'Delete' })` |
| Record name | `main` → `getByRole('heading', { level: 1 })` |

### Things That Don't Work

- **`page.waitForLoadState('networkidle')`** — Salesforce never truly reaches network idle; it polls constantly
- **CSS-only selectors for fields** — Field labels use dynamic IDs; always use `getByLabel` or `getByRole`
- **Clicking picklist labels** — You must click the combobox role, not the label text
- **Assuming forms are ready after navigation** — Always check for Save button visibility before filling fields
- **Fixed delays (`page.waitForTimeout`)** — Never use these; Salesforce page load times vary wildly

### Common Gotchas

1. **Record type modal**: Not all objects have record types. Always check `hasRecordTypeSelector()` before trying to select one.
2. **Toast auto-dismiss**: Toasts disappear after ~5 seconds. Read the message immediately after save.
3. **Detail tab not default**: Lightning opens the Related tab by default. Always call `clickDetailsTab()` before reading field values.
4. **Inline edit requires double-click**: Single click on a field value doesn't activate inline edit.
5. **Lookup results timing**: After typing in a lookup, wait for the dropdown to populate before clicking. The `selectLookup` method handles this.
6. **Date format**: Salesforce Lightning date fields expect `MM/DD/YYYY` format and need `Tab` press to confirm.
7. **Save button disambiguation**: Use `{ exact: true }` to match exactly "Save" and not "Save & New".
8. **Fixed-position overlays in screenshots**: Omni-Channel bar and chat widgets float in the middle of full-page screenshots. The `DocCapture` class hides all `position: fixed` elements before screenshots.

---

## 20. Quick Start Checklist

When building this framework from scratch:

1. [ ] `npm init` and install dependencies (`@playwright/test`, `dotenv`, `tsx`, `typescript`, `@types/node`)
2. [ ] Create `tsconfig.json` with path aliases and `NodeNext` module resolution
3. [ ] Create `.env.example` and copy to `.env` with your org's Salesforce URLs
4. [ ] Create `playwright.config.ts` with setup/smoke/regression/visual/unit projects
5. [ ] Create directory structure: `src/{config,types,fixtures,pages,pages/components,helpers}`, `tests/{smoke,regression,unit}`, `scripts`, `docs/scripts`, `docs/output`
6. [ ] Create `screenshots/.gitkeep` and `test-data/.gitkeep`
7. [ ] Build `wait-helpers.ts` (4-phase wait strategy — this is the foundation)
8. [ ] Build `base.page.ts` (depends on wait-helpers)
9. [ ] Build `login.page.ts`, `list-view.page.ts`, `record-form.page.ts`, `record-detail.page.ts`
10. [ ] Build component objects: `toast.component.ts`, `modal.component.ts`, `related-list.component.ts`
11. [ ] Build `doc-capture.ts` and `navigation-helpers.ts`, `iframe-helpers.ts`
12. [ ] Build `salesforce.fixture.ts` (ties everything together)
13. [ ] Build `auth.setup.ts` and `scripts/auth-interactive.ts`
14. [ ] Run `npm run auth` to authenticate and cache session
15. [ ] Write your first smoke test using the template pattern
16. [ ] Organize regression tests by module directory
17. [ ] Create `docs/scripts/generate-reports.py` for HTML reports
18. [ ] Set up `.github/workflows/` for CI/CD
19. [ ] Create `.gitignore`
20. [ ] Run `npm run test:smoke` to verify everything works
