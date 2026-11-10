import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

// All inputs are public, synthetic-project evidence. No account/provider config is used.
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const delivery = await readJson('docs/delivery.json');
function evidencePath(value, label) {
  if (
    typeof value !== 'string' ||
    !/^evidence\/[\w./-]+\.json$/.test(value) ||
    value.split('/').includes('..')
  ) {
    throw new Error(`Delivery must identify a public evidence JSON: ${label}.`);
  }
  return value;
}
const performancePath = evidencePath(delivery.performanceResults, 'performanceResults');
const finalPerformance = await readJson(performancePath);
// Historical observations remain immutable comparisons, never the current-build input.
const originalPerformancePath = 'evidence/round2/performance-before/results.json';
const previousPerformancePath = 'evidence/round2/performance-fixed/results.json';
const originalPerformance = await readJson(originalPerformancePath);
const previousPerformance = await readJson(previousPerformancePath);

function checkedCount(summary, rawValues, label) {
  if (
    !rawValues.length ||
    rawValues.some((value) => typeof value !== 'number' || !Number.isFinite(value)) ||
    summary?.count !== rawValues.length ||
    !Array.isArray(summary.values) ||
    summary.values.length !== rawValues.length ||
    summary.values.some((value, index) => !Object.is(value, rawValues[index]))
  ) {
    throw new Error(`Measurement observations disagree with raw records: ${label}.`);
  }
  return rawValues.length;
}

/** Fixture zoom is one object per run; its legacy zoomMs/hoverMs arrays are empty. */
function measurementCounts(evidence, label) {
  const fixtures = Object.fromEntries(
    Object.entries(evidence.fixtureSummary).map(([mode, summary]) => {
      const runs = evidence.fixtureRuns.filter((run) => run.mode === mode);
      return [
        mode,
        {
          firstRender: checkedCount(
            summary.firstRenderMs,
            runs.map((run) => run.firstRenderMs),
            `${label}/${mode}/firstRender`,
          ),
          zoom: checkedCount(
            summary.zoomMs,
            runs.map((run) => run.zoom.durationMs),
            `${label}/${mode}/zoom`,
          ),
          hover: checkedCount(
            summary.hoverMs,
            runs.flatMap((run) => run.hovers.map((hover) => hover.durationMs)),
            `${label}/${mode}/hover`,
          ),
        },
      ];
    }),
  );
  const runs = evidence.applicationRuns;
  return {
    fixtures,
    application: {
      firstRender: checkedCount(
        evidence.applicationSummary.firstRenderMs,
        runs.map((run) => run.firstRenderMs),
        `${label}/application/firstRender`,
      ),
      zoom: checkedCount(
        evidence.applicationSummary.zoomMs,
        runs.flatMap((run) => run.zooms.map((zoom) => zoom.durationMs)),
        `${label}/application/zoom`,
      ),
      hover: checkedCount(
        evidence.applicationSummary.hoverMs,
        runs.flatMap((run) => run.hovers.map((hover) => hover.durationMs)),
        `${label}/application/hover`,
      ),
    },
  };
}

const observationCounts = {
  current: measurementCounts(finalPerformance, performancePath),
  historicalOriginal: measurementCounts(originalPerformance, originalPerformancePath),
  previousBaseline: measurementCounts(previousPerformance, previousPerformancePath),
};
const fixtureModes = ['baseline', 'sampled-main', 'optimized'];
const fixtureCounts = Object.values(observationCounts.current.fixtures)[0];
if (
  !fixtureCounts ||
  fixtureModes.some((mode) => !observationCounts.current.fixtures[mode]) ||
  Object.values(observationCounts.current.fixtures).some(
    (counts) => JSON.stringify(counts) !== JSON.stringify(fixtureCounts),
  )
) {
  throw new Error('Fixture modes have different sample sizes; report each mode separately.');
}

