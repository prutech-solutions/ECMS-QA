# CLAUDE.md — Project Instructions for Claude Code

## Project Overview

This is the ECMS QA Playwright testing framework for NYC DOE's Salesforce-based Early Childhood Management System. Tests run against a Salesforce Lightning org and Experience Cloud portals.

## Environment

- **Sandbox URL**: `https://doeecms--test.sandbox.lightning.force.com`
- **Login URL**: `https://doeecms--test.sandbox.my.salesforce.com`
- **Auth session**: `playwright/.auth/user.json` (run `npm run auth` if expired)
- **Node.js 20+**, **TypeScript strict mode**, **Python 3** for reports

## Critical Patterns

### Salesforce Wait Strategy
Always use `waitForLightningReady()` or `waitForSalesforcePage()` after navigation. Salesforce Lightning has multiple loading phases (spinners, Aura framework, skeleton loaders, DOM stability). Never use raw `waitForTimeout`.

### Test Imports
All tests import from the custom fixture, not directly from Playwright:
```typescript
import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';
```

### Portal Navigation Elements
The Experience Cloud portal uses specific element types:
- **Nav items with dropdowns** (Attendance, More) are `button` role, not `link`
- **Nav items without dropdowns** (Home, Account, Sites) are `link` role
- **Table row names** (sites, classes, students) are `button` role in grid `rowheader`
- **"Back to X"** buttons exist for drill-down navigation

### Vendor Login Flow
To test as a vendor user in the Experience Cloud portal:
1. `basePage.navigateToObject('Contact')` — go to Contacts
2. Switch to "All Contacts" list view (click "Recently Viewed" then "All Contacts")
3. `listView.searchList('Jennifer Winget')` — search for vendor contact
4. Click the contact link, then `basePage.waitForLightningReady()`
5. `page.getByRole('button', { name: /Log in to Experience as User/i }).click()`
6. `page.waitForURL(/.*\/s\/.*/i, { timeout: 30_000 })` — same-tab redirect to portal
7. Assert `page.getByText('Jennifer Winget')` is visible

### Attendance Portal Drill-Down
After entering the portal:
- Click `getByRole('button', { name: 'Attendance' })` to open dropdown
- Click `getByRole('link', { name: 'Weekly Attendance' })` (or Daily/Monthly)
- **Sites table** → click `getByRole('button', { name: 'NY-S' })`
- **Classes table** → click `getByRole('button', { name: 'ClassName' })`
- **Students table** → click student button
- Available classes in sandbox: Class 1A, TestClass-Infant, New Class, 32, fdgdg, erty76
- JuniorKG class does not exist yet in sandbox

## File Conventions

- **Test files**: `tests/regression/<module>/<module>-<feature>.spec.ts`
- **Page objects**: `src/pages/<name>.page.ts` — extend `BasePage`
- **Components**: `src/pages/components/<name>.component.ts`
- **Helpers**: `src/helpers/<name>-helpers.ts`
- **Config**: `src/config/` — environments and personas
- **TypeScript path aliases**: `@config/*`, `@fixtures/*`, `@helpers/*`, `@pages/*`, `@types/*`

## Test Organization

Tests are grouped by Salesforce module under `tests/regression/`:
- `attendance/` — daily, weekly, monthly-review
- `budget/` — create, edit, approval, amend, comments, permissions, documents, e2e, negative
- `checklist/` — assignment, management, template-lifecycle
- `enrollment/` — create, setup, approval, management
- `incident/`, `invoice/`, `monitoring-coaching/`, `screening/`, `seat-capacity/`

## Running Tests

```bash
npm run test:smoke              # Quick validation
npm run test:regression         # Full suite
npm run test:document           # With screenshots + report generation
npx playwright test -g "TC-ATT-D1"  # Run single test by name
npx playwright test tests/regression/attendance/  # Run module
```

## Unimplemented Tests

Many tests still have `throw new Error('TODO: ...')` placeholders. These correctly fail rather than falsely passing. Use `test.fixme()` for tests that need a different persona or data that doesn't exist yet.

To record new test steps:
```bash
npx playwright codegen --load-storage=playwright/.auth/user.json https://doeecms--test.sandbox.lightning.force.com
```

## Do NOT

- Store passwords or credentials in code or .env files committed to git
- Use `--break-system-packages` with pip (WSL2/Debian PEP 668)
- Use bare `waitForTimeout()` — always use Salesforce-aware waits
- Create tests that pass with no assertions (use `throw` or `test.fixme()` for stubs)
- Modify `playwright/.auth/user.json` manually — use `npm run auth`
