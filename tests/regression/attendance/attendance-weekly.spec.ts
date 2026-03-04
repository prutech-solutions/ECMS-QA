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
 * Attendance — Weekly Attendance CRUD
 * Persona: Vendor Admin (logs in as Jennifer Winget via Experience Cloud)
 */
test.describe('Attendance - Weekly attendance management', () => {

  test('TC-ATT-W1: Vendor Admin can create weekly attendance for enrolled student', async ({
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

    throw new Error('TODO: Record weekly attendance creation steps via Playwright codegen');
  });

  test('TC-ATT-W2: Vendor Admin can create weekly attendance with 2nd Check In/Out', async ({
    page, basePage, listView, docCapture,
  }) => {
    await test.step('Log in to Experience as Vendor User', async () => {
      await loginAsVendor(page, basePage, listView, docCapture);
    });

    throw new Error('TODO: Record 2nd check-in/out steps via Playwright codegen');
  });

  test('TC-ATT-W10: Verify 2nd Check In/Out fields displayed in backend Attendance', async ({
    page, basePage, docCapture,
  }) => {
    // This test verifies backend SF fields — no portal login needed
    await test.step('Navigate to Attendance object in SF backend', async () => {
      await basePage.navigateToObject('Attendance__c');
      await basePage.waitForLightningReady();
      await docCapture.step('Navigated to Attendance object in backend');
    });

    throw new Error('TODO: Record backend attendance field verification steps via Playwright codegen');
  });
});
