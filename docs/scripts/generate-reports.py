#!/usr/bin/env python3
"""
Generate reports from Playwright test results and doc capture metadata.

Reads:
  - test-data/test-results.json  (Playwright JSON reporter output)
  - test-data/*.json             (doc capture step metadata)
  - screenshots/                 (step-by-step screenshots)

Outputs:
  - docs/output/test-results.html
  - docs/output/training-guide.html
"""

import base64
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEST_DATA_DIR = PROJECT_ROOT / "test-data"
SCREENSHOTS_DIR = PROJECT_ROOT / "screenshots"
OUTPUT_DIR = PROJECT_ROOT / "docs" / "output"


def load_test_results():
    results_file = TEST_DATA_DIR / "test-results.json"
    if not results_file.exists():
        return None
    with open(results_file) as f:
        return json.load(f)


def load_doc_captures():
    captures = []
    for json_file in sorted(TEST_DATA_DIR.glob("*.json")):
        if json_file.name == "test-results.json":
            continue
        with open(json_file) as f:
            captures.append(json.load(f))
    return captures


def img_to_base64(path):
    if not path.exists():
        return ""
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/png;base64,{data}"


def esc(text):
    return (text or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def sanitize_error(raw: str) -> str:
    """Translate Playwright errors into plain-English for business users."""
    if not raw:
        return ""

    text = re.sub(r"\x1b\[[0-9;]*m", "", raw)
    text = re.sub(r"\[[\d;]*m", "", text)

    m = re.search(r'toBeVisible\(\) failed', text)
    if m:
        field = re.search(r'text\("([^"]+)"\)', text)
        field_name = field.group(1) if field else "a required element"
        timeout = re.search(r'Timeout:\s*(\d+)ms', text)
        secs = int(timeout.group(1)) // 1000 if timeout else 10
        return (
            f'The field "{field_name}" was not found on the page.\n'
            f"The page may not have loaded completely within {secs} seconds, "
            f"or the page layout may not include this field for the current user profile."
        )

    m = re.search(r"getByLabel\('([^']+)'\) resolved to (\d+) elements", text)
    if m:
        return (
            f'The test was unable to interact with the "{m.group(1)}" field.\n'
            f"This usually means a required field on the form was not filled in "
            f"or the form was not ready for input."
        )

    m = re.search(r"Expected:\s*>\s*(\d+)", text)
    n = re.search(r"Received:\s*(\d+)", text)
    if m and n:
        expected_min = int(m.group(1))
        actual = int(n.group(1))
        if expected_min == 0 and actual == 0:
            return (
                "Expected to find at least one record, but none were found.\n"
                "The related list may be empty, or the records may not be linked."
            )
        return f"Expected more than {expected_min} records, but found {actual}."

    m = re.search(r'Expected substring:\s*"(.+?)"', text)
    n = re.search(r'Received string:\s*"(.+?)"', text)
    if m and n:
        return f'Expected "{m.group(1)}", but got "{n.group(1)}".'

    m = re.search(r"Expected:\s*(.+)", text)
    n = re.search(r"Received:\s*(.+)", text)
    if m and n:
        return f'Expected "{m.group(1).strip().strip(chr(34))}" but got "{n.group(1).strip().strip(chr(34))}".'

    m = re.search(r"Timeout\s*(\d+)ms exceeded", text)
    if m:
        secs = int(m.group(1)) // 1000
        return f"The page did not finish loading within {secs} seconds."

    if "Target page, context or browser has been closed" in text:
        return "The browser was closed before the action completed (test infrastructure issue)."

    lines = [l.strip() for l in text.strip().splitlines() if l.strip()]
    return lines[0] if lines else text.strip()


# --- CSS shared by both reports (Salesforce-themed) ---
CSS = """<style>
  :root { --accent: #0176d3; --bg: #f4f6f9; --card: #fff; --text: #181818;
          --border: #d8dde6; --green: #2e844a; --red: #ba0517; --amber: #a96404; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         background: var(--bg); color: var(--text); line-height: 1.6; }
  .container { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem; }
  h1 { font-size: 1.75rem; color: var(--accent); border-bottom: 3px solid var(--accent);
       padding-bottom: 0.5rem; margin-bottom: 0.25rem; }
  .subtitle { color: #666; font-size: 0.95rem; margin-bottom: 2rem; }
  h2 { font-size: 1.35rem; margin-top: 2rem; margin-bottom: 1rem; color: #333; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; background: var(--card);
          border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  th, td { padding: 0.6rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: #f8f9fb; font-weight: 600; font-size: 0.85rem; text-transform: uppercase;
       letter-spacing: 0.03em; color: #555; }
  .badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 4px;
           font-size: 0.8rem; font-weight: 600; }
  .badge-pass { background: #e3f5e9; color: var(--green); }
  .badge-fail { background: #fce4e4; color: var(--red); }
  .badge-skip { background: #f0f0f0; color: #666; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                   gap: 1rem; margin: 1rem 0; }
  .summary-box { background: var(--card); border-radius: 8px; padding: 1rem; text-align: center;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .summary-box .num { font-size: 2rem; font-weight: 700; }
  .summary-box .label { font-size: 0.8rem; color: #666; text-transform: uppercase; }
  details.story { background: var(--card); border-radius: 8px; margin: 1rem 0;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden; }
  details.story summary { padding: 1rem 1.25rem; cursor: pointer; font-weight: 600;
                           font-size: 1.05rem; display: flex; align-items: center;
                           gap: 0.75rem; user-select: none; list-style: none; }
  details.story summary::-webkit-details-marker { display: none; }
  details.story summary::before { content: '\\25B6'; font-size: 0.7rem; transition: transform 0.2s;
                                   color: #999; flex-shrink: 0; }
  details.story[open] summary::before { transform: rotate(90deg); }
  details.story summary .title { flex: 1; }
  details.story summary .meta { font-size: 0.8rem; font-weight: 400; color: #888; }
  details.story .story-body { padding: 0 1.25rem 1.25rem; }
  .step { display: flex; gap: 1rem; padding: 1rem 0; border-top: 1px solid var(--border); }
  .step:first-child { border-top: none; }
  .step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent);
              color: #fff; text-align: center; line-height: 28px; font-weight: 700;
              font-size: 0.85rem; flex-shrink: 0; }
  .step-content { flex: 1; min-width: 0; }
  .step-desc { font-weight: 500; margin-bottom: 0.5rem; }
  .screenshot { max-width: 100%; border: 1px solid var(--border); border-radius: 6px; }
  .callout { border-left: 4px solid; border-radius: 4px; padding: 0.75rem 1rem;
             margin: 0.5rem 0; font-size: 0.9rem; }
  .callout-note { border-color: var(--accent); background: #eaf4fd; }
  .callout-error { border-color: var(--red); background: #fce4e4; }
  .callout-error .error-detail { margin-top: 0.5rem; font-family: monospace;
                                  font-size: 0.8rem; white-space: pre-wrap;
                                  max-height: 200px; overflow-y: auto; color: #666; }
  .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border);
            color: #999; font-size: 0.8rem; text-align: center; }
</style>"""


def html_page(title, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
{CSS}
</head>
<body>
<div class="container">
{body}
<div class="footer">Generated by Salesforce QA Testing Framework</div>
</div>
</body>
</html>"""


def extract_module(user_story: str) -> str:
    """Extract module name from user story prefix (e.g., 'Budget - Create...' -> 'Budget')."""
    if not user_story:
        return "Uncategorized"
    parts = user_story.split(" - ", 1)
    return parts[0].strip() if len(parts) > 1 else "Uncategorized"


def collect_suites(results):
    """Flatten Playwright JSON results into a list of (suite_name, test_name, status, error)."""
    tests = []
    for suite in results.get("suites", []):
        suite_title = suite.get("title", "Unknown Suite")
        for spec in suite.get("specs", []):
            spec_title = spec.get("title", "Unknown Test")
            for test in spec.get("tests", []):
                status = test.get("status", "unknown")
                error_msg = ""
                for result in test.get("results", []):
                    if result.get("error"):
                        error_msg = result["error"].get("message", "")
                        break
                tests.append((suite_title, spec_title, status, error_msg))
        # Recurse into nested suites
        for nested in suite.get("suites", []):
            nested_title = nested.get("title", suite_title)
            for spec in nested.get("specs", []):
                spec_title = spec.get("title", "Unknown Test")
                for test in spec.get("tests", []):
                    status = test.get("status", "unknown")
                    error_msg = ""
                    for result in test.get("results", []):
                        if result.get("error"):
                            error_msg = result["error"].get("message", "")
                            break
                    tests.append((nested_title, spec_title, status, error_msg))
    return tests


def generate_test_results_html(results):
    """Generate pass/fail table grouped by suite with error messages sanitized for business users."""
    tests = collect_suites(results)
    if not tests:
        return None

    total = len(tests)
    passed = sum(1 for _, _, s, _ in tests if s == "expected")
    failed = sum(1 for _, _, s, _ in tests if s == "unexpected")
    skipped = sum(1 for _, _, s, _ in tests if s == "skipped")

    # Group by module
    module_stats = defaultdict(lambda: {"total": 0, "passed": 0, "failed": 0, "skipped": 0})
    for suite, _, status, _ in tests:
        module = extract_module(suite)
        module_stats[module]["total"] += 1
        if status == "expected":
            module_stats[module]["passed"] += 1
        elif status == "unexpected":
            module_stats[module]["failed"] += 1
        elif status == "skipped":
            module_stats[module]["skipped"] += 1

    body = f"""<h1>Test Results</h1>
<div class="subtitle">Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}</div>

<div class="summary-grid">
  <div class="summary-box"><div class="num">{total}</div><div class="label">Total</div></div>
  <div class="summary-box"><div class="num" style="color:var(--green)">{passed}</div><div class="label">Passed</div></div>
  <div class="summary-box"><div class="num" style="color:var(--red)">{failed}</div><div class="label">Failed</div></div>
  <div class="summary-box"><div class="num" style="color:#666">{skipped}</div><div class="label">Skipped</div></div>
</div>

<h2>Module Summary</h2>
<table>
<tr><th>Module</th><th># Tests</th><th>Passed</th><th>Failed</th><th>Skipped</th><th>Pass Rate</th></tr>
"""
    for module in sorted(module_stats.keys()):
        s = module_stats[module]
        rate = f"{s['passed'] / s['total'] * 100:.1f}%" if s["total"] > 0 else "N/A"
        body += f"<tr><td>{esc(module)}</td><td>{s['total']}</td><td>{s['passed']}</td>"
        body += f"<td>{s['failed']}</td><td>{s['skipped']}</td><td>{rate}</td></tr>\n"
    body += "</table>\n"

    # Group tests by suite
    suites = defaultdict(list)
    for suite, test_name, status, error in tests:
        suites[suite].append((test_name, status, error))

    body += "<h2>Test Details</h2>\n"
    for suite_name in sorted(suites.keys()):
        body += f"""<details class="story">
<summary><span class="title">{esc(suite_name)}</span>
<span class="meta">{len(suites[suite_name])} tests</span></summary>
<div class="story-body">
<table>
<tr><th>Test</th><th>Status</th><th>Details</th></tr>
"""
        for test_name, status, error in suites[suite_name]:
            if status == "expected":
                badge = '<span class="badge badge-pass">PASS</span>'
            elif status == "unexpected":
                badge = '<span class="badge badge-fail">FAIL</span>'
            else:
                badge = '<span class="badge badge-skip">SKIP</span>'
            error_html = f"<br><small>{esc(sanitize_error(error))}</small>" if error else ""
            body += f"<tr><td>{esc(test_name)}</td><td>{badge}</td><td>{error_html}</td></tr>\n"
        body += "</table></div></details>\n"

    return html_page("Test Results", body)


def generate_training_guide_html(captures):
    """Generate step-by-step training guide with screenshots, grouped by module and user story."""
    if not captures:
        return None

    # Group by module, then by user story
    modules = defaultdict(lambda: defaultdict(list))
    for cap in captures:
        user_story = cap.get("userStory", cap.get("testName", "Unknown"))
        module = extract_module(user_story)
        modules[module][user_story].append(cap)

    total_tests = len(captures)
    total_steps = sum(len(c.get("steps", [])) for c in captures)

    body = f"""<h1>Training Guide</h1>
<div class="subtitle">Step-by-step procedures with screenshots — Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}</div>

