# ECMS QA Testing Framework

Playwright-based QA regression testing framework for the **NYC DOE ECMS** (Early Childhood Management System) Salesforce Lightning application. Tests run against Salesforce Lightning and Experience Cloud portals.

## Tech Stack

- **Playwright** (`@playwright/test`) — browser automation & test runner
- **TypeScript** (strict mode) — type-safe test authoring
- **Node.js 20+** — runtime
- **Python 3** — HTML report generation

## Quick Start

```bash
# Install dependencies
npm install
npx playwright install chromium

# Authenticate (opens browser for interactive login)
npm run auth

# Run smoke tests
npm run test:smoke

# Run full regression
npm run test:regression

# Run with documentation screenshots
npm run test:document

# View HTML report
npm run report
```

## Environment Setup

Copy `.env.example` to `.env` and set:

```bash
SF_BASE_URL=https://doeecms--test.sandbox.lightning.force.com
SF_LOGIN_URL=https://doeecms--test.sandbox.my.salesforce.com
```

Switch environments with `SF_ENV`:

```bash
npm run test:sandbox   # loads .env.sandbox
npm run test:dev       # loads .env.dev
npm run test:prod      # loads .env.prod
```

## Authentication

- **Local dev**: `npm run auth` opens a browser for interactive login (supports SSO/MFA). Session saved to `playwright/.auth/user.json`.
- **CI**: Set `SF_SESSION_ID` environment variable (GitHub secret). Uses `frontdoor.jsp` for headless auth.

## Project Structure

```
src/
  config/          # Environment & persona configuration
  fixtures/        # Custom Playwright fixtures (import for all tests)
  helpers/         # Wait strategies, navigation, iframe, doc capture
  pages/           # Page Object Model (base, login, list-view, record-form, etc.)
  reporters/       # Custom ECMS dashboard reporter
  types/           # TypeScript interfaces
tests/
  auth.setup.ts    # Authentication setup (runs before all tests)
  smoke/           # Fast smoke tests
  regression/      # Full regression tests by module
    attendance/    # Daily, weekly, monthly attendance
    budget/        # Budget CRUD, approval, amendments
    checklist/     # Checklist assignment & templates
    enrollment/    # Student enrollment lifecycle
    incident/      # Incident reporting
    invoice/       # Invoice creation
    monitoring-coaching/  # Coaching logs & goals
    screening/     # Student screening
    seat-capacity/ # Seat capacity management
docs/
  scripts/         # Report generation (Python)
  output/          # Generated HTML reports
```

## Vendor Login Flow (Experience Cloud)

Tests that run as a vendor user follow this portal login pattern:

1. Navigate to **Contacts** > **All Contacts**
2. Search for the vendor contact (e.g., "Jennifer Winget")
3. Open the contact record
4. Click **"Log in to Experience as User"** button
5. Portal redirects to Experience Cloud (same tab)

## Portal Navigation (Attendance Module)

The attendance portal uses a drill-down table pattern:

- **Sites** table > click site button (e.g., `NY-S`)
- **Classes** table > click class button (e.g., `JuniorKG`)
- **Students** table > click student button
- Attendance form > set status, check-in/out times, save

"Attendance" is a **dropdown button** in the portal nav with sub-items:
- Weekly Attendance
- Daily Attendance
- Monthly Review

## Test Commands

| Command | Description |
|---------|-------------|
| `npm run auth` | Interactive Salesforce login |
| `npm test` | Run all tests |
| `npm run test:smoke` | Smoke tests only |
| `npm run test:regression` | Full regression suite |
| `npm run test:document` | Capture screenshots + generate reports |
| `npm run test:headed` | Run with visible browser |
| `npm run test:debug` | Step-through debug mode |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | Open HTML test report |

## Reports

- **Playwright HTML Report**: `playwright-report/index.html`
- **ECMS Dashboard**: `playwright-report/ecms-dashboard.html`
- **Training Guide** (with screenshots): `docs/output/training-guide.html`
- **Test Results Summary**: `docs/output/test-results.html`

## CI/CD

- **Smoke tests**: Run on every push/PR to `main`
- **Regression**: Nightly Mon-Fri at 2:00 AM UTC
- **Documentation**: Manual trigger via GitHub Actions

## Key Architecture Notes

- **4-phase Salesforce wait strategy** — handles spinners, Aura idle, skeleton loaders, and DOM stability
- **Object-agnostic page objects** — `RecordFormPage`, `ListViewPage`, `RecordDetailPage` work with any Salesforce object
- **18 persona definitions** — role-based testing with separate session tokens
- **No passwords stored** — interactive login or session tokens only
