/* global document, requestAnimationFrame, location, performance, clearTimeout */
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { relative, resolve } from 'node:path';

// This is an interaction soak, not a throughput or multi-hour leak guarantee.
// Args: base URL, active seconds, idle seconds, output root. Every invocation
// receives a new directory so an earlier failure cannot be overwritten.
const baseURL = process.argv[2] ?? 'http://127.0.0.1:4173';
const activeSeconds = Math.max(5, Number(process.argv[3] ?? 180));
const idleSeconds = Math.max(0, Number(process.argv[4] ?? 35));
if (!Number.isFinite(activeSeconds) || !Number.isFinite(idleSeconds))
  throw new Error('Durations must be finite seconds.');
const outputRoot = resolve(process.argv[5] ?? 'evidence/round2/soak');
const diagnostic = process.argv[6] === 'diagnostic';
const iterationLimit = diagnostic ? 10 : Infinity;
const checkpointIntervalMs = diagnostic ? 10_000 : 30_000;
const runId = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
const outputDirectory = resolve(outputRoot, runId);
await mkdir(outputDirectory, { recursive: true });
const execute = promisify(execFile);
const pause = (milliseconds) =>
  new Promise((resolvePause) => setTimeout(resolvePause, milliseconds));
const defaultExecutable = chromium.executablePath();
const executablePath = existsSync(defaultExecutable)
  ? defaultExecutable
  : ([
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ].find((candidate) => existsSync(candidate)) ?? defaultExecutable);

const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const browserSession = await browser.newBrowserCDPSession();
const pageSession = await page.context().newCDPSession(page);
await pageSession.send('Performance.enable');
const pageErrors = [];
const consoleErrors = [];
const operations = [];
const snapshots = [];
page.on('pageerror', (error) =>
  pageErrors.push({ elapsedMs: performance.now() - startedAt, message: error.message }),
);
page.on('console', (message) => {
  if (message.type() === 'error')
    consoleErrors.push({ elapsedMs: performance.now() - startedAt, message: message.text() });
});
let allocationSamplingActive = false;
let servedAssets = [];
let requestSequence = 0;
let startedAt = performance.now();

