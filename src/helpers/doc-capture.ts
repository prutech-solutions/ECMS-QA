import { type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { waitForSalesforcePage, type SalesforceWaitOptions } from './wait-helpers.js';

interface StepMetadata {
  step: number;
  name: string;
  description: string;
  screenshot: string;
  timestamp: string;
  type: 'step' | 'note' | 'error';
  detail?: string;
}

export interface TestDocData {
  testName: string;
  userStory?: string;
  status: 'passed' | 'failed' | 'unknown';
  error?: string;
  steps: StepMetadata[];
  startTime: string;
  endTime?: string;
  duration?: number;
}

/**
 * Documentation capture helper.
 * Only captures screenshots and metadata when CAPTURE_DOCS=true.
 */
export class DocCapture {
  private steps: StepMetadata[] = [];
  private stepCounter = 0;
  private testDir: string;
  private enabled: boolean;
  private testName: string;
  private startTime: string;
  private _userStory?: string;
  private defaultWaitOptions?: SalesforceWaitOptions;

  constructor(private page: Page, testName: string, waitOptions?: SalesforceWaitOptions) {
    this.enabled = process.env.CAPTURE_DOCS === 'true';
    this.testName = this.sanitizeName(testName);
    this.testDir = path.join(process.cwd(), 'screenshots', this.testName);
    this.startTime = new Date().toISOString();
    // Longer settle time so lazy-loaded sections finish rendering before screenshots
    this.defaultWaitOptions = { settleMs: 2500, skipSkeletonWait: true, ...waitOptions };

    if (this.enabled) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }
  }

  get isEnabled(): boolean { return this.enabled; }

  set userStory(story: string) { this._userStory = story; }

  async step(description: string, name?: string): Promise<void> {
    if (!this.enabled) return;

    this.stepCounter++;
    const stepNum = String(this.stepCounter).padStart(2, '0');
    const stepName = name || this.slugify(description);
    const screenshotFile = `step-${stepNum}-${stepName}.png`;
    const screenshotPath = path.join(this.testDir, screenshotFile);

    await waitForSalesforcePage(this.page, this.defaultWaitOptions);
    await this.hideFloatingOverlays();
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    await this.restoreFloatingOverlays();

    this.steps.push({
      step: this.stepCounter, name: stepName, description,
      screenshot: screenshotFile, timestamp: new Date().toISOString(), type: 'step',
    });
  }

  note(message: string): void {
    if (!this.enabled) return;
    this.stepCounter++;
    this.steps.push({
      step: this.stepCounter, name: 'note', description: message,
      screenshot: '', timestamp: new Date().toISOString(), type: 'note',
    });
  }

  async error(description: string, errorDetail?: string): Promise<void> {
    if (!this.enabled) return;
    this.stepCounter++;
    const stepNum = String(this.stepCounter).padStart(2, '0');
    const screenshotFile = `step-${stepNum}-error.png`;
    await this.page.screenshot({
      path: path.join(this.testDir, screenshotFile), fullPage: true,
    }).catch(() => {});
    this.steps.push({
      step: this.stepCounter, name: 'error', description,
      screenshot: screenshotFile, timestamp: new Date().toISOString(),
      type: 'error', detail: errorDetail,
    });
  }

  async stepElement(description: string, selector: string, name?: string): Promise<void> {
    if (!this.enabled) return;
    this.stepCounter++;
    const stepNum = String(this.stepCounter).padStart(2, '0');
    const stepName = name || this.slugify(description);
    const screenshotFile = `step-${stepNum}-${stepName}.png`;
    await waitForSalesforcePage(this.page, this.defaultWaitOptions);
    await this.page.locator(selector).first().screenshot({
      path: path.join(this.testDir, screenshotFile),
    });
    this.steps.push({
      step: this.stepCounter, name: stepName, description,
      screenshot: screenshotFile, timestamp: new Date().toISOString(), type: 'step',
    });
  }

  async finalize(status: 'passed' | 'failed' | 'unknown' = 'unknown', testError?: string): Promise<void> {
    if (!this.enabled || this.steps.length === 0) return;

    if (status === 'failed' && testError && !this.steps.some(s => s.type === 'error')) {
      await this.error('Test failed', testError);
    }

    const endTime = new Date().toISOString();
    const data: TestDocData = {
      testName: this.testName,
      userStory: this._userStory,
      status,
      error: status === 'failed' ? testError : undefined,
      steps: this.steps,
      startTime: this.startTime,
      endTime,
      duration: new Date(endTime).getTime() - new Date(this.startTime).getTime(),
    };

    const metadataDir = path.join(process.cwd(), 'test-data');
    fs.mkdirSync(metadataDir, { recursive: true });
    fs.writeFileSync(
      path.join(metadataDir, `${this.testName}.json`),
      JSON.stringify(data, null, 2)
    );
  }

  private async hideFloatingOverlays(): Promise<void> {
    await this.page.evaluate(() => {
      for (const el of document.querySelectorAll('body *')) {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed') {
          const htmlEl = el as HTMLElement;
          htmlEl.dataset.docCaptureDisplay = htmlEl.style.display;
          htmlEl.style.setProperty('display', 'none', 'important');
        }
      }
    }).catch(() => {});
  }

  private async restoreFloatingOverlays(): Promise<void> {
    await this.page.evaluate(() => {
      document.querySelectorAll('[data-doc-capture-display]').forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = htmlEl.dataset.docCaptureDisplay || '';
        delete htmlEl.dataset.docCaptureDisplay;
      });
    }).catch(() => {});
  }

  private sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50);
  }
}
