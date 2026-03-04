import { test as setup } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page.js';
import { getEnvironment } from '../src/config/environments.js';
import * as fs from 'fs';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const env = getEnvironment();
  const loginPage = new LoginPage(page);

  // Check if we already have a cached session
  if (fs.existsSync(authFile)) {
    const cached = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    if (cached.cookies?.length > 0) {
      await page.context().addCookies(cached.cookies);
      await page.goto(`${env.baseUrl}/lightning/page/home`);
      if (page.url().includes('/lightning/')) {
        await page.context().storageState({ path: authFile });
        return;  // Session still valid
      }
    }
  }

  // Authenticate fresh
  if (env.sessionId) {
    await loginPage.loginWithSessionId(env);  // CI mode
  } else {
    await loginPage.loginInteractive(env);     // Local mode
  }

  await page.context().storageState({ path: authFile });
});
