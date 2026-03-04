import { type Page, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

export class RecordDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // --- Tabs ---
  async clickDetailsTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Details' }).click();
    await this.waitForLightningReady();
  }

  async clickRelatedTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Related' }).click();
    await this.waitForLightningReady();
  }

  // --- Field Values ---
  async getDetailFieldValue(fieldLabel: string): Promise<string> {
    const fieldValue = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .test-id__field-value`
    ).first();
    if (await fieldValue.isVisible().catch(() => false)) {
      return (await fieldValue.innerText()).trim();
    }
    const fallback = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .slds-form-element__static`
    ).first();
    return (await fallback.innerText().catch(() => '')).trim();
  }

  async expectFieldValue(fieldLabel: string, expectedValue: string): Promise<void> {
    const value = await this.getDetailFieldValue(fieldLabel);
    expect(value).toContain(expectedValue);
  }

  async expectFieldPresent(fieldLabel: string): Promise<void> {
    await expect(this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}"))`
    ).first()).toBeVisible();
  }

  async expectFieldNotPresent(fieldLabel: string): Promise<void> {
    await expect(this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}"))`
    ).first()).not.toBeVisible();
  }

  // --- Editability ---
  async isFieldReadOnly(fieldLabel: string): Promise<boolean> {
    const staticValue = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .slds-form-element__static`
    ).first();
    const inputField = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) input, ` +
      `records-record-layout-item:has(span:text("${fieldLabel}")) textarea`
    ).first();
    const hasStatic = await staticValue.isVisible().catch(() => false);
    const hasInput = await inputField.isVisible().catch(() => false);
    return hasStatic && !hasInput;
  }

  async expectFieldReadOnly(fieldLabel: string): Promise<void> {
    expect(await this.isFieldReadOnly(fieldLabel), `Expected "${fieldLabel}" to be read-only`).toBe(true);
  }

  async expectFieldEditable(fieldLabel: string): Promise<void> {
    expect(await this.isFieldReadOnly(fieldLabel), `Expected "${fieldLabel}" to be editable`).toBe(false);
  }

  // --- Inline Edit ---
  async clickInlineEdit(fieldLabel: string): Promise<void> {
    const fieldArea = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .test-id__field-value`
    ).first();
    await fieldArea.dblclick();
    await this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) input, ` +
      `records-record-layout-item:has(span:text("${fieldLabel}")) textarea`
    ).first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async inlineEditField(fieldLabel: string, newValue: string): Promise<void> {
    await this.clickInlineEdit(fieldLabel);
    const input = this.page.getByRole('textbox', { name: fieldLabel });
    await input.clear();
    await input.fill(newValue);
  }

  async saveInlineEdit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.waitForSpinnerToDisappear();
  }

  // --- Record Actions ---
  async clickEdit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Edit' }).click();
    await this.waitForLightningReady();
  }

  async clickDelete(): Promise<void> {
    await this.page.locator('lightning-button-menu[slot="actions"]').click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
  }

  async confirmDelete(): Promise<void> {
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await this.waitForSpinnerToDisappear();
  }

  async clickClone(): Promise<void> {
    await this.page.locator('lightning-button-menu[slot="actions"]').click();
    await this.page.getByRole('menuitem', { name: 'Clone' }).click();
    await this.waitForLightningReady();
  }

  // --- Related Lists ---
  getRelatedList(listLabel: string) {
    return this.page.locator(
      `lst-related-list-single-container:has(span:text("${listLabel}"))`
    );
  }

  async getRelatedListCount(listLabel: string): Promise<number> {
    const countBadge = this.getRelatedList(listLabel).locator('.count');
    const text = await countBadge.innerText().catch(() => '0');
    return parseInt(text.replace(/[()]/g, ''), 10) || 0;
  }

  // --- Highlights Panel ---
  async getRecordName(): Promise<string> {
    const header = this.page.locator('main').getByRole('heading', { level: 1 }).first();
    const fullText = (await header.innerText()).trim();
    const parts = fullText.split('\n');
    return parts[parts.length - 1].trim();
  }

  async expectRecordName(expectedName: string): Promise<void> {
    expect(await this.getRecordName()).toContain(expectedName);
  }
}
