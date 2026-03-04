import { type Page, type FrameLocator } from '@playwright/test';

export function getVFIframe(page: Page, nameOrTitle: string): FrameLocator {
  return page.frameLocator(`iframe[name="${nameOrTitle}"], iframe[title="${nameOrTitle}"]`);
}

export function getVFIframeBySrc(page: Page, srcPattern: string): FrameLocator {
  return page.frameLocator(`iframe[src*="${srcPattern}"]`);
}

export async function waitForVFIframe(
  page: Page, nameOrTitle: string, timeout = 30_000
): Promise<FrameLocator> {
  await page.locator(
    `iframe[name="${nameOrTitle}"], iframe[title="${nameOrTitle}"]`
  ).first().waitFor({ state: 'attached', timeout });
  return getVFIframe(page, nameOrTitle);
}

export function getNestedIframe(
  page: Page, outerNameOrTitle: string, innerNameOrTitle: string
): FrameLocator {
  return getVFIframe(page, outerNameOrTitle).frameLocator(
    `iframe[name="${innerNameOrTitle}"], iframe[title="${innerNameOrTitle}"]`
  );
}

export async function evalInVFIframe(
  page: Page, nameOrTitle: string, script: string
): Promise<any> {
  const frame = page.frame({ name: nameOrTitle });
  if (!frame) throw new Error(`Frame "${nameOrTitle}" not found`);
  return await frame.evaluate(script);
}
