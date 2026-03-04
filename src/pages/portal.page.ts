import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';
import { waitForPageReady } from '../helpers/wait-helpers.js';

/**
 * Page object for Experience Cloud portal interactions.
 * Wraps portal-specific navigation, tabs, and community page elements.
 */
export class PortalPage extends BasePage {
  /** Portal top-level navigation bar */
  readonly navBar: Locator;
  /** The "More" dropdown in portal navigation */
  readonly moreMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.navBar = page.locator('nav[role="navigation"], .comm-navigation');
    this.moreMenu = page.locator('button:has-text("More"), a:has-text("More")').first();
  }

  /** Navigate to a portal tab by label */
  async clickTab(tabLabel: string): Promise<void> {
    const tab = this.page.locator(
      `a[title="${tabLabel}"], nav a:has-text("${tabLabel}")`
    ).first();
    await tab.click();
    await waitForPageReady(this.page);
  }

  /** Open the "More" menu and click an item */
  async clickMoreMenuItem(itemLabel: string): Promise<void> {
    await this.moreMenu.click();
    await this.page.locator(`a:has-text("${itemLabel}")`).first().click();
    await waitForPageReady(this.page);
  }

  /** Click the "New" button on a portal list view */
  async clickNewButton(): Promise<void> {
    await this.page.locator('button:has-text("New"), a:has-text("New")').first().click();
    await waitForPageReady(this.page);
  }

  /** Get the portal page heading text */
  async getPageHeading(): Promise<string> {
    const heading = this.page.locator('h1, h2, .slds-page-header__title').first();
    return (await heading.textContent()) ?? '';
  }

  /** Wait for portal content to fully load */
  async waitForPortalReady(): Promise<void> {
    await waitForPageReady(this.page);
    // Portal pages sometimes have additional community-specific spinners
    await this.page.locator('.comm-loading, .loading-indicator').waitFor({
      state: 'hidden',
      timeout: 15_000,
    }).catch(() => {
      // Spinner may not exist; that's fine
    });
  }
}