<div class="summary-grid">
  <div class="summary-box"><div class="num">{len(modules)}</div><div class="label">Modules</div></div>
  <div class="summary-box"><div class="num">{total_tests}</div><div class="label">Procedures</div></div>
  <div class="summary-box"><div class="num">{total_steps}</div><div class="label">Steps</div></div>
</div>
"""

    for module_name in sorted(modules.keys()):
        stories = modules[module_name]
        module_test_count = sum(len(caps) for caps in stories.values())
        body += f"""<details class="story">
<summary><span class="title">{esc(module_name)}</span>
<span class="meta">{module_test_count} procedures</span></summary>
<div class="story-body">
"""
        for story_name in sorted(stories.keys()):
            caps = stories[story_name]
            for cap in caps:
                test_name = cap.get("testName", "Unknown")
                steps = cap.get("steps", [])
                status = cap.get("status", "unknown")

                if status == "passed":
                    badge = '<span class="badge badge-pass">PASS</span>'
                elif status == "failed":
                    badge = '<span class="badge badge-fail">FAIL</span>'
                else:
                    badge = '<span class="badge badge-skip">N/A</span>'

                duration = cap.get("duration")
                duration_str = f"{duration / 1000:.1f}s" if duration else ""

                body += f"""<details class="story">
<summary><span class="title">{esc(test_name)}</span>
{badge} <span class="meta">{len(steps)} steps {duration_str}</span></summary>
<div class="story-body">
"""
                for step in steps:
                    step_num = step.get("step", 0)
                    desc = step.get("description", "")
                    step_type = step.get("type", "step")
                    screenshot = step.get("screenshot", "")

                    if step_type == "note":
                        body += f"""<div class="callout callout-note">{esc(desc)}</div>\n"""
                        continue

                    if step_type == "error":
                        detail = step.get("detail", "")
                        body += f"""<div class="callout callout-error">{esc(desc)}"""
                        if detail:
                            body += f"""<div class="error-detail">{esc(detail)}</div>"""
                        body += "</div>\n"

                    body += f"""<div class="step">
<div class="step-num">{step_num}</div>
<div class="step-content">
<div class="step-desc">{esc(desc)}</div>
"""
                    if screenshot:
                        img_path = SCREENSHOTS_DIR / test_name / screenshot
                        b64 = img_to_base64(img_path)
                        if b64:
                            body += f'<img class="screenshot" src="{b64}" alt="{esc(desc)}">\n'
                    body += "</div></div>\n"

                body += "</div></details>\n"
        body += "</div></details>\n"

    return html_page("Training Guide", body)


def main():
    fmt = "html"
    if "--format" in sys.argv:
        idx = sys.argv.index("--format")
        if idx + 1 < len(sys.argv):
            fmt = sys.argv[idx + 1]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print("Generating QA reports...")

    results = load_test_results()
    if results:
        html = generate_test_results_html(results)
        if html:
            (OUTPUT_DIR / "test-results.html").write_text(html)
            print(f"  -> docs/output/test-results.html")

    captures = load_doc_captures()
    if captures:
        html = generate_training_guide_html(captures)
        if html:
            (OUTPUT_DIR / "training-guide.html").write_text(html)
            print(f"  -> docs/output/training-guide.html")

    print("Done!")


if __name__ == "__main__":
    main()
