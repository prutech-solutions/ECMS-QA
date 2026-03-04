import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestEntry {
  title: string;
  describeTitle: string;
  module: string;
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  duration: number;
  error?: string;
}

interface Stats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

type SimpleStatus = 'passed' | 'failed' | 'skipped';

interface RunRecord {
  id: string;
  timestamp: string;
  tests: Record<string, SimpleStatus>;
}

interface RunHistory {
  runs: RunRecord[];
}

type ChangeBadge = 'regression' | 'fixed' | 'new' | null;

function extractModule(describeTitle: string): string {
  const dashIndex = describeTitle.indexOf(' - ');
  return dashIndex > 0 ? describeTitle.substring(0, dashIndex).trim() : describeTitle.trim();
}

function sanitize(msg: string): string {
  return msg
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\x1b\[[0-9;]*m/g, '');
}

function pct(n: number, d: number): string {
  return d ? ((n / d) * 100).toFixed(1) : '0.0';
}

function statsFrom(tests: TestEntry[]): Stats {
  const s: Stats = { total: 0, passed: 0, failed: 0, skipped: 0 };
  for (const t of tests) {
    s.total++;
    if (t.status === 'passed') s.passed++;
    else if (t.status === 'skipped') s.skipped++;
    else s.failed++;
  }
  return s;
}

function simplifyStatus(status: TestEntry['status']): SimpleStatus {
  if (status === 'passed') return 'passed';
  if (status === 'skipped') return 'skipped';
  return 'failed';
}

function testKey(t: TestEntry): string {
  return `${t.describeTitle} > ${t.title}`;
}

function getChangeBadge(
  currentStatus: SimpleStatus,
  previousRun: RunRecord | undefined,
  key: string,
): ChangeBadge {
  if (!previousRun) return null;
  const prev = previousRun.tests[key];
  if (prev === undefined) return 'new';
  if (prev === 'passed' && currentStatus === 'failed') return 'regression';
  if (prev !== 'passed' && currentStatus === 'passed') return 'fixed';
  return null;
}

function badgeHtml(badge: ChangeBadge): string {
  if (!badge) return '';
  const cls = `badge-${badge}`;
  const label = badge.toUpperCase();
  return ` <span class="badge ${cls}">${label}</span>`;
}

function sparklineHtml(runs: RunRecord[], key: string): string {
  if (runs.length === 0) return '';
  const dots = runs.map(run => {
    const status = run.tests[key];
    if (status === undefined) return '<span class="dot dot-absent" title="not present"></span>';
    if (status === 'passed') return '<span class="dot dot-pass" title="passed"></span>';
    if (status === 'skipped') return '<span class="dot dot-skip" title="skipped"></span>';
    return '<span class="dot dot-fail" title="failed"></span>';
  });
  return `<span class="sparkline">${dots.join('')}</span>`;
}

function describeSparklineHtml(runs: RunRecord[], tests: TestEntry[]): string {
  if (runs.length === 0) return '';
  const keys = tests.map(t => testKey(t));
  const dots = runs.map(run => {
    let passed = 0;
    let total = 0;
    for (const k of keys) {
      const s = run.tests[k];
      if (s !== undefined) {
        total++;
        if (s === 'passed') passed++;
      }
    }
    if (total === 0) return '<span class="dot dot-absent" title="not present"></span>';
    const rate = passed / total;
    if (rate === 1) return `<span class="dot dot-pass" title="${passed}/${total}"></span>`;
    if (rate === 0) return `<span class="dot dot-fail" title="${passed}/${total}"></span>`;
    return `<span class="dot dot-mixed" title="${passed}/${total}"></span>`;
  });
  return `<span class="sparkline">${dots.join('')}</span>`;
}

const HISTORY_PATH = path.resolve('test-data', 'run-history.json');
const MAX_RUNS = 5;

