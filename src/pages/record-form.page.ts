import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

export class RecordFormPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // --- Record Type Selection ---
  async selectRecordType(recordTypeName: string): Promise<void> {
    const radio = this.page.getByRole('radio', { name: recordTypeName });
    await radio.check();
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.waitForLightningReady();
    await this.waitForFormReady();
  }

  async hasRecordTypeSelector(): Promise<boolean> {
    try {
      await this.page.getByRole('button', { name: 'Next' }).waitFor({
        state: 'visible',
        timeout: 5_000,
      });
      return true;
    } catch {
      return false;
    }
  }

  async waitForFormReady(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save', exact: true }).waitFor({
      state: 'visible',
      timeout: 15_000,
    });
  }

  // --- Field Interactions ---
  async fillField(label: string, value: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: label });
    await input.click();
    await input.clear();
    await input.fill(value);
  }

  async fillTextArea(label: string, value: string): Promise<void> {
    const textarea = this.page.getByRole('textbox', { name: label });
    await textarea.click();
    await textarea.clear();
    await textarea.fill(value);
  }

  async selectPicklist(label: string, value: string): Promise<void> {
    const combobox = this.page.getByRole('combobox', { name: label });
    await combobox.click();
    await this.page.getByRole('option', { name: value }).click();
  }

  async selectLookup(label: string, searchText: string, selectText?: string): Promise<void> {
    const lookupInput = this.page.getByRole('combobox', { name: label });
    await lookupInput.click();
    await lookupInput.fill(searchText);
    const resultText = selectText || searchText;
    await this.page
      .locator(`lightning-base-combobox-item[role="option"]`)
      .filter({ hasText: resultText })
      .first()
      .click();
  }

  async setCheckbox(label: string, checked: boolean): Promise<void> {
    const checkbox = this.page.getByLabel(label, { exact: false });
    if (checked) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  async setDate(label: string, dateValue: string): Promise<void> {
    const dateInput = this.page.getByLabel(label, { exact: false });
    await dateInput.click();
    await dateInput.clear();
    await dateInput.fill(dateValue);
    await dateInput.press('Tab'); // Close date picker and confirm
  }

  // --- Form Actions ---
  async save(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.waitForSpinnerToDisappear();
  }

  async saveAndNew(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save & New' }).click();
    await this.waitForSpinnerToDisappear();
  }

  async cancel(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  // --- Validation ---
  async expectFieldError(label: string, errorText: string): Promise<void> {
    const errorMessage = this.page.locator(
      `lightning-input:has(label:text("${label}")) .slds-form-element__help, ` +
      `lightning-textarea:has(label:text("${label}")) .slds-form-element__help, ` +
      `lightning-combobox:has(label:text("${label}")) .slds-form-element__help`
    );
    await expect(errorMessage).toContainText(errorText);
  }

  async expectPageError(errorText: string): Promise<void> {
    await expect(this.page.locator('.forceFormPageError, .pageError')).toContainText(errorText);
  }

  async isFieldPresent(label: string): Promise<boolean> {
    return await this.page.getByLabel(label, { exact: false }).isVisible().catch(() => false);
  }

  async isFieldRequired(label: string): Promise<boolean> {
    const requiredIndicator = this.page.locator(
      `lightning-input:has(label:text("${label}")) abbr[title="required"], ` +
      `lightning-textarea:has(label:text("${label}")) abbr[title="required"], ` +
      `lightning-combobox:has(label:text("${label}")) abbr[title="required"]`
    );
    return await requiredIndicator.isVisible().catch(() => false);
  }

  // --- Bulk Operations ---
  async fillFields(fields: Record<string, string>): Promise<void> {
    for (const [label, value] of Object.entries(fields)) {
      await this.fillField(label, value);
    }
  }

  async fillForm(config: {
    fields?: Record<string, string>;
    picklists?: Record<string, string>;
    lookups?: Record<string, string>;
    checkboxes?: Record<string, boolean>;
    dates?: Record<string, string>;
  }): Promise<void> {
    if (config.fields) {
      for (const [label, value] of Object.entries(config.fields)) {
        await this.fillField(label, value);
      }
    }
    if (config.picklists) {
      for (const [label, value] of Object.entries(config.picklists)) {
        await this.selectPicklist(label, value);
      }
    }
    if (config.lookups) {
      for (const [label, value] of Object.entries(config.lookups)) {
        await this.selectLookup(label, value);
      }
    }
    if (config.checkboxes) {
      for (const [label, value] of Object.entries(config.checkboxes)) {
        await this.setCheckbox(label, value);
      }
    }
    if (config.dates) {
      for (const [label, value] of Object.entries(config.dates)) {
        await this.setDate(label, value);
      }
    }
  }
}
