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
