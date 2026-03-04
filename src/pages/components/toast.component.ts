import { type Page, expect } from '@playwright/test';

export class ToastComponent {
  constructor(private page: Page) {}

  private get toastContainer() {
    return this.page.locator('div.toastContainer');
  }

  private get toastMessage() {
    return this.page.locator('div.toastMessage, span.toastMessage');
  }

  private get toastClose() {
    return this.page.locator('button.toastClose');
  }

  async waitForToast(timeout = 10_000): Promise<void> {
    await this.toastContainer.waitFor({ state: 'visible', timeout });
  }

  async getMessage(): Promise<string> {
    await this.waitForToast();
    return (await this.toastMessage.first().innerText()).trim();
  }

  async expectSuccess(message?: string): Promise<void> {
    await this.waitForToast();
    if (message) {
      await expect(this.toastMessage.first()).toContainText(message);
    }
    await expect(
      this.page.locator('.forceVisualMessageQueue .toastMessage').first()
    ).toBeVisible();
  }

  async expectError(message?: string): Promise<void> {
    await this.waitForToast();
    if (message) {
      await expect(this.toastMessage.first()).toContainText(message);
    }
  }

  async expectWarning(message?: string): Promise<void> {
    await this.waitForToast();
    if (message) {
      await expect(this.toastMessage.first()).toContainText(message);
    }
  }

  async dismiss(): Promise<void> {
    if (await this.toastClose.first().isVisible().catch(() => false)) {
      await this.toastClose.first().click();
    }
  }

  async dismissAll(): Promise<void> {
    const closeButtons = this.toastClose;
    const count = await closeButtons.count();
    for (let i = 0; i < count; i++) {
      await closeButtons.nth(i).click().catch(() => {});
    }
  }
}
