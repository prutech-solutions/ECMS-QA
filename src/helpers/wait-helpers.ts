import { type Page } from '@playwright/test';

export interface SalesforceWaitOptions {
  /** Only run Phase 1 (spinners + domcontentloaded). Skips Aura and DOM stability. */
  spinnersOnly?: boolean;
  /** DOM quiescence interval in ms for Phase 4 (default 300). */
  settleMs?: number;
  /** Overall timeout in ms (default 30000). */
  timeout?: number;
  /** Skip the DOM stability phase entirely. */
  skipDomStability?: boolean;
  /** Skip waiting for skeleton/placeholder loaders to clear. */
  skipSkeletonWait?: boolean;
}

const DEFAULT_OPTIONS: Required<SalesforceWaitOptions> = {
  spinnersOnly: false,
  settleMs: 300,
  timeout: 30_000,
  skipDomStability: false,
  skipSkeletonWait: false,
};

/**
 * Master wait for Salesforce Lightning pages.
 *
 * Phase 1 (Hard signals):    domcontentloaded + all spinners hidden
 * Phase 2 (Soft signals):    Aura idle (best-effort, 5s timeout)
 * Phase 3 (Visual stability): Skeleton/stencil loaders gone
 * Phase 4 (DOM stability):    No DOM mutations for `settleMs`
 */
export async function waitForSalesforcePage(
  page: Page,
  options?: SalesforceWaitOptions
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // --- Phase 1: Hard signals (must pass) ---
  await page.waitForLoadState('domcontentloaded');
  await waitForAllSpinners(page, opts.timeout);

  if (opts.spinnersOnly) return;

  // --- Phase 2: Soft signals (best-effort) ---
  await waitForAuraIdle(page, 5_000);

  // --- Phase 3: Skeleton / stencil loaders ---
  if (!opts.skipSkeletonWait) {
    await waitForSkeletonLoaders(page, opts.timeout);
  }

  // --- Phase 4: DOM stability ---
  if (!opts.skipDomStability) {
    await waitForDomStability(page, opts.settleMs, opts.timeout);
  }
}

/**
 * Wait for ALL Lightning spinner variants to disappear.
 */
export async function waitForAllSpinners(page: Page, timeout = 30_000): Promise<void> {
  await page
    .locator('.slds-spinner_container')
    .waitFor({ state: 'hidden', timeout })
    .catch(() => {});

  await page
    .locator('lightning-spinner')
    .waitFor({ state: 'hidden', timeout })
    .catch(() => {});
}

/**
 * Wait for skeleton/stencil loaders to finish rendering.
 */
export async function waitForSkeletonLoaders(page: Page, timeout = 10_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const stencils = document.querySelectorAll(
        [
          'force-record-layout-stencil',
          'records-record-layout-stencil',
          'lst-list-view-manager-stencil',
          'force-list-view-manager-stencil',
          '.forceListViewManagerPendingGrid',
          '.stencil',
          'runtime_platform_tables-stencil-row',
        ].join(',')
      );
      if (stencils.length > 0) return false;

      const animated = document.querySelectorAll('.slds-is-animated, [class*="stencil"]');
      for (const el of animated) {
        if ((el as HTMLElement).offsetParent !== null) return false;
      }
      return true;
    },
    { timeout }
  ).catch(() => {});
}

export async function waitForSpinners(page: Page, timeout = 30_000): Promise<void> {
  await waitForAllSpinners(page, timeout);
}

/**
 * Wait for Aura framework to finish processing.
 */
export async function waitForAuraIdle(page: Page, timeout = 30_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const aura = (window as any).$A;
      if (!aura) return true; // Not an Aura page
      return !aura.eventService?.hasPendingEvents?.();
    },
    { timeout }
  ).catch(() => {});
}

/**
 * Wait until the DOM stops mutating for `quiesceMs` milliseconds.
 * Uses a MutationObserver to detect when the page has settled.
 */
export async function waitForDomStability(
  page: Page,
  quiesceMs = 200,
  timeout = 30_000
): Promise<void> {
  await page.evaluate(
    ({ quiesceMs, timeout }) => {
      return new Promise<void>((resolve) => {
        let timer: ReturnType<typeof setTimeout>;
        const deadline = setTimeout(resolve, timeout);

        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            observer.disconnect();
            clearTimeout(deadline);
            resolve();
          }, quiesceMs);
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });

        timer = setTimeout(() => {
          observer.disconnect();
          clearTimeout(deadline);
          resolve();
        }, quiesceMs);
      });
    },
    { quiesceMs, timeout }
  ).catch(() => {});
}

export async function waitForPageReady(page: Page): Promise<void> {
  await waitForSalesforcePage(page);
}

export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10_000
): Promise<void> {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout });
}

export async function retryAction(
  action: () => Promise<void>,
  maxRetries = 3,
  delayMs = 1000
): Promise<void> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await action();
      return;
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}
