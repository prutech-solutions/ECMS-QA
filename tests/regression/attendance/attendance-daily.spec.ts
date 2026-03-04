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
 * Attendance — Daily Attendance CRUD
 * Persona: Vendor Admin (logs in as Jennifer Winget via Experience Cloud)
 */
test.describe('Attendance - Daily attendance management', () => {

  test('TC-ATT-D1: Vendor Admin can create daily attendance for enrolled student', async ({
    page, basePage, listView, toast, docCapture,
  }) => {
    await test.step('Log in to Experience as Vendor User', async () => {
      await loginAsVendor(page, basePage, listView, docCapture);
    });

    await test.step('Navigate to Attendance → Weekly Attendance', async () => {
      await page.getByRole('button', { name: 'Attendance' }).click();
      await page.getByRole('link', { name: 'Weekly Attendance' }).click();
      await page.waitForLoadState('domcontentloaded');
      await docCapture.step('Navigated to Weekly Attendance page');
    });

    await test.step('Select EBC Site', async () => {
      // Sites table shows available sites — click on the site name
      await page.getByRole('button', { name: 'NY-S' }).click();
      await page.waitForLoadState('domcontentloaded');
      await docCapture.step('Selected NY-S (EBC Site)');
    });

    await test.step('Select JuniorKG Class', async () => {
      await expect(page.getByRole('heading', { name: 'Classes' })).toBeVisible();
      await page.getByRole('button', { name: 'JuniorKG' }).click();
      await page.waitForLoadState('domcontentloaded');
      await docCapture.step('Selected JuniorKG Class');
    });

    await test.step('Select Student', async () => {
      await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();
      // Click first student in the table
      await page.locator('table[role="grid"] tbody tr').first().getByRole('button').first().click();
      await page.waitForLoadState('domcontentloaded');
      await docCapture.step('Student selected');
    });

    await test.step('Enter attendance status as Present', async () => {
      await page.getByText('Present').first().click();
      await docCapture.step('Status set to Present');
    });

    await test.step('Add 1st Check In and Check Out timings', async () => {
      await page.getByLabel(/Check.?In/i).first().fill('09:00');
      await page.getByLabel(/Check.?Out/i).first().fill('17:00');
      await docCapture.step('Check In and Check Out times entered');
    });

    await test.step('Save attendance record', async () => {
      await page.getByRole('button', { name: /Save/i }).click();
      await page.waitForLoadState('domcontentloaded');
      await docCapture.step('Attendance record saved');
    });
  });

  test('TC-ATT-D2: Daily attendance should not allow before Admission Date', async ({
    page, basePage, listView, docCapture,
  }) => {
    await test.step('Log in to Experience as Vendor User', async () => {
      await loginAsVendor(page, basePage, listView, docCapture);
    });

    throw new Error('TODO: Record pre-admission date validation steps via Playwright codegen');
  });

  test('TC-ATT-D3: Attendance Date should not be before Student DOB', async ({
    page, basePage, listView, docCapture,
  }) => {
    await test.step('Log in to Experience as Vendor User', async () => {
      await loginAsVendor(page, basePage, listView, docCapture);
    });

    throw new Error('TODO: Record DOB validation steps via Playwright codegen');
  });

  test('TC-ATT-D4: Verify record should not save if no status is given', async ({
    page, basePage, listView, docCapture,
  }) => {
    await test.step('Log in to Experience as Vendor User', async () => {
      await loginAsVendor(page, basePage, listView, docCapture);
    });

    throw new Error('TODO: Record missing-status validation steps via Playwright codegen');
  });
});
