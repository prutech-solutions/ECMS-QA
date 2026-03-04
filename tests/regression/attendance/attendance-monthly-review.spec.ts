import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';
import type { Page } from '@playwright/test';
import type { BasePage } from '../../../src/pages/base.page.js';
import type { ListViewPage } from '../../../src/pages/list-view.page.js';
import type { DocCapture } from '../../../src/helpers/doc-capture.js';

/** Shared vendor login: navigate to Contact, search, and log in to Experience portal */
async function loginAsVendor(
  page: Page, basePage: BasePage, listView: ListViewPage, docCapture: DocCapture,
) {
  await basePage.navigateToObject('Contact');
  await page.getByText('Recently Viewed').click();
  await page.getByText('All Contacts').click();
  await listView.waitForListToLoad();
  await listView.searchList('Jennifer Winget');
  await expect(page.getByRole('link', { name: 'Jennifer Winget' })).toBeVisible();
  await docCapture.step('Searched for Jennifer Winget in All Contacts');

  await page.getByRole('link', { name: 'Jennifer Winget' }).click();
  await basePage.waitForLightningReady();
  await expect(page.locator('records-lwc-highlights-panel')).toBeVisible();
  await docCapture.step('Opened Jennifer Winget contact record');

  await page.getByRole('button', { name: /Log in to Experience as User/i }).click();
  await page.waitForURL(/.*\/s\/.*/i, { timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('Jennifer Winget')).toBeVisible();
  await docCapture.step('Logged into ECMS portal as Vendor Admin');
}

/**
 * Attendance — Monthly Review, Dashboards, Validations & Defects
 * Persona: Vendor Admin (logs in as Jennifer Winget via Experience Cloud)
 */
test.describe('Attendance - Monthly Review', () => {

  test('TC-ATT-MR1: Vendor Admin can submit Monthly Review', async ({
    page, basePage, listView, docCapture,
  }) => {
    await test.step('Log in to Experience as Vendor User', async () => {
      await loginAsVendor(page, basePage, listView, docCapture);
    });

    await test.step('Navigate to Attendance on portal', async () => {
      await page.getByRole('button', { name: 'Attendance' }).click();
      await page.waitForLoadState('domcontentloaded');
      await docCapture.step('Opened Attendance menu on portal');
    });

    throw new Error('TODO: Record Monthly Review submission steps via Playwright codegen');
  });

  test('TC-ATT-MR2: Vendor can take attendance when enrollment is submitted/approved', async ({
    page, basePage, listView, docCapture,
  }) => {
    await test.step('Log in to Experience as Vendor User', async () => {
      await loginAsVendor(page, basePage, listView, docCapture);
    });

    throw new Error('TODO: Record attendance-for-approved-enrollment steps via Playwright codegen');
  });
});

test.describe('Attendance - Dashboards', () => {

  test('TC-ATT-DASH1: Internal Admin has access to view Attendance Dashboards', async ({
    page, basePage, docCapture,
  }) => {
    // Internal admin test — no portal login needed, uses SF backend
    await test.step('Navigate to Dashboards', async () => {
      await basePage.navigateToUrl('/lightning/o/Dashboard/home');
      await basePage.waitForLightningReady();
      await expect(page).toHaveURL(/\/lightning\/o\/Dashboard/);
      await docCapture.step('Navigated to Dashboards');
    });

    throw new Error('TODO: Record dashboard verification steps via Playwright codegen');
  });
});

test.describe('Attendance - Defect Validations', () => {

  test('TC-ATT-DEF1: Error displayed when accessing Attendance as CBO Staff', async () => {
    test.fixme(true, 'Needs CBO Staff persona contact to be identified and recorded');
  });

  test('TC-ATT-DEF2: CB Vendor User unable to access Monthly Review', async () => {
    test.fixme(true, 'Needs CB Vendor persona contact to be identified and recorded');
  });

  test('TC-ATT-DEF3: CBO Vendor User unable to select attendance status', async () => {
    test.fixme(true, 'Needs CBO Vendor persona contact to be identified and recorded');
  });
});