const isByteCount = (value) => Number.isSafeInteger(value) && value >= 0;
const isProcessId = (value) => Number.isSafeInteger(value) && value > 0;
function checkedMemorySnapshot(snapshot, label, needsWorker, workerFilename) {
  if (
    !Array.isArray(snapshot?.errors) ||
    snapshot.errors.length !== 0 ||
    !Array.isArray(snapshot.contexts) ||
    snapshot.contexts.length !== (needsWorker ? 2 : 1) ||
    snapshot.contexts.filter((context) => context.target === 'page').length !== 1 ||
    snapshot.contexts.filter((context) => context.target === 'worker').length !==
      (needsWorker ? 1 : 0) ||
    snapshot.contexts.some(
      (context) =>
        !isByteCount(context.usedSize) ||
        !isByteCount(context.totalSize) ||
        context.totalSize < context.usedSize ||
        !isByteCount(context.backingStorageSize) ||
        (context.target === 'worker' &&
          (context.backingStorageSize < 32_000_000 ||
            assetName(context.url, `${label}/worker`) !== workerFilename)),
    ) ||
    !isByteCount(snapshot.combinedV8HeapAndBackingStorageBytes) ||
    snapshot.combinedV8HeapAndBackingStorageBytes !==
      snapshot.contexts.reduce(
        (sum, context) => sum + context.usedSize + context.backingStorageSize,
        0,
      ) ||
    !isProcessId(snapshot.rendererCount) ||
    !isByteCount(snapshot.rendererRssBytes) ||
    snapshot.rendererRssBytes === 0
  ) {
    throw new Error(`Incomplete or malformed retained-memory snapshot: ${label}.`);
  }
}
function checkedCurrentMemory(evidence) {
  const workerFilename = assetName(evidence.build?.worker?.filename, 'performance/build.worker');
  const allModes = [...fixtureModes, 'application'];
  if (
    evidence.repetitions !== 5 ||
    evidence.fixtureRuns.length !== 15 ||
    evidence.applicationRuns.length !== 5 ||
    !Array.isArray(evidence.fixtureModes) ||
    evidence.fixtureModes.length !== fixtureModes.length ||
    fixtureModes.some((mode) => !evidence.fixtureModes.includes(mode)) ||
    evidence.fixtureRuns.some((run) => !fixtureModes.includes(run.mode))
  ) {
    throw new Error('Current performance evidence requires 5 raw runs in each of four modes.');
  }
  for (const mode of allModes) {
    const runs =
      mode === 'application'
        ? evidence.applicationRuns
        : evidence.fixtureRuns.filter((run) => run.mode === mode);
    if (
      runs.length !== 5 ||
      [1, 2, 3, 4, 5].some(
        (iteration) => runs.filter((run) => run.iteration === iteration).length !== 1,
      ) ||
      runs.some(
        (run) =>
          run.browserVersion !== evidence.browser ||
          run.hovers?.length !== 3 ||
          (mode === 'application' && run.zooms?.length !== 3),
      )
    ) {
      throw new Error(`Current performance evidence has incomplete raw repetitions: ${mode}.`);
    }
    for (const run of runs) {
      checkedMemorySnapshot(
        run.memoryAtOverview,
        `${mode}/${run.iteration}`,
        mode === 'application' || mode === 'optimized',
        workerFilename,
      );
    }
  }
  if (
    !Array.isArray(evidence.attributedMemory) ||
    evidence.attributedMemory.length !== allModes.length ||
    allModes.some(
      (mode) => evidence.attributedMemory.filter((entry) => entry.mode === mode).length !== 1,
    )
  ) {
    throw new Error('Current performance evidence requires one attributed overview per mode.');
  }
  for (const entry of evidence.attributedMemory) {
    const label = `attributedMemory/${entry.mode}`;
    const needsWorker = entry.mode === 'application' || entry.mode === 'optimized';
    if (
      entry.dump?.success !== true ||
      typeof entry.dump.dumpGuid !== 'string' ||
      !entry.dump.dumpGuid ||
      entry.traceFile !== `${entry.mode}.memory.trace.json` ||
      !Array.isArray(entry.frameProcesses) ||
      entry.frameProcesses.length !== 1 ||
      !Array.isArray(entry.workerProcesses) ||
      entry.workerProcesses.length !== (needsWorker ? 1 : 0) ||
      !Array.isArray(entry.attributedProcessIds) ||
      !isByteCount(entry.attributedRendererPrivateFootprintBytes) ||
      entry.attributedRendererPrivateFootprintBytes === 0 ||
      !isByteCount(entry.attributedRendererRssBytes) ||
      entry.attributedRendererRssBytes === 0
    ) {
      throw new Error(`Incomplete or malformed MemoryInfra attribution: ${label}.`);
    }
    const frame = entry.frameProcesses[0];
    if (
      typeof frame.frame !== 'string' ||
      !frame.frame ||
      frame.isOutermostMainFrame !== true ||
      frame.isInPrimaryMainFrame !== true ||
      !isProcessId(frame.processId) ||
      entry.workerProcesses.some(
        (worker) =>
          worker.frame !== frame.frame ||
          !isProcessId(worker.pid) ||
          assetName(worker.url, `${label}/worker`) !== workerFilename,
      )
    ) {
      throw new Error(`Malformed frame/worker attribution: ${label}.`);
    }
    const processIds = new Set([
      frame.processId,
      ...entry.workerProcesses.map((worker) => worker.pid),
    ]);
    if (
      entry.attributedProcessIds.length !== processIds.size ||
      new Set(entry.attributedProcessIds).size !== processIds.size ||
      entry.attributedProcessIds.some((pid) => !processIds.has(pid))
    ) {
      throw new Error(`Attributed renderer PIDs disagree with frame/worker metadata: ${label}.`);
    }
    checkedMemorySnapshot(entry.v8AndRss, label, needsWorker, workerFilename);
  }
}
checkedCurrentMemory(finalPerformance);
if (process.argv.includes('--verify-measurements')) {
  console.log(
    JSON.stringify({ performancePath, observationCounts, checkedAgainstRawRecords: true }, null, 2),
  );
  process.exit(0);
}

