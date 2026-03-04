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
