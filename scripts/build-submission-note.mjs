import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

// All inputs are public, synthetic-project evidence. No account/provider config is used.
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const finalPerformance = await readJson('evidence/round2/performance-fixed/results.json');
const oldPerformance = await readJson('evidence/round2/performance-before/results.json');
const browser = await readJson('evidence/round2/e2e-results.json');
const delivery = existsSync('docs/delivery.json') ? await readJson('docs/delivery.json') : {};
const soakIndexPath = process.argv[2] ?? 'evidence/round2/soak/final-native-gc/latest.json';
const soakIndex = await readJson(soakIndexPath);
const soak = await readJson(resolve(dirname(soakIndexPath), soakIndex.runId, 'results.json'));
if (
  browser.stats.unexpected ||
  browser.stats.skipped ||
  browser.stats.expected !== delivery.browserExecutions
) {
  throw new Error('Submission note requires a complete passing browser run.');
}
if (
  soak.status !== 'completed' ||
  soak.pageErrors.length ||
  soak.consoleErrors.length ||
  soak.visitedRunIds.length !== 20
) {
  throw new Error('Submission note requires a completed error-free soak across all 20 runs.');
}
const appBundle = finalPerformance.build.assets.find((asset) => /\/app-[^/]+\.js$/.test(asset));
if (
  !appBundle ||
  !soak.servedAssets.some((asset) => asset.endsWith(appBundle.replace('./', '/')))
) {
  throw new Error(
    'Performance and sustained-use evidence must describe the same application bundle.',
  );
}
const f = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new Error('Missing finite evidence value.');
  return value.toFixed(1);
};
const mb = (value) => f(value / 1_000_000);
const fixture = finalPerformance.fixtureSummary;
const app = finalPerformance.applicationSummary;
const old = oldPerformance.applicationSummary;
const memory = Object.fromEntries(
  finalPerformance.attributedMemory.map((entry) => [entry.mode, entry]),
);
const canShip = Boolean(
  delivery.repositoryUrl &&
  delivery.deployedUrl &&
  delivery.hostedSmokePassed &&
  delivery.linuxCi?.conclusion === 'success',
);
const verdict = canShip ? 'SHIP' : "DON'T SHIP THE SUBMISSION YET";
const verdictDetail = canShip
  ? 'The generated-data monitor, accessible repository and deployed build are ready for review within the assignment scope.'
  : delivery.repositoryUrl && delivery.deployedUrl && delivery.hostedSmokePassed
    ? 'The repository and hosted application are available. Final Linux CI has not passed yet, so the submission is not released.'
    : 'The application passed local checks. An accessible external repository and hosted smoke-checked URL remain the final delivery condition.';
const deliveryLinks =
  delivery.repositoryUrl && delivery.deployedUrl
    ? `<p class="muted">Repository: <a href="${delivery.repositoryUrl}">${delivery.repositoryUrl}</a><br>App: <a href="${delivery.deployedUrl}">${delivery.deployedUrl}</a></p>`
    : '';
const stat = (key) => `${f(old[key].median)} → ${f(app[key].median)} ms`;
const rows = [
  ['First render', 'firstRenderMs', ' ms'],
  ['Zoom', 'zoomMs', ' ms'],
  ['Hover', 'hoverMs', ' ms'],
]
  .map(
    ([title, key, unit]) =>
      `<tr><td>${title}</td>${['baseline', 'sampled-main', 'optimized'].map((mode) => `<td>${f(fixture[mode][key].median)}${unit}</td>`).join('')}</tr>`,
  )
  .join('');