async function workerCommand(sessionId, method) {
  const id = ++requestSequence;
  let timeout;
  let listener;
  const response = new Promise((resolveResponse, reject) => {
    listener = (event) => {
      if (event.sessionId !== sessionId) return;
      const message = JSON.parse(event.message);
      if (message.id !== id) return;
      clearTimeout(timeout);
      browserSession.off('Target.receivedMessageFromTarget', listener);
      if (message.error) reject(new Error(message.error.message));
      else resolveResponse(message.result);
    };
    browserSession.on('Target.receivedMessageFromTarget', listener);
    timeout = setTimeout(() => {
      browserSession.off('Target.receivedMessageFromTarget', listener);
      reject(new Error(`${method} timed out for worker.`));
    }, 10_000);
  });
  await browserSession.send('Target.sendMessageToTarget', {
    sessionId,
    message: JSON.stringify({ id, method, params: {} }),
  });
  return response;
}
async function memorySnapshot(label) {
  // Both heaps are collected. Collecting only the document would leave the
  // million-point worker's ArrayBuffers out of the retained-memory comparison.
  await pageSession.send('HeapProfiler.collectGarbage');
  const main = await pageSession.send('Runtime.getHeapUsage');
  const { targetInfos } = await browserSession.send('Target.getTargets');
  const workers = [];
  const workerErrors = [];
  for (const target of targetInfos.filter(
    (info) => info.type === 'worker' && info.url.includes('data.worker'),
  )) {
    const { sessionId } = await browserSession.send('Target.attachToTarget', {
      targetId: target.targetId,
      flatten: false,
    });
    try {
      await workerCommand(sessionId, 'HeapProfiler.collectGarbage');
      workers.push({
        url: target.url,
        ...(await workerCommand(sessionId, 'Runtime.getHeapUsage')),
      });
    } catch (error) {
      workerErrors.push(String(error));
    } finally {
      await browserSession.send('Target.detachFromTarget', { sessionId });
    }
  }
  const { processInfo } = await browserSession.send('SystemInfo.getProcessInfo');
  const rendererIds = processInfo.filter((info) => info.type === 'renderer').map((info) => info.id);
  let rendererRssBytes = null;
  let rendererMemoryError = null;
  if (['darwin', 'linux'].includes(process.platform)) {
    try {
      const { stdout } = await execute('ps', ['-o', 'rss=', '-p', rendererIds.join(',')]);
      rendererRssBytes =
        stdout
          .trim()
          .split(/\s+/u)
          .map(Number)
          .filter(Number.isFinite)
          .reduce((sum, value) => sum + value, 0) * 1024;
    } catch (error) {
      rendererMemoryError = String(error);
    }
  }
  const contexts = [main, ...workers];
  const domCounters = await pageSession.send('Memory.getDOMCounters');
  const row = {
    label,
    domCounters,
    elapsedMs: performance.now() - startedAt,
    mainV8HeapBytes: main.usedSize,
    mainBackingStorageBytes: main.backingStorageSize ?? 0,
    workerV8HeapBytes: workers.reduce((sum, worker) => sum + worker.usedSize, 0),
    workerBackingStorageBytes: workers.reduce(
      (sum, worker) => sum + (worker.backingStorageSize ?? 0),
      0,
    ),
    combinedV8AndBackingBytes: contexts.reduce(
      (sum, context) => sum + context.usedSize + (context.backingStorageSize ?? 0),
      0,
    ),
    rendererRssBytes,
    rendererCount: rendererIds.length,
    workerCount: workers.length,
    contexts: { main, workers },
    workerErrors,
    rendererMemoryError,
    observed: await page.evaluate(() => ({
      route: location.hash,
      canvasCount: document.querySelectorAll('.metric-chart canvas').length,
      tooltipCount: document.querySelectorAll('.metric-chart__tooltip').length,
      chartCount: document.querySelectorAll('.metric-chart__interactive').length,
      pageWidth: document.documentElement.scrollWidth,
      domNodeCount: document.querySelectorAll('*').length,
      performanceEntryCount: performance.getEntries().length,
    })),
  };
  snapshots.push(row);
  if (
    row.workerCount !== 1 ||
    row.workerErrors.length ||
    row.workerBackingStorageBytes < 32_000_000
  ) {
    throw new Error(
      'Incomplete normalized 1M memory snapshot: canonical worker backing stores were not measured.',
    );
  }
  console.log(
    JSON.stringify({
      checkpoint: label,
      elapsedSeconds: Math.round(row.elapsedMs / 1000),
      combinedMB: row.combinedV8AndBackingBytes / 1_000_000,
      workerBackingMB: row.workerBackingStorageBytes / 1_000_000,
      rendererRssMB: row.rendererRssBytes === null ? null : row.rendererRssBytes / 1_000_000,
    }),
  );
  if (row.combinedV8AndBackingBytes > 600_000_000 || (row.rendererRssBytes ?? 0) > 2_000_000_000) {
    await captureAllocationProfile();
    throw new Error(
      'Memory safety cap exceeded: stopping the owned browser instead of continuing the soak.',
    );
  }
  return row;
}
async function captureAllocationProfile() {
  if (!allocationSamplingActive) return;
  const { profile } = await pageSession.send('HeapProfiler.stopSampling');
  allocationSamplingActive = false;
  const allocations = [];
  const visit = (node, parents) => {
    const frame = node.callFrame;
    const current = [
      ...parents,
      `${frame.functionName || '(anonymous)'} ${frame.url}:${frame.lineNumber + 1}:${frame.columnNumber + 1}`,
    ];
    if (node.selfSize) allocations.push({ selfBytes: node.selfSize, stack: current });
    for (const child of node.children ?? []) visit(child, current);
  };
  visit(profile.head, []);
  allocations.sort((a, b) => b.selfBytes - a.selfBytes);
  await writeFile(resolve(outputDirectory, 'allocation-profile.json'), JSON.stringify(profile));
  await writeFile(
    resolve(outputDirectory, 'allocation-summary.json'),
    JSON.stringify(
      {
        samplingIntervalBytes: 32768,
        sampledRetainedBytes: allocations.reduce(
          (sum, allocation) => sum + allocation.selfBytes,
          0,
        ),
        topAllocations: allocations.slice(0, 60),
        note: 'Retained allocation sampling identifies allocation stacks, not exact dominator/retainer chains. It excludes collected objects and does not replace a heap snapshot if the cause remains ambiguous.',
      },
      null,
      2,
    ),
  );
}
async function settled(expectedId) {
  await page.waitForFunction(
    (id) => {
      const detail = document.querySelector(`[data-run-id="${id}"][data-ready="true"]`);
      return (
        detail &&
        !detail.querySelector('.metric-chart__updating') &&
        detail.querySelectorAll('.metric-chart canvas').length === 3
      );
    },
    expectedId,
    { timeout: 30_000 },
  );
  await page.evaluate(
    () =>
      new Promise((resolveFrame) =>
        requestAnimationFrame(() => requestAnimationFrame(resolveFrame)),
      ),
  );
  // Recheck after the paint opportunity: query notifications can be batched in a
  // later task than a click. An earlier ready state is not readiness of new data.
  await page.waitForFunction(
    (id) => {
      const detail = document.querySelector(`[data-run-id="${id}"][data-ready="true"]`);
      return (
        detail &&
        !detail.querySelector('.metric-chart__updating') &&
        detail.querySelectorAll('.metric-chart canvas').length === 3
      );
    },
    expectedId,
    { timeout: 30_000 },
  );
  const counts = await page
    .locator('.metric-chart__interactive')
    .evaluateAll((charts) =>
      charts.map((chart) => Number(chart.getAttribute('data-source-points'))),
    );
  if (
    counts.length !== 3 ||
    !counts.every((count) => Number.isFinite(count) && count === counts[0])
  ) {
    throw new Error(`Source observations differ across chart viewport: ${JSON.stringify(counts)}`);
  }
}
async function openRunByNavigation(id) {
  const current = await page
    .locator('[data-run-id]')
    .getAttribute('data-run-id')
    .catch(() => null);
  if (current === id) return;
  // Hash navigation uses the real router and worker/query pipeline. It is used
  // for standardized checkpoints; active-loop switching uses visible controls.
  await page.evaluate((next) => {
    location.hash = `/runs/${next}`;
  }, id);
  await settled(id);
}
async function reloadSnapshot(id) {
  await page.getByRole('button', { name: 'Reload snapshot', exact: true }).click();
  await settled(id);
}
async function standardizeMemoryState() {
  // Match retained canonical source data at each checkpoint: these two actual
  // reloads put run002 and then run001 into the worker's two-run LRU. Otherwise
  // a small-run checkpoint cannot be compared fairly with the 1M warmup.
  await openRunByNavigation('run-002');
  await reloadSnapshot('run-002');
  await openRunByNavigation('run-001');
  const reset = page.getByRole('button', { name: 'Reset zoom', exact: true });
  if (await reset.isEnabled()) {
    await reset.click();
    await settled('run-001');
  }
  await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('linear');
  await reloadSnapshot('run-001');
}
async function persist(status, error = null) {
  const summary = snapshots.length
    ? {
        initialBytes: snapshots[0].combinedV8AndBackingBytes,
        maximumCheckpointBytes: Math.max(
          ...snapshots.map((snapshot) => snapshot.combinedV8AndBackingBytes),
        ),
        finalBytes: snapshots.at(-1).combinedV8AndBackingBytes,
        finalMinusInitialBytes:
          snapshots.at(-1).combinedV8AndBackingBytes - snapshots[0].combinedV8AndBackingBytes,
        memoryVerdict:
          'Descriptive short-run evidence only. No automatic absence-of-leaks guarantee is inferred; review checkpoints, final idle recovery and bounded source/query cache policy.',
      }
    : null;
  const result = {
    generatedAt: new Date().toISOString(),
    status,
    error,
    browser: browser.version(),
    machine: `${process.platform}/${process.arch}`,
    viewport: { width: 1440, height: 1000 },
    cpuThrottle: 1,
    servedAssets,
    requestedActiveSeconds: activeSeconds,
    diagnostic,
    iterationLimit: Number.isFinite(iterationLimit) ? iterationLimit : null,
    requestedIdleSeconds: idleSeconds,
    elapsedSeconds: (performance.now() - startedAt) / 1000,
    pace: 'At least one second between active-loop iterations, plus actual render/interaction time. Each iteration changes a run, submits one numeric range and inspects a sampled point; every third iteration also changes scale and resets zoom.',
    memoryScope:
      'GC requested in document and each matching dedicated data worker before each snapshot. Combined V8 heap+backing stores includes worker canonical typed arrays but excludes native/GPU allocations. Renderer RSS sums renderer processes in an isolated one-page browser, can include spare renderers and allocator retention, and excludes browser/GPU/utility processes.',
    standardizedCheckpoints:
      'Reload run002 then run001; reset full step domain and linear scale. This deliberately aligns the worker LRU data for retained-memory comparisons. Idle recovery keeps the same full run001 open, with no page interactions.',
    iterationCount: operations.length,
    interactionCount: operations.length,
    interactionCountMeaning:
      'Completed active iterations, not individual DOM events. Each iteration contains a run switch, range submission and keyboard inspection; every third also has two scale changes and reset.',
    actionCounts: {
      runSwitches: operations.length,
      rangeSubmissions: operations.length,
      keyboardInspections: operations.length,
      scaleChanges: operations.filter((operation) => operation.index % 3 === 0).length * 2,
      zoomResets: operations.filter((operation) => operation.index % 3 === 0).length,
    },
    visitedRunIds: [...new Set(operations.map((operation) => operation.runId))],
    summary,
    snapshots,
    operations,
    pageErrors,
    consoleErrors,
    limits: [
      'One desktop Chromium engine on one machine.',
      'Three-minute activity plus finite idle cannot exclude slower leaks or production-only behavior.',
      'No real network source, cluster, account or user telemetry is involved.',
      'GC checkpoint intervention changes natural GC scheduling; this run measures retained allocations, not unforced peak memory.',
    ],
  };
  await writeFile(resolve(outputDirectory, 'results.json'), JSON.stringify(result, null, 2));
  await writeFile(
    resolve(outputRoot, 'latest.json'),
    JSON.stringify(
      {
        runId,
        directory: outputDirectory,
        relativeDirectory: relative(process.cwd(), outputDirectory),
        status,
      },
      null,
      2,
    ),
  );
}