class EcmsDashboardReporter implements Reporter {
  private tests: TestEntry[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    const titlePath = test.titlePath();
    // titlePath: ['', filePath, ...describeBlocks, testTitle]
    // We want only the describe block names, not the file path
    // titlePath[0] = project name, titlePath[1] = file, last = test title
    // Describe blocks are at indices 2..(length-2)
    // titlePath: [projectName, projectDir, filePath, ...describeBlocks, testTitle]
    // Find the first describe block by skipping entries that look like file paths
    let descStart = 2;
    while (descStart < titlePath.length - 1 && titlePath[descStart].includes('/')) {
      descStart++;
    }
    const describeBlocks = titlePath.slice(descStart, -1);
    const describeTitle = describeBlocks.length > 0
      ? describeBlocks.join(' > ')
      : 'Unknown';

    const module = extractModule(describeTitle);

    let errorMsg: string | undefined;
    if (result.errors?.length) {
      errorMsg = result.errors.map(e => e.message || e.stack || '').join('\n');
    }

    this.tests.push({
      title: test.title,
      describeTitle,
      module,
      status: result.status,
      duration: result.duration,
      error: errorMsg,
    });
  }

  onEnd(result: FullResult): void {
    // Build hierarchy: module → describe blocks → tests
    const moduleMap = new Map<string, Map<string, TestEntry[]>>();
    for (const t of this.tests) {
      if (!moduleMap.has(t.module)) moduleMap.set(t.module, new Map());
      const descMap = moduleMap.get(t.module)!;
      if (!descMap.has(t.describeTitle)) descMap.set(t.describeTitle, []);
      descMap.get(t.describeTitle)!.push(t);
    }

    const sortedModules = [...moduleMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    // Overall totals
    const totals = statsFrom(this.tests);

    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });

    // --- Run history I/O ---
    let history: RunHistory = { runs: [] };
    try {
      if (fs.existsSync(HISTORY_PATH)) {
        history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
      }
    } catch {
      history = { runs: [] };
    }

    const previousRun = history.runs.length > 0 ? history.runs[history.runs.length - 1] : undefined;

    // Build current run record
    const currentTests: Record<string, SimpleStatus> = {};
    for (const t of this.tests) {
      currentTests[testKey(t)] = simplifyStatus(t.status);
    }
    const currentRun: RunRecord = {
      id: now.toISOString(),
      timestamp,
      tests: currentTests,
    };

    // Compute regression/fixed counts
    let regressionCount = 0;
    let fixedCount = 0;
    if (previousRun) {
      for (const [key, status] of Object.entries(currentTests)) {
        const badge = getChangeBadge(status, previousRun, key);
        if (badge === 'regression') regressionCount++;
        else if (badge === 'fixed') fixedCount++;
      }
    }

    // Append current run and trim to MAX_RUNS
    history.runs.push(currentRun);
    if (history.runs.length > MAX_RUNS) {
      history.runs = history.runs.slice(history.runs.length - MAX_RUNS);
    }

    // Write history
    fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');

