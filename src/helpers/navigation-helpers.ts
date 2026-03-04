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