try {
  await page.goto(`${baseURL}/#/runs/run-001`, { waitUntil: 'domcontentloaded' });
  servedAssets = await page
    .locator('script[src], link[rel=stylesheet]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('src') ?? node.getAttribute('href')),
    );
  await settled('run-001');
  await standardizeMemoryState();
  await memorySnapshot('warmup-full-1M');
  if (diagnostic) {
    await pageSession.send('HeapProfiler.startSampling', {
      samplingInterval: 32768,
      includeObjectsCollectedByMajorGC: false,
      includeObjectsCollectedByMinorGC: false,
    });
    allocationSamplingActive = true;
  }
  const activeStarted = performance.now();
  let nextCheckpointAt = activeStarted + checkpointIntervalMs;
  let index = 0;
  let currentRun = 1;
  while (
    performance.now() - activeStarted < activeSeconds * 1000 &&
    operations.length < iterationLimit
  ) {
    // Sequential navigation covers every fixture, not only the convenient 1M run.
    const next = page.getByRole('button', { name: 'Next run', exact: true });
    if (await next.isEnabled()) {
      await next.click();
      currentRun++;
    } else {
      await page.getByRole('link', { name: 'Training runs 20', exact: true }).click();
      await page.locator('.runs-table tbody .run-name[href$="#/runs/run-001"]').click();
      currentRun = 1;
    }
    const id = `run-${String(currentRun).padStart(3, '0')}`;
    await settled(id);
    const endInput = page.getByRole('spinbutton', { name: 'End step', exact: true });
    const fullEnd = Number(await endInput.getAttribute('max'));
    const lowerFraction = ((index * 13) % 60) / 100;
    const spanFraction = [0.1, 0.25, 0.4][index % 3];
    const min = Math.floor(fullEnd * lowerFraction);
    const max = Math.max(
      min + 2,
      Math.min(fullEnd, Math.floor(fullEnd * (lowerFraction + spanFraction))),
    );
    await page.getByRole('spinbutton', { name: 'Start step', exact: true }).fill(String(min));
    await endInput.fill(String(max));
    await page.getByRole('button', { name: 'Apply range', exact: true }).click();
    await settled(id);
    const startValue = await page
      .getByRole('spinbutton', { name: 'Start step', exact: true })
      .inputValue();
    const endValue = await endInput.inputValue();
    if (Number(startValue) !== min || Number(endValue) !== max)
      throw new Error('Submitted step range did not remain visible.');
    const chart = page.getByTestId('chart-loss');
    await chart.focus();
    await page.keyboard.press(index % 2 ? 'Home' : 'End');
    await chart.locator('.metric-chart__tooltip').waitFor({ state: 'visible' });
    if (index % 3 === 0) {
      await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
      await settled(id);
      await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('linear');
      await settled(id);
      await page.getByRole('button', { name: 'Reset zoom', exact: true }).click();
      await settled(id);
    }
    operations.push({
      index,
      elapsedMs: performance.now() - startedAt,
      runId: id,
      min,
      max,
      inspectedBoundary: index % 2 ? 'first' : 'last',
    });
    index++;
    // Check cheaply between operations instead of allowing a refetch storm to
    // grow for a whole checkpoint interval. Confirm retention with GC before
    // the existing hard cap can stop the owned browser.
    const liveHeap = await pageSession.send('Runtime.getHeapUsage');
    if (liveHeap.usedSize + (liveHeap.backingStorageSize ?? 0) > 550_000_000) {
      await pageSession.send('HeapProfiler.collectGarbage');
      const retained = await pageSession.send('Runtime.getHeapUsage');
      if (retained.usedSize + (retained.backingStorageSize ?? 0) > 550_000_000) {
        await memorySnapshot('memory-safety-guard');
        throw new Error('Main document retained memory exceeded the protective soak threshold.');
      }
    }
    if (performance.now() >= nextCheckpointAt) {
      const resume = currentRun;
      await standardizeMemoryState();
      currentRun = 1;
      await memorySnapshot(`active-${Math.round((performance.now() - activeStarted) / 1000)}s`);
      if (resume !== 1) {
        await openRunByNavigation(`run-${String(resume).padStart(3, '0')}`);
        currentRun = resume;
      }
      nextCheckpointAt += checkpointIntervalMs;
      await persist('running');
    }
    await pause(1000);
  }
  await standardizeMemoryState();
  await memorySnapshot('after-active');
  await captureAllocationProfile();
  await persist('idle-recovery');
  // Bounded in-script pause; the orchestrator receives checkpoint output and can
  // continue other work while this script runs in a retained tool session.
  for (let elapsed = 0; elapsed < idleSeconds; elapsed += 5)
    await pause(Math.min(5, idleSeconds - elapsed) * 1000);
  await memorySnapshot('after-idle-recovery');
  await page.screenshot({ path: resolve(outputDirectory, 'final-workspace.png'), fullPage: true });
  const functionalErrors = pageErrors.length + consoleErrors.length;
  await persist(functionalErrors ? 'completed-with-browser-errors' : 'completed');
  console.log(
    JSON.stringify({
      outputDirectory,
      interactionCount: operations.length,
      visited: [...new Set(operations.map((operation) => operation.runId))].length,
      browserErrors: functionalErrors,
      finalBytes: snapshots.at(-1).combinedV8AndBackingBytes,
    }),
  );
  if (functionalErrors) process.exitCode = 1;
} catch (error) {
  await captureAllocationProfile().catch(() => {});
  await page
    .screenshot({ path: resolve(outputDirectory, 'failure.png'), fullPage: true })
    .catch(() => {});
  await persist(
    'failed',
    error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
  );
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
