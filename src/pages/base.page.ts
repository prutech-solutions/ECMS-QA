import { type Page, type Locator, expect } from '@playwright/test';
import { waitForSalesforcePage, waitForSpinners } from '../helpers/wait-helpers.js';

export class BasePage {
  constructor(protected page: Page) {}

  // --- Navigation ---
  async navigateToUrl(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForLightningReady();
  }

  async navigateToObject(objectApiName: string): Promise<void> {
    await this.page.goto(`/lightning/o/${objectApiName}/list`);
    await this.waitForLightningReady();
  }

  async navigateToRecord(recordId: string): Promise<void> {
    await this.page.goto(`/lightning/r/${recordId}/view`);
    await this.waitForLightningReady();
  }

  async navigateToNewRecord(objectApiName: string): Promise<void> {
    await this.page.goto(`/lightning/o/${objectApiName}/new`);
    await this.waitForLightningReady();
  }

  // --- Lightning Waits ---
  async waitForLightningReady(): Promise<void> {
    await waitForSalesforcePage(this.page);
  }

  async waitForSpinnerToDisappear(): Promise<void> {
    await waitForSpinners(this.page);
  }

  // --- Toast Notifications ---
  async getToastMessage(): Promise<string> {
    const toast = this.page.locator('div.toastMessage');
    await toast.waitFor({ state: 'visible', timeout: 10_000 });
    return await toast.innerText();
  }

  async expectToastSuccess(expectedText?: string): Promise<void> {
    const toast = this.page.locator('div.forceActionsText');
    await toast.waitFor({ state: 'visible', timeout: 10_000 });
    if (expectedText) {
      await expect(toast).toContainText(expectedText);
    }
  }

  async dismissToast(): Promise<void> {
    const closeButton = this.page.locator('button.toastClose');
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }
  }

  // --- Common Field Interactions ---
  getFieldByLabel(label: string): Locator {
    return this.page.getByLabel(label);
  }

  async getFieldValue(fieldLabel: string): Promise<string> {
    const field = this.page.locator(
      `records-record-layout-item:has(span:text("${fieldLabel}")) .slds-form-element__static`
    );
    if (await field.isVisible().catch(() => false)) {
      return await field.innerText();
    }
    const input = this.page.getByLabel(fieldLabel);
    return await input.inputValue().catch(() => '');
  }

  async isFieldEditable(fieldLabel: string): Promise<boolean> {
    const input = this.page.getByLabel(fieldLabel);
    if (await input.isVisible().catch(() => false)) {
      return await input.isEditable();
    }
    return false;
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
