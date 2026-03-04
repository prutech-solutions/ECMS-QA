import { test as base } from '@playwright/test';
import { BasePage } from '../pages/base.page.js';
import { RecordFormPage } from '../pages/record-form.page.js';
import { RecordDetailPage } from '../pages/record-detail.page.js';
import { ListViewPage } from '../pages/list-view.page.js';
import { ToastComponent } from '../pages/components/toast.component.js';
import { ModalComponent } from '../pages/components/modal.component.js';
import { DocCapture } from '../helpers/doc-capture.js';

type SalesforceFixtures = {
  basePage: BasePage;
  recordForm: RecordFormPage;
  recordDetail: RecordDetailPage;
  listView: ListViewPage;
  toast: ToastComponent;
  modal: ModalComponent;
  docCapture: DocCapture;
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
});

export { expect } from '@playwright/test';