    const html = this.buildHtml(sortedModules, totals, timestamp, result.status, history.runs, previousRun, regressionCount, fixedCount);
    const outDir = path.resolve('playwright-report');
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, 'ecms-dashboard.html');
    fs.writeFileSync(outFile, html, 'utf-8');
    console.log(`\n  ECMS Dashboard: ${outFile}\n`);
  }

  private buildSummaryTab(
    sortedModules: [string, Map<string, TestEntry[]>][],
    totals: Stats,
    runs: RunRecord[],
    previousRun: RunRecord | undefined,
  ): string {
    const hasHistory = runs.length > 1;
    const trendHeader = hasHistory ? '<th>Trend</th><th>Changes</th>' : '';

    const moduleBlocks = sortedModules.map(([moduleName, descMap]) => {
      const allTests = [...descMap.values()].flat();
      const ms = statsFrom(allTests);
      const sortedDescs = [...descMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

      const descRows = sortedDescs.map(([desc, tests]) => {
        const ds = statsFrom(tests);
        const label = desc.includes(' - ') ? desc.substring(desc.indexOf(' - ') + 3) : desc;

        let trendCells = '';
        if (hasHistory) {
          const sparkline = describeSparklineHtml(runs, tests);
          let regs = 0;
          let fixes = 0;
          if (previousRun) {
            for (const t of tests) {
              const badge = getChangeBadge(simplifyStatus(t.status), previousRun, testKey(t));
              if (badge === 'regression') regs++;
              else if (badge === 'fixed') fixes++;
            }
          }
          const changeParts: string[] = [];
          if (regs) changeParts.push(`<span class="badge badge-regression">${regs} reg</span>`);
          if (fixes) changeParts.push(`<span class="badge badge-fixed">${fixes} fix</span>`);
          trendCells = `<td>${sparkline}</td><td>${changeParts.join(' ') || '—'}</td>`;
        }

        return `<tr>
          <td class="desc-label">${sanitize(label)}</td>
          <td>${ds.total}</td>
          <td>${ds.passed ? `<span class="badge badge-pass">${ds.passed}</span>` : '0'}</td>
          <td>${ds.failed ? `<span class="badge badge-fail">${ds.failed}</span>` : '0'}</td>
          <td>${ds.skipped ? `<span class="badge badge-skip">${ds.skipped}</span>` : '0'}</td>
          <td>${pct(ds.passed, ds.total)}%</td>
          <td>${pct(ds.failed, ds.total)}%</td>
          ${trendCells}
        </tr>`;
      }).join('\n');

      return `<details class="module-block">
        <summary>
          <span class="title">${sanitize(moduleName)}</span>
          <span class="module-stats">
            <span class="badge badge-total">${ms.total}</span>
            ${ms.passed ? `<span class="badge badge-pass">${ms.passed}</span>` : ''}
            ${ms.failed ? `<span class="badge badge-fail">${ms.failed}</span>` : ''}
            ${ms.skipped ? `<span class="badge badge-skip">${ms.skipped}</span>` : ''}
            <span class="pct">${pct(ms.passed, ms.total)}%</span>
          </span>
        </summary>
        <div class="module-body">
          <table>
            <thead><tr>
              <th>Test Script</th><th>#</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Pass %</th><th>Fail %</th>${trendHeader}
            </tr></thead>
            <tbody>${descRows}</tbody>
          </table>
        </div>
      </details>`;
    }).join('\n');

    const totalsBar = `<div class="totals-bar">
      <span><strong>TOTAL</strong></span>
      <span class="badge badge-total">${totals.total}</span>
      ${totals.passed ? `<span class="badge badge-pass">${totals.passed} passed</span>` : ''}
      ${totals.failed ? `<span class="badge badge-fail">${totals.failed} failed</span>` : ''}
      ${totals.skipped ? `<span class="badge badge-skip">${totals.skipped} skipped</span>` : ''}
      <span class="pct">${pct(totals.passed, totals.total)}% pass rate</span>
    </div>`;

    return moduleBlocks + totalsBar;
  }

  private buildDetailsTab(
    sortedModules: [string, Map<string, TestEntry[]>][],
    runs: RunRecord[],
    previousRun: RunRecord | undefined,
  ): string {
    const hasHistory = runs.length > 1;
    const trendHeader = hasHistory ? '<th>Trend</th>' : '';
    const colSpan = hasHistory ? '4' : '3';

    return sortedModules.map(([moduleName, descMap]) => {
      const sortedDescs = [...descMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

      const descBlocks = sortedDescs.map(([desc, tests]) => {
        const ds = statsFrom(tests);
        const testRows = tests.map(t => {
          const statusClass = t.status === 'passed' ? 'badge-pass'
            : t.status === 'skipped' ? 'badge-skip' : 'badge-fail';
          const statusLabel = t.status === 'timedOut' ? 'timed out' : t.status;
          const dur = (t.duration / 1000).toFixed(1);
          const key = testKey(t);
          const badge = getChangeBadge(simplifyStatus(t.status), previousRun, key);
          const trendCell = hasHistory ? `<td>${sparklineHtml(runs, key)}</td>` : '';
          const errorBlock = t.error
            ? `<tr><td colspan="${colSpan}"><div class="callout callout-error"><strong>Error</strong><div class="error-detail">${sanitize(t.error)}</div></div></td></tr>`
            : '';
          return `<tr>
            <td>${sanitize(t.title)}${badgeHtml(badge)}</td>
            <td><span class="badge ${statusClass}">${statusLabel}</span></td>
            <td>${dur}s</td>
            ${trendCell}
          </tr>${errorBlock}`;
        }).join('\n');

        const meta = [
          `${tests.length} tests`,
          ds.passed ? `${ds.passed} passed` : '',
          ds.failed ? `${ds.failed} failed` : '',
          ds.skipped ? `${ds.skipped} skipped` : '',
        ].filter(Boolean).join(', ');

        return `<details class="story">
          <summary>
            <span class="title">${sanitize(desc)}</span>
            <span class="meta">${meta}</span>
          </summary>
          <div class="story-body">
            <table>
              <thead><tr><th>Test</th><th>Status</th><th>Duration</th>${trendHeader}</tr></thead>
              <tbody>${testRows}</tbody>
            </table>
          </div>
        </details>`;
      }).join('\n');

      return `<h3 class="module-heading">${sanitize(moduleName)}</h3>\n${descBlocks}`;
    }).join('\n');
  }

  private buildHtml(
    sortedModules: [string, Map<string, TestEntry[]>][],
    totals: Stats,
    timestamp: string,
    overallStatus: string,
    runs: RunRecord[],
    previousRun: RunRecord | undefined,
    regressionCount: number,
    fixedCount: number,
  ): string {
    const summaryContent = this.buildSummaryTab(sortedModules, totals, runs, previousRun);
    const detailsContent = this.buildDetailsTab(sortedModules, runs, previousRun);
    const passRate = pct(totals.passed, totals.total);
    const hasHistory = runs.length > 1;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ECMS QA Dashboard</title>
<style>
  :root { --accent: #0176d3; --bg: #f4f6f9; --card: #fff; --text: #181818;
          --border: #d8dde6; --green: #2e844a; --red: #ba0517; --amber: #a96404; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         background: var(--bg); color: var(--text); line-height: 1.6; }
  .container { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
  h1 { font-size: 1.75rem; color: var(--accent); border-bottom: 3px solid var(--accent);
       padding-bottom: 0.5rem; margin-bottom: 0.25rem; }
  .subtitle { color: #666; font-size: 0.95rem; margin-bottom: 2rem; }
  table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; background: var(--card);
          border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  th, td { padding: 0.6rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: #f8f9fb; font-weight: 600; font-size: 0.85rem; text-transform: uppercase;
       letter-spacing: 0.03em; color: #555; }
  td.desc-label { padding-left: 1.5rem; }
  .badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 4px;
           font-size: 0.8rem; font-weight: 600; }
  .badge-pass { background: #e3f5e9; color: var(--green); }
  .badge-fail { background: #fce4e4; color: var(--red); }
  .badge-skip { background: #f0f0f0; color: #666; }
  .badge-total { background: #e8f0fe; color: var(--accent); }
  .pct { font-size: 0.85rem; color: #555; font-weight: 600; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                   gap: 1rem; margin: 1rem 0 2rem; }
  .summary-box { background: var(--card); border-radius: 8px; padding: 1rem; text-align: center;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .summary-box .num { font-size: 2rem; font-weight: 700; }
  .summary-box .label { font-size: 0.8rem; color: #666; text-transform: uppercase; }
  .summary-box.total .num { color: var(--accent); }
  .summary-box.pass .num { color: var(--green); }
  .summary-box.fail .num { color: var(--red); }
  .summary-box.skip .num { color: var(--amber); }
  .summary-box.regression .num { color: var(--red); }
  .summary-box.fixed .num { color: var(--green); }

  /* Change badges */
  .badge-regression { background: var(--red); color: #fff; }
  .badge-fixed { background: var(--green); color: #fff; }
  .badge-new { background: var(--accent); color: #fff; }

  /* Sparkline */
  .sparkline { display: inline-flex; gap: 3px; align-items: center; vertical-align: middle; }
  .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
  .dot-pass { background: var(--green); }
  .dot-fail { background: var(--red); }
  .dot-skip { background: #aaa; }
  .dot-mixed { background: var(--amber); }
  .dot-absent { border: 1.5px solid #ccc; background: transparent; }

  /* Module collapsible blocks (Summary tab) */
  details.module-block { background: var(--card); border-radius: 8px; margin: 0.75rem 0;
                          box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden; }
  details.module-block summary { padding: 1rem 1.25rem; cursor: pointer; font-weight: 700;
                                  font-size: 1.1rem; display: flex; align-items: center;
                                  gap: 0.75rem; user-select: none; list-style: none; }
  details.module-block summary::-webkit-details-marker { display: none; }
  details.module-block summary::before { content: '\\25B6'; font-size: 0.7rem;
                                          transition: transform 0.2s; color: #999; flex-shrink: 0; }
  details.module-block[open] summary::before { transform: rotate(90deg); }
  details.module-block summary .title { flex: 1; }
  details.module-block summary .module-stats { display: flex; gap: 0.5rem; align-items: center; }
  details.module-block .module-body { padding: 0 1.25rem 1.25rem; }

  /* Totals bar */
  .totals-bar { background: var(--card); border-radius: 8px; margin: 0.75rem 0;
                 box-shadow: 0 1px 3px rgba(0,0,0,0.08); padding: 1rem 1.25rem;
                 display: flex; gap: 0.75rem; align-items: center; font-size: 1rem; }

  /* Test Details collapsibles */
  details.story { background: var(--card); border-radius: 8px; margin: 0.5rem 0;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden; }
  details.story summary { padding: 0.85rem 1.25rem; cursor: pointer; font-weight: 600;
                           font-size: 1rem; display: flex; align-items: center;
                           gap: 0.75rem; user-select: none; list-style: none; }
  details.story summary::-webkit-details-marker { display: none; }
  details.story summary::before { content: '\\25B6'; font-size: 0.65rem; transition: transform 0.2s;
                                   color: #999; flex-shrink: 0; }
  details.story[open] summary::before { transform: rotate(90deg); }
  details.story summary .title { flex: 1; }
  details.story summary .meta { font-size: 0.8rem; font-weight: 400; color: #888; }
  details.story .story-body { padding: 0 1.25rem 1.25rem; }

  .module-heading { font-size: 1.2rem; margin: 1.75rem 0 0.5rem; color: var(--accent);
                     border-bottom: 2px solid var(--border); padding-bottom: 0.35rem; }

  .callout { border-left: 4px solid; border-radius: 4px; padding: 0.75rem 1rem;
             margin: 0.5rem 0; font-size: 0.9rem; }
  .callout-error { border-color: var(--red); background: #fce4e4; }
  .callout-error .error-detail { margin-top: 0.5rem; font-family: monospace;
                                  font-size: 0.8rem; white-space: pre-wrap;
                                  max-height: 200px; overflow-y: auto; color: #666; }
  .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border);
            color: #999; font-size: 0.8rem; text-align: center; }

  /* Tabs */
  .tabs { display: flex; gap: 0; margin-bottom: 0; border-bottom: 2px solid var(--border); }
  .tab { padding: 0.75rem 1.5rem; cursor: pointer; font-weight: 600; font-size: 0.95rem;
         color: #666; border-bottom: 3px solid transparent; margin-bottom: -2px;
         transition: color 0.2s, border-color 0.2s; background: none; border-top: none;
         border-left: none; border-right: none; }
  .tab:hover { color: var(--accent); }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab-content { display: none; padding-top: 0.5rem; }
  .tab-content.active { display: block; }
</style>
</head>
<body>
<div class="container">
  <h1>ECMS QA Dashboard</h1>
  <p class="subtitle">Generated ${timestamp} &mdash; Overall: <strong>${overallStatus}</strong></p>

  <div class="summary-grid">
    <div class="summary-box total"><div class="num">${totals.total}</div><div class="label">Total</div></div>
    <div class="summary-box pass"><div class="num">${totals.passed}</div><div class="label">Passed</div></div>
    <div class="summary-box fail"><div class="num">${totals.failed}</div><div class="label">Failed</div></div>
    <div class="summary-box skip"><div class="num">${totals.skipped}</div><div class="label">Skipped</div></div>
    <div class="summary-box"><div class="num">${passRate}%</div><div class="label">Pass Rate</div></div>
    ${hasHistory && regressionCount > 0 ? `<div class="summary-box regression"><div class="num">${regressionCount}</div><div class="label">Regressions</div></div>` : ''}
    ${hasHistory && fixedCount > 0 ? `<div class="summary-box fixed"><div class="num">${fixedCount}</div><div class="label">Fixed</div></div>` : ''}
  </div>

  <div class="tabs">
    <button class="tab active" onclick="switchTab('summary')">QA Summary</button>
    <button class="tab" onclick="switchTab('details')">Test Details</button>
  </div>

  <div id="tab-summary" class="tab-content active">
    ${summaryContent}
  </div>

  <div id="tab-details" class="tab-content">
    ${detailsContent}
  </div>

  <div class="footer">ECMS QA Dashboard &bull; Playwright Test Report</div>
</div>

<script>
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
  document.querySelector('[onclick*="' + name + '"]').classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}
</script>
</body>
</html>`;
  }
}

export default EcmsDashboardReporter;
