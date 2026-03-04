import { type Page } from '@playwright/test';
import { waitForPageReady } from './wait-helpers.js';

/**
 * Navigate to the Experience Cloud portal via App Launcher.
 * The portal is typically accessed by searching "Experience" or the portal name.
 */
export async function navigateToPortal(page: Page, portalName = 'ECMS Portal'): Promise<void> {
  // Open App Launcher
  await page.locator('button.slds-global-actions__item[title="App Launcher"]').click();
  await page.locator('div.appLauncherMenu').waitFor({ state: 'visible' });

  const searchInput = page.locator('input[placeholder="Search apps and items..."]');
  await searchInput.fill(portalName);
  await page.locator('one-app-launcher-menu-item mark').first().waitFor({
    state: 'visible', timeout: 10_000,
  });
  await page.getByRole('option', { name: new RegExp(portalName, 'i') }).first().click();
  await waitForPageReady(page);
}

/**
 * Navigate to a specific tab within the Experience Cloud portal.
 */
export async function navigateToPortalTab(page: Page, tabLabel: string): Promise<void> {
  // Portal tabs are typically rendered as community navigation items
  const tab = page.locator(`a[title="${tabLabel}"], a:has-text("${tabLabel}")`).first();
  await tab.click();
  await waitForPageReady(page);
}

/**
 * Click the "More" menu in portal navigation and select an item.
 */
export async function clickPortalMoreMenu(page: Page, itemLabel: string): Promise<void> {
  const moreButton = page.locator('button:has-text("More"), a:has-text("More")').first();
  await moreButton.click();
  await page.locator(`a:has-text("${itemLabel}"), button:has-text("${itemLabel}")`).first().click();
  await waitForPageReady(page);
}

/**
 * Login as an experience-cloud user on the portal login page.
 * Used when testing external portal flows directly.
 */
export async function portalLoginAsVendor(
  page: Page,
  portalUrl: string,
  username: string,
  password: string,
): Promise<void> {
  await page.goto(portalUrl);
  await page.fill('input[name="username"], #username', username);
  await page.fill('input[name="password"], #password', password);
  await page.click('button[type="submit"], input[type="submit"]');
  await waitForPageReady(page);
}

/**
 * Navigate to the "Login As" experience user from internal SF setup.
 * Useful for testing portal as a specific vendor user from admin context.
 */
export async function loginAsExperienceUser(page: Page, contactName: string): Promise<void> {
  // TODO: Implement based on the org's "Login As" flow
  // Typically: Setup > Users > find contact > "Log in to Experience as User"
  throw new Error(`loginAsExperienceUser not yet implemented for contact: ${contactName}`);
}
