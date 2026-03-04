import { type Page } from '@playwright/test';
import type { SalesforceEnvironment } from '../types/environment.types.js';

export class LoginPage {
  constructor(private page: Page) {}

  /**
   * Authenticate via Salesforce session ID using frontdoor.jsp.
   * This is the CI/headless auth method — no username/password needed.
   */
  async loginWithSessionId(env: SalesforceEnvironment): Promise<void> {
    if (!env.sessionId) {
      throw new Error(
        'SF_SESSION_ID not set. Run `npm run auth` to log in interactively, ' +
        'or set SF_SESSION_ID in your environment for CI.'
      );
    }
    await this.page.goto(
      `${env.baseUrl}/secur/frontdoor.jsp?sid=${env.sessionId}`
    );
    await this.page.waitForURL('**/lightning/**', { timeout: 60_000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Interactive login — opens login page, waits up to 5 min for user to complete.
   * Handles SSO, MFA, any login flow automatically.
   */
  async loginInteractive(env: SalesforceEnvironment): Promise<void> {
    await this.page.goto(env.loginUrl);
    console.log('\n  Log in to Salesforce in the browser window...\n');
    await this.page.waitForURL('**/lightning/**', { timeout: 300_000 });
    await this.page.waitForLoadState('domcontentloaded');
  }
}
