import { test as base } from '@playwright/test';
import { BasePage } from '../pages/base.page.js';
import { RecordFormPage } from '../pages/record-form.page.js';
import { RecordDetailPage } from '../pages/record-detail.page.js';
import { ListViewPage } from '../pages/list-view.page.js';
import { ToastComponent } from '../pages/components/toast.component.js';
import { ModalComponent } from '../pages/components/modal.component.js';
import { DocCapture } from '../helpers/doc-capture.js';
import { PERSONAS, type Persona } from '../config/personas.js';
import type { PersonaKey } from '../types/environment.types.js';

type SalesforceFixtures = {
  basePage: BasePage;
  recordForm: RecordFormPage;
  recordDetail: RecordDetailPage;
  listView: ListViewPage;
  toast: ToastComponent;
  modal: ModalComponent;
  docCapture: DocCapture;
  /** Current persona — defaults to system-admin (primary auth state). */
  persona: Persona;
  /** Helper to switch persona mid-test by loading a different storageState. */
  usePersona: (key: PersonaKey) => Promise<Persona>;
};

export const test = base.extend<SalesforceFixtures>({
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  recordForm: async ({ page }, use) => {
    await use(new RecordFormPage(page));
  },
  recordDetail: async ({ page }, use) => {
    await use(new RecordDetailPage(page));
  },
  listView: async ({ page }, use) => {
    await use(new ListViewPage(page));
  },
  toast: async ({ page }, use) => {
    await use(new ToastComponent(page));
  },
  modal: async ({ page }, use) => {
    await use(new ModalComponent(page));
  },
  docCapture: async ({ page }, use, testInfo) => {
    const capture = new DocCapture(page, testInfo.title);
    // Set user story from the describe block title
    if (testInfo.titlePath.length > 1) {
      capture.userStory = testInfo.titlePath[testInfo.titlePath.length - 2];
    }
    await use(capture);
    // Auto-finalize with test outcome
    const status = testInfo.status === 'passed' ? 'passed'
      : testInfo.status === 'failed' ? 'failed'
      : 'unknown';
    await capture.finalize(status, testInfo.error?.message);
  },
  persona: async ({}, use) => {
    // Default persona is system-admin (uses the primary storageState)
    await use(PERSONAS.systemAdmin);
  },
  usePersona: async ({ page, context }, use) => {
    const switchPersona = async (key: PersonaKey): Promise<Persona> => {
      const match = Object.values(PERSONAS).find(p => p.key === key);
      if (!match) {
        throw new Error(`Unknown persona: ${key}`);
      }
      // Load persona-specific storage state into the current context
      const fs = await import('fs');
      if (fs.existsSync(match.storageStatePath)) {
        const state = JSON.parse(fs.readFileSync(match.storageStatePath, 'utf-8'));
        if (state.cookies?.length) {
          await context.addCookies(state.cookies);
        }
      }
      return match;
    };
    await use(switchPersona);
  },
});

export { expect } from '@playwright/test';
