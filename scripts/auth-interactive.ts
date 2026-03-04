import { chromium } from '@playwright/test';
import { getTestConfig } from '../src/config/environments.js';
import * as fs from 'fs';
import * as path from 'path';

const authDir = path.resolve(process.cwd(), 'playwright/.auth');
const authFile = path.join(authDir, 'user.json');

async function main() {
  const { environment: env } = getTestConfig();

  console.log('');
  console.log('  Salesforce Interactive Login');
  console.log('  --------------------------------');
  console.log(`  Org: ${env.baseUrl}`);
  console.log('');
  console.log('  A browser window will open. Log in to Salesforce.');
  console.log('  The window will close automatically once you reach the home page.');
  console.log('');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(env.loginUrl);
  await page.waitForURL('**/lightning/**', { timeout: 300_000 });
  await page.waitForLoadState('domcontentloaded');

  fs.mkdirSync(authDir, { recursive: true });
  await context.storageState({ path: authFile });
  await browser.close();

  console.log('');
  console.log('  Session saved to playwright/.auth/user.json');
  console.log('  You can now run tests: npm run test:smoke');
  console.log('');
}

main().catch((err) => {
  console.error('Authentication failed:', err.message);
  process.exit(1);
});