const browser = await readJson(evidencePath(delivery.browserResults, 'browserResults'));
const unit = await readJson(evidencePath(delivery.unitResults, 'unitResults'));
if (
  unit.success !== true ||
  unit.numTotalTests !== unit.numPassedTests ||
  unit.numFailedTests ||
  unit.numPendingTests
) {
  throw new Error('Submission note requires the complete passing unit report.');
}
const unitCount = unit.numPassedTests;
const soakIndexPath = evidencePath(delivery.sustainedUse, 'sustainedUse');
const soakIndex = await readJson(soakIndexPath);
const soak = await readJson(resolve(dirname(soakIndexPath), soakIndex.runId, 'results.json'));
if (
  browser.stats.unexpected ||
  browser.stats.skipped ||
  browser.stats.flaky ||
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
function assetName(value, label) {
  if (typeof value !== 'string' || !value) throw new Error(`Missing asset filename: ${label}.`);
  return new URL(value, 'https://public-evidence.invalid/').pathname.split('/').at(-1);
}
function fingerprint(value, label, kind) {
  const filename = assetName(value?.filename, label);
  const pattern = kind === 'application' ? /^app-[\w-]+\.js$/ : /^data\.worker-[\w-]+\.js$/;
  if (!pattern.test(filename) || !/^[a-f0-9]{64}$/i.test(value?.sha256 ?? '')) {
    throw new Error(`Missing valid served ${kind} fingerprint: ${label}.`);
  }
  return { filename, sha256: value.sha256.toLowerCase() };
}
const hostedPath = evidencePath(delivery.hostedSmokeResults, 'hostedSmokeResults');
const hosted = await readJson(hostedPath);
const engines = ['chromium', 'firefox', 'webkit'];
if (
  hosted.pass !== true ||
  hosted.engines?.length !== engines.length ||
  engines.some((name) => hosted.engines.filter((engine) => engine.engine === name).length !== 1) ||
  hosted.engines.some((engine) => engine.status !== 'pass')
) {
  throw new Error('Submission note requires passing hosted smoke in all three engines.');
}
const buildIdentity = {};
for (const kind of ['application', 'worker']) {
  const expected = fingerprint(
    { filename: delivery[`${kind}Bundle`], sha256: delivery[`${kind}Sha256`] },
    `delivery/${kind}`,
    kind,
  );
  const observed = [
    ['performance', fingerprint(finalPerformance.build?.[kind], `performance/${kind}`, kind)],
    ['sustained-use', fingerprint(soak[kind], `sustained-use/${kind}`, kind)],
    ...hosted.engines.map((engine) => {
      const matching = engine.bundles.filter(
        (bundle) => assetName(bundle.url, `hosted/${engine.engine}`) === expected.filename,
      );
      if (matching.length !== 1 || matching[0].status !== 200) {
        throw new Error(`Hosted smoke must identify one successful ${kind}: ${engine.engine}.`);
      }
      return [
        `hosted/${engine.engine}`,
        fingerprint(
          { filename: matching[0].url, sha256: matching[0].sha256 },
          `hosted/${engine.engine}/${kind}`,
          kind,
        ),
      ];
    }),
  ];
  for (const [label, actual] of observed) {
    if (actual.filename !== expected.filename || actual.sha256 !== expected.sha256) {
      throw new Error(`Current ${kind} fingerprint disagrees with delivery: ${label}.`);
    }
  }
  buildIdentity[kind] = expected;
}
if (
  !finalPerformance.build.assets.some(
    (asset) => assetName(asset, 'performance/build.assets') === buildIdentity.application.filename,
  ) ||
  !soak.servedAssets.some(
    (asset) =>
      assetName(asset, 'sustained-use/servedAssets') === buildIdentity.application.filename,
  )
) {
  throw new Error('Measured document assets disagree with the served application fingerprint.');
}
const calibrationPath = evidencePath(delivery.cpuScopeCalibration, 'cpuScopeCalibration');
const calibration = await readJson(calibrationPath);
if (
  typeof finalPerformance.browser !== 'string' ||
  typeof finalPerformance.machine !== 'string' ||
  calibration.browser !== finalPerformance.browser ||
  finalPerformance.cpuThrottle !== 4 ||
  soak.cpuThrottle !== 1
) {
  throw new Error('CPU scope must have a matching-browser calibration and explicit page rates.');
}
if (process.argv.includes('--verify-evidence')) {
  console.log(
    JSON.stringify(
      {
        performancePath,
        soakIndexPath,
        hostedPath,
        calibrationPath,
        buildIdentity,
        observationCounts,
        checkedAgainstRawRecords: true,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
const f = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new Error('Missing finite evidence value.');
  return value.toFixed(1);
};
const mb = (value) => f(value / 1_000_000);
const fixture = finalPerformance.fixtureSummary;
const app = finalPerformance.applicationSummary;
const original = originalPerformance.applicationSummary;
const previous = previousPerformance.applicationSummary;
const historicalBrowserVersions = [
  ...new Set([originalPerformance.browser, previousPerformance.browser]),
];
const comparisonCaveat = historicalBrowserVersions.some(
  (version) => version !== finalPerformance.browser,
)
  ? `Historical browser versions: ${historicalBrowserVersions.join(' / ')}. Browser version and run order confound build differences; these samples do not establish causes or a faster complete interface.`
  : 'Sequential local samples are descriptive; they do not establish causes or a faster complete interface.';
const memory = Object.fromEntries(
  finalPerformance.attributedMemory.map((entry) => [entry.mode, entry]),
);
const measuredBundleName = buildIdentity.application.filename;
const appCounts = observationCounts.current.application;
const measurementDate = new Date(finalPerformance.generatedAt).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
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
const stat = (comparison, key) => `${f(comparison[key].median)} → ${f(app[key].median)} ms`;
const comparisonStats = (comparison) =>
  `first render ${stat(comparison, 'firstRenderMs')}; zoom ${stat(comparison, 'zoomMs')}; hover ${stat(comparison, 'hoverMs')}`;
const rows = [
  ['First render', 'firstRenderMs', ' ms'],
  ['Zoom', 'zoomMs', ' ms'],
  ['Hover', 'hoverMs', ' ms'],
]
  .map(
    ([title, key, unit]) =>
      `<tr><td>${title}</td>${fixtureModes.map((mode) => `<td>${f(fixture[mode][key].median)}${unit}</td>`).join('')}</tr>`,
  )
  .join('');
const memoryRow = `<tr><td>Renderer private footprint, one overview</td>${fixtureModes.map((mode) => `<td>${mb(memory[mode].attributedRendererPrivateFootprintBytes)} MB</td>`).join('')}</tr>`;
const warm = soak.snapshots[0];
const peak = Math.max(...soak.snapshots.map((entry) => entry.combinedV8AndBackingBytes));
const last = soak.snapshots.at(-1);
const retainedChange = last.combinedV8AndBackingBytes - warm.combinedV8AndBackingBytes;
const countedActions = Object.values(soak.actionCounts).reduce((total, count) => total + count, 0);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SOUP — Engineering note</title><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#102A43;background:#fff;font:13px/1.43 Arial,sans-serif}.page{width:210mm;height:297mm;padding:15mm 17mm 14mm;position:relative;break-after:page}.page:last-child{break-after:auto}header{font-size:8px;letter-spacing:1.5px;text-transform:uppercase;display:flex;justify-content:space-between;color:#627D98;border-bottom:1px solid #D9E2EC;padding-bottom:9px}h1{font-size:25px;letter-spacing:-.6px;line-height:1.2;margin:17px 0 8px}h2{font-size:12px;margin:13px 0 5px}p{margin:5px 0 8px}.verdict{padding:9px 12px;border-left:3px solid ${canShip ? '#27AB83' : '#D64545'};background:#F0F4F8;margin:12px 0}table{width:100%;border-collapse:collapse;margin:8px 0;font-size:9px}th,td{text-align:left;padding:5px 7px;border-bottom:1px solid #D9E2EC}th{background:#F0F4F8}td:nth-child(n+2),th:nth-child(n+2){text-align:right}.muted{color:#486581;font-size:9px}ul{padding-left:15px;margin:5px 0}li{margin-bottom:4px}.footer{position:absolute;bottom:10mm;left:17mm;right:17mm;border-top:1px solid #D9E2EC;padding-top:7px;display:flex;justify-content:space-between;color:#627D98;font-size:8px}code{font-size:9px}a{color:#102A43}
</style></head><body>
<section class="page"><header><span>SOUP / Training Observatory</span><span>${measurementDate} · Engineering note</span></header><h1>A truthful chart needs more<br>than a passing sampler.</h1><div class="verdict"><strong>${verdict}.</strong> ${verdictDetail} This exercise explicitly uses generated data; real training control is outside its scope.</div>${deliveryLinks}<p><strong>First improvement after SHIP:</strong> impose explicit processing/output budgets for extremely fragmented series; if truthful rendering exceeds the budget, ask for a narrower range instead of silently dropping breaks.</p>
<h2>1 / What is kept, and what is discarded</h2><p>Twenty deterministic runs include NaN/Infinity, duplicates, unordered steps, missing steps, zeros, divergence and a 1M-point run. Source steps must be nonnegative safe integers; unsupported rows are rejected and counted. Numeric sorting uses the last received duplicate, including invalid latest values.</p><p>A worker retains four Float64 columns (32 MB at 1M). Exact viewport bounds precede first/last/min/max selection in each finite segment and step bucket. No averages or smoothing are used. Invalid values and absent steps break the line. Sign boundaries are retained before reduction, so log masking also breaks at every nonpositive interval. A unique spike survives selection in every containing viewport by construction; isolated finite points get visible markers. Constant zero lines are padded inside the plot rather than clipped at its edge.</p><p>Hover and CSV identify sampled observations. Statistics use all unique rows in view; pending/failed ranges show unavailable statistics. Dense timing and lesser peaks within one bucket are discarded. Subpixel gaps can be visually tiny, so missingness counts remain visible. Pathologically many gaps or sign changes exceed the ordinary output budget and remain a declared workload limit.</p>
<h2>2 / Executed evidence, including failures</h2><p><strong>${unitCount} unit tests; ${browser.stats.expected / 3} scenarios × 3 engines = ${browser.stats.expected} browser executions passed</strong>, without skipped/flaky results. Chromium, Firefox and WebKit ran against the production bundle on macOS. Independent oracles exercise 128 malformed streams, 1,152 dataset/range/metric combinations and 105 outlier/boundary cases.</p><p>Browser checks inspect actual Canvas spikes, NaN breaks, singleton/zero lines and drawn axis labels/coordinates. They control real Worker reply order through React/query/client, test stale/malformed responses, loading/error scope, drag/reset, keyboard focus, storage, UTC+14/Russian locale, 320/390/768px, DPR2 and touch emulation. Fifteen axe states have zero confirmed violations; mobile-dialog background estimates remain incomplete, with 31 nodes independently checked at contrast 5.27–13.25:1.</p><p>A long run found a serious defect after short tests passed: custom cache eviction removed a new query during observer attachment, retaining responses and growing memory to about 495 MB. The mechanism was removed in favor of TanStack's lifecycle-aware 10-second GC. A real-observer regression failed at range 12 before the fix and passed 40 transitions afterward; the UI regression completes 20 viewports with exactly 20 Worker requests per engine. Original failed tests, allocation samples and rejected-build measurements remain in <code>evidence/round2/</code>.</p><div class="footer"><span>Reproduce: npm ci · npm run check · npm run test:e2e</span><span>01 / 02</span></div></section>
<section class="page"><header><span>SOUP / Training Observatory</span><span>Performance · Silent failures · Limits</span></header><h2 style="margin-top:17px">3 / Performance in numbers</h2><p>Current final bundle <code>${measuredBundleName}</code>; browser ${finalPerformance.browser}, ${finalPerformance.machine}. Application and worker SHA256 match performance, sustained-use, delivery and all hosted engines. Per fixture mode: ${fixtureCounts.firstRender} first renders, ${fixtureCounts.zoom} zooms, ${fixtureCounts.hover} hovers; full application: ${appCounts.firstRender}/${appCounts.zoom}/${appCounts.hover}, respectively. Medians below. First render includes preparation; zoom/hover span the actual in-page event to matching charts and two paint opportunities, excluding automation transport.</p><table><thead><tr><th>Controlled loss chart</th><th>Raw 1M</th><th>Main sampling</th><th>Worker sampling</th></tr></thead><tbody>${rows}${memoryRow}</tbody></table><p><strong>Full app, historical original → current:</strong> ${comparisonStats(original)}.<br><strong>Previous pre-log-fix baseline → current:</strong> ${comparisonStats(previous)}. ${comparisonCaveat}</p><p class="muted">CPU ×${finalPerformance.cpuThrottle} applies to the page; worker scheduling is separately calibrated in the same browser. The main-sampled control separates reduction from worker placement. This does not model an equally throttled whole device. MemoryInfra maps actual frame/worker PIDs outside timed runs and excludes spare/browser/GPU processes. Full 3-chart app: ${mb(memory.application.attributedRendererPrivateFootprintBytes)} MB private renderer footprint. Local evidence, not a device SLA or deployment-latency benchmark. Raw samples/traces: ${dirname(performancePath)}/; calibration: ${calibrationPath}.</p>
<h2>4 / Silent failures and sustained use</h2><ul><li><strong>Staleness:</strong> immutable source revision and recorded time stay separate from view preparation. Old revisions and impossible chronology fail closed; reload never claims new training observations.</li><li><strong>Races:</strong> run/revision/range/width identify queries, and a response retains its producing viewport. Late replies cannot populate a different run; prior same-run plots stay covered while updating.</li><li><strong>Numbers:</strong> UTC and explicit numeric formatting are tested under other browser locales/zones. No smoothing hides divergence; log zero exclusions never become invented positive values.</li></ul><p>The same final bundle completed ${soak.iterationCount} active cycles (${countedActions} counted actions) across all 20 runs, ${soak.requestedActiveSeconds}s activity plus ${soak.requestedIdleSeconds}s idle at normal CPU scheduling, with ${soak.pageErrors.length + soak.consoleErrors.length} browser errors. Retained page+worker V8/backing stores: ${mb(warm.combinedV8AndBackingBytes)} MB warm → ${mb(peak)} MB maximum checkpoint → ${mb(last.combinedV8AndBackingBytes)} MB after idle (${retainedChange >= 0 ? '+' : ''}${mb(retainedChange)} MB net). Explicit GC includes worker source storage; this measures retained allocations, not unforced peak memory or absence of slower leaks.</p>
<h2>5 / Surprise, concern, and AI use</h2><p>The surprising failure was a correctly retained spike that Canvas did not paint when surrounded by gaps. Later, a cache “optimization” passed short tests yet caused runaway retention. The remaining concern is dense visual compression and workloads with extreme missingness. Physical-device ergonomics, screen-reader usability and exhaustive data/zoom coverage are not established by these tests.</p><p>AI tools: Codex and Frontend Workbench assisted architecture, implementation, tests and independent reviews. Accepted suggestions included uPlot, workers, extrema sampling and explicit source identity. Corrected or rejected: fabricated trends, mixed-scope summaries, invisible singleton/zero rendering, custom cache eviction and broad CPU/memory assumptions. Original failures remain in the repository.</p><p><strong>Direct review:</strong> Codex directly inspected the sampling and Canvas-regression source, visually reviewed both rendered PDF pages, reconciled raw counts and memory/soak records, and parsed four timing plus four memory traces to verify Paint/EventDispatch events and recompute attributed renderer-private bytes. Automated unit, three-engine browser and Canvas suites provided the regression results separately from those direct source, document and evidence reviews.</p><div class="footer"><span>Evidence and methods: README.md · docs/engineering-note.md</span><span>02 / 02</span></div></section></body></html>`;
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
  console.log(
    JSON.stringify({
      verdict,
      pages: layout.length,
      layout,
      performancePath,
      soakIndexPath,
      hostedPath,
      calibrationPath,
      performanceBundle: measuredBundleName,
      buildIdentity,
      observationCounts,
      checkedAgainstRawRecords: true,
    }),
  );
} finally {
  await pdfBrowser.close();
}
