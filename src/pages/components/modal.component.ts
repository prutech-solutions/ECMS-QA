import { type Page, expect } from '@playwright/test';

export class ModalComponent {
  constructor(private page: Page) {}

  private get modal() {
    return this.page.locator('section[role="dialog"], div.modal-container').first();
  }

  private get modalHeader() {
    return this.modal.locator('h2, h1, .modal-header h2').first();
  }

  private get modalBody() {
    return this.modal.locator('.modal-body, .slds-modal__content').first();
  }

  async waitForModal(timeout = 10_000): Promise<void> {
    await this.modal.waitFor({ state: 'visible', timeout });
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible().catch(() => false);
  }

  async getTitle(): Promise<string> {
    await this.waitForModal();
    return (await this.modalHeader.innerText()).trim();
  }

  async expectTitle(expectedTitle: string): Promise<void> {
    await this.waitForModal();
    await expect(this.modalHeader).toContainText(expectedTitle);
  }

  async clickButton(buttonName: string): Promise<void> {
    await this.modal.getByRole('button', { name: buttonName }).click();
  }

  async clickSave(): Promise<void> { await this.clickButton('Save'); }
  async clickCancel(): Promise<void> { await this.clickButton('Cancel'); }

  async clickConfirm(): Promise<void> {
    await this.modal.getByRole('button', { name: /Delete|Confirm|OK|Yes/i }).first().click();
  }

  async close(): Promise<void> {
    await this.modal.locator('button[title="Close"], button.slds-modal__close').first().click();
  }

  async expectVisible(): Promise<void> { await expect(this.modal).toBeVisible(); }
  async expectHidden(): Promise<void> { await expect(this.modal).not.toBeVisible(); }

  async getBodyText(): Promise<string> {
    return (await this.modalBody.innerText()).trim();
  }
}