const memoryRow = `<tr><td>Renderer private footprint, one overview</td>${['baseline', 'sampled-main', 'optimized'].map((mode) => `<td>${mb(memory[mode].attributedRendererPrivateFootprintBytes)} MB</td>`).join('')}</tr>`;
const warm = soak.snapshots[0];
const peak = Math.max(...soak.snapshots.map((entry) => entry.combinedV8AndBackingBytes));
const last = soak.snapshots.at(-1);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SOUP — Engineering note</title><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#102A43;background:#fff;font:13px/1.43 Arial,sans-serif}.page{width:210mm;height:297mm;padding:15mm 17mm 14mm;position:relative;break-after:page}.page:last-child{break-after:auto}header{font-size:8px;letter-spacing:1.5px;text-transform:uppercase;display:flex;justify-content:space-between;color:#627D98;border-bottom:1px solid #D9E2EC;padding-bottom:9px}h1{font-size:25px;letter-spacing:-.6px;line-height:1.2;margin:17px 0 8px}h2{font-size:12px;margin:13px 0 5px}p{margin:5px 0 8px}.verdict{padding:9px 12px;border-left:3px solid ${canShip ? '#27AB83' : '#D64545'};background:#F0F4F8;margin:12px 0}table{width:100%;border-collapse:collapse;margin:8px 0;font-size:9px}th,td{text-align:left;padding:5px 7px;border-bottom:1px solid #D9E2EC}th{background:#F0F4F8}td:nth-child(n+2),th:nth-child(n+2){text-align:right}.muted{color:#486581;font-size:9px}ul{padding-left:15px;margin:5px 0}li{margin-bottom:4px}.footer{position:absolute;bottom:10mm;left:17mm;right:17mm;border-top:1px solid #D9E2EC;padding-top:7px;display:flex;justify-content:space-between;color:#627D98;font-size:8px}code{font-size:9px}a{color:#102A43}
</style></head><body>
<section class="page"><header><span>SOUP / Training Observatory</span><span>10 November 2026 · Engineering note</span></header><h1>A truthful chart needs more<br>than a passing sampler.</h1><div class="verdict"><strong>${verdict}.</strong> ${verdictDetail} This exercise explicitly uses generated data; real training control is outside its scope.</div>${deliveryLinks}
<h2>1 / What is kept, and what is discarded</h2><p>Twenty deterministic runs include NaN/Infinity, duplicates, unordered steps, missing steps, zeros, divergence and a 1M-point run. Source steps must be nonnegative safe integers; unsupported rows are rejected and counted. Numeric sorting uses the last received duplicate, including invalid latest values.</p><p>A worker retains four Float64 columns (32 MB at 1M). Exact viewport bounds precede first/last/min/max selection in each finite segment and step bucket. No averages or smoothing are used. Invalid values and absent steps break the line. A unique spike survives selection in every containing viewport by construction; isolated finite points get visible markers. Constant zero lines are padded inside the plot rather than clipped at its edge.</p><p>Hover and CSV identify sampled observations. Statistics use all unique rows in view; pending/failed ranges show unavailable statistics. Dense timing and lesser peaks within one bucket are discarded. Subpixel gaps can be visually tiny, so missingness counts remain visible. Pathologically many discontinuities exceed the ordinary output budget and remain a declared workload limit.</p>
<h2>2 / Executed evidence, including failures</h2><p><strong>71 unit tests; ${browser.stats.expected / 3} scenarios × 3 engines = ${browser.stats.expected} browser executions passed</strong>, without skipped/flaky results. Chromium, Firefox and WebKit ran against the production bundle on macOS. Independent oracles exercise 128 malformed streams, 1,152 dataset/range/metric combinations and 105 outlier/boundary cases.</p><p>Browser checks inspect actual Canvas spikes, NaN breaks, singleton/zero lines and drawn axis labels/coordinates. They control real Worker reply order through React/query/client, test stale/malformed responses, loading/error scope, drag/reset, keyboard focus, storage, UTC+14/Russian locale, 320/390/768px, DPR2 and touch emulation. Fifteen axe states have zero confirmed violations; mobile-dialog background estimates remain incomplete, with 31 nodes independently checked at contrast 5.27–13.25:1.</p><p>A long run found a serious defect after short tests passed: custom cache eviction removed a new query during observer attachment, retaining responses and growing memory to about 495 MB. The mechanism was removed in favor of TanStack's lifecycle-aware 10-second GC. A real-observer regression failed at range 12 before the fix and passed 40 transitions afterward; the UI regression completes 20 viewports with exactly 20 Worker requests per engine. Original failed tests, allocation samples and rejected-build measurements remain in <code>evidence/round2/</code>.</p><div class="footer"><span>Reproduce: npm ci · npm run check · npm run test:e2e</span><span>01 / 02</span></div></section>
<section class="page"><header><span>SOUP / Training Observatory</span><span>Performance · Silent failures · Limits</span></header><h2 style="margin-top:17px">3 / Performance in numbers</h2><p>Chrome 156, macOS arm64. Five fresh repetitions per chart mode and full app; 15 input samples per summary. Medians below. First render includes preparation; zoom/hover start at the actual in-page input event and end after matching charts and two paint opportunities, excluding automation transport.</p><table><thead><tr><th>Controlled loss chart</th><th>Raw 1M</th><th>Main sampling</th><th>Worker sampling</th></tr></thead><tbody>${rows}${memoryRow}</tbody></table><p><strong>Complete application before → final:</strong> first render ${stat('firstRenderMs')}; zoom ${stat('zoomMs')}; hover ${stat('hoverMs')}. Negative results remain in the raw observations; the faster isolated chart is not proof of a faster full interface.</p><p class="muted">CPU ×4 applies to the page. A measured calibration showed the worker remains normally scheduled; the main-sampled control separates reduction from worker placement. Private footprint uses actual frame/worker PID attribution and MemoryInfra dumps outside timed runs, excluding spare/browser/GPU processes. Full 3-chart app: ${mb(memory.application.attributedRendererPrivateFootprintBytes)} MB private renderer footprint. These are local measurements, not a device SLA or deployed-network benchmark. Traces, exact samples and limited descriptive P95s: evidence/round2/performance-fixed/.</p>
<h2>4 / Silent failures and sustained use</h2><ul><li><strong>Staleness:</strong> immutable source revision and recorded time stay separate from view preparation. Old revisions and impossible chronology fail closed; reload never claims new training observations.</li><li><strong>Races:</strong> run/revision/range/width identify queries, and a response retains its producing viewport. Late replies cannot populate a different run; prior same-run plots stay covered while updating.</li><li><strong>Numbers:</strong> UTC and explicit numeric formatting are tested under other browser locales/zones. No smoothing hides divergence; log zero exclusions never become invented positive values.</li></ul><p>The final sustained-use run completed ${soak.iterationCount} active cycles across all 20 runs, ${soak.requestedActiveSeconds}s activity plus ${soak.requestedIdleSeconds}s idle, with ${soak.pageErrors.length + soak.consoleErrors.length} browser errors. Retained page+worker V8/backing stores: ${mb(warm.combinedV8AndBackingBytes)} MB warm → ${mb(peak)} MB peak → ${mb(last.combinedV8AndBackingBytes)} MB after idle. Worker source storage stays included. This closes the observed runaway-retention failure, not the possibility of leaks over hours.</p>
<h2>5 / Surprise, concern, and AI use</h2><p>The surprising failure was a correctly retained spike that Canvas did not paint when surrounded by gaps. Later, a cache “optimization” passed short tests yet caused runaway retention. The remaining concern is dense visual compression and workloads with extreme missingness. Physical-device ergonomics, screen-reader usability and exhaustive data/zoom coverage are not established by these tests.</p><p>AI tools: Codex and Frontend Workbench assisted architecture, implementation, tests and independent reviews. Accepted suggestions included uPlot, workers, extrema sampling and explicit source identity. Corrected or rejected: fabricated trends, mixed-scope summaries, invisible singleton/zero rendering, custom cache eviction and broad CPU/memory assumptions. Reproducible tests, actual Canvas inspection and recorded Chrome traces checked these decisions; original failures remain in the repository.</p><div class="footer"><span>Evidence and methods: README.md · docs/engineering-note.md</span><span>02 / 02</span></div></section></body></html>`;
await writeFile('docs/submission-note.html', html);
const executablePath = existsSync(chromium.executablePath())
  ? chromium.executablePath()
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pdfBrowser = await chromium.launch({ executablePath });
try {
  const page = await pdfBrowser.newPage();
  await page.goto('file://' + resolve('docs/submission-note.html'));
  const layout = await page.locator('.page').evaluateAll((pages) =>
    pages.map((page) => {
      const footer = page.querySelector('.footer');
      const lastContent = Array.from(page.children)
        .filter((element) => !element.classList.contains('footer'))
        .at(-1);
      return {
        height: page.clientHeight,
        scrollHeight: page.scrollHeight,
        footerGap: footer.getBoundingClientRect().top - lastContent.getBoundingClientRect().bottom,
      };
    }),
  );
  if (layout.some((page) => page.scrollHeight > page.height + 1 || page.footerGap < 8))
    throw new Error('Submission note overflows its two-page layout.');
  await page.pdf({
    path: resolve('docs/submission-note.pdf'),
    preferCSSPageSize: true,
    printBackground: true,
  });
  console.log(JSON.stringify({ verdict, pages: layout.length, layout }));
} finally {
  await pdfBrowser.close();
}
