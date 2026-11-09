/* global window, document, requestAnimationFrame, performance, MutationObserver, URLSearchParams, location, PerformanceObserver, clearTimeout */
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const baseURL = process.argv[2] ?? 'http://127.0.0.1:4173';
const repetitions = Number(process.argv[3] ?? 5);
if (!Number.isSafeInteger(repetitions) || repetitions < 1 || repetitions > 20)
  throw new Error('Repetitions must be an integer between 1 and 20.');
const modes =
  process.argv[5] === 'application-only' ? [] : ['baseline', 'sampled-main', 'optimized'];
const outputDirectory = resolve(process.argv[4] ?? 'evidence/round2/performance');
if (
  ['results.json', 'results.partial.json', 'failure.json'].some((file) =>
    existsSync(resolve(outputDirectory, file)),
  )
)
  throw new Error(
    'Evidence already exists. Choose a fresh fourth argument directory; failed and successful runs are never overwritten.',
  );
const run = promisify(execFile);
await mkdir(outputDirectory, { recursive: true });
const sourceIndex = await readFile(resolve('dist/index.html'));
const benchmarkIndex = await readFile(resolve('dist/benchmark.html'));
const build = {
  indexSha256: createHash('sha256').update(sourceIndex).digest('hex'),
  benchmarkIndexSha256: createHash('sha256').update(benchmarkIndex).digest('hex'),
  benchmarkAssets: benchmarkIndex.toString().match(/\.\/assets\/[^"\s]+/gu) ?? [],
  assets: sourceIndex.toString().match(/\.\/assets\/[^"\s]+/gu) ?? [],
};
const defaultExecutable = chromium.executablePath();
const executablePath = existsSync(defaultExecutable)
  ? defaultExecutable
  : ([
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ].find((candidate) => existsSync(candidate)) ?? defaultExecutable);
const memoryScope =
  'V8 total includes measured page+dedicated-worker JS heap and backing stores after explicit GC in both contexts; excludes native/GPU allocations. RSS sums renderer processes in an isolated one-page browser and may include spare renderers; browser/GPU/utility processes are excluded. RSS is an approximation of tab footprint, not the browser Task Manager private-memory number.';
const cpuScope =
  'Emulation.setCPUThrottlingRate(rate:4) applies to the page. Dedicated workers are not equivalently throttled in the measured Chrome 156 calibration: about 121 ms at page x1 and 119 ms at page x4 for identical work; the worker-target command reports pages-only. See ../cpu-scope-calibration.json. The sampled-main control separates same-thread reduction from off-thread placement. No low-end-device extrapolation is asserted.';
let nestedSequence = 0;
async function nestedCommand(session, sessionId, method, params = {}) {
  const id = ++nestedSequence;
  let timer;
  const response = new Promise((resolveResponse, reject) => {
    const listener = (event) => {
      if (event.sessionId !== sessionId) return;
      const message = JSON.parse(event.message);
      if (message.id !== id) return;
      clearTimeout(timer);
      session.off('Target.receivedMessageFromTarget', listener);
      if (message.error) reject(new Error(message.error.message));
      else resolveResponse(message.result);
    };
    session.on('Target.receivedMessageFromTarget', listener);
    timer = setTimeout(() => {
      session.off('Target.receivedMessageFromTarget', listener);
      reject(new Error(`Worker ${method} request timed out.`));
    }, 5_000);
  });
  await session.send('Target.sendMessageToTarget', {
    sessionId,
    message: JSON.stringify({ id, method, params }),
  });
  return response;
}
async function readStream(session, handle) {
  const chunks = [];
  for (;;) {
    const data = await session.send('IO.read', { handle, size: 1024 * 1024 });
    chunks.push(data.base64Encoded ? Buffer.from(data.data, 'base64') : Buffer.from(data.data));
    if (data.eof) break;
  }
  await session.send('IO.close', { handle });
  return Buffer.concat(chunks);
}
async function stopTrace(session, target) {
  const complete = new Promise((resolveTrace) =>
    session.once('Tracing.tracingComplete', resolveTrace),
  );
  await session.send('Tracing.end');
  const result = await complete;
  if (!result.stream) throw new Error('Chrome did not return a trace stream.');
  const bytes = await readStream(session, result.stream);
  await writeFile(target, bytes);
  const trace = JSON.parse(bytes.toString());
  const events = trace.traceEvents ?? [];
  return {
    events: events.length,
    paintEvents: events.filter((event) => event.name === 'Paint').length,
    inputEvents: events.filter((event) => event.name === 'EventDispatch').length,
    frameProcesses: events
      .filter((event) => event.name === 'TracingStartedInBrowser')
      .flatMap((event) => event.args?.data?.frames ?? []),
    workerProcesses: events
      .filter((event) => event.name === 'TracingSessionIdForWorker')
      .map((event) => ({ pid: event.pid, ...event.args?.data })),
    processPrivateFootprints: events
      .filter((event) => event.args?.dumps?.process_totals?.private_footprint_bytes !== undefined)
      .map((event) => ({
        pid: event.pid,
        bytes: Number.parseInt(event.args.dumps.process_totals.private_footprint_bytes, 16),
        rawHex: event.args.dumps.process_totals.private_footprint_bytes,
      })),
    userTimingNames: [
      ...new Set(
        events.filter((event) => event.name.startsWith('soup:')).map((event) => event.name),
      ),
    ],
  };
}
async function memorySnapshot(browserSession, pageSession) {
  await pageSession.send('HeapProfiler.collectGarbage');
  const main = await pageSession.send('Runtime.getHeapUsage');
  const contexts = [{ target: 'page', ...main }];
  const errors = [];
  const { targetInfos } = await browserSession.send('Target.getTargets');
  for (const target of targetInfos.filter(
    (info) => info.type === 'worker' && info.url.includes('data.worker'),
  )) {
    const { sessionId } = await browserSession.send('Target.attachToTarget', {
      targetId: target.targetId,
      flatten: false,
    });
    try {
      await nestedCommand(browserSession, sessionId, 'HeapProfiler.collectGarbage');
      contexts.push({
        target: 'worker',
        url: target.url,
        ...(await nestedCommand(browserSession, sessionId, 'Runtime.getHeapUsage')),
      });
    } catch (error) {
      errors.push(String(error));
    } finally {
      await browserSession.send('Target.detachFromTarget', { sessionId });
    }
  }
  const { processInfo } = await browserSession.send('SystemInfo.getProcessInfo');
  const rendererIds = processInfo.filter((info) => info.type === 'renderer').map((info) => info.id);
  let rendererRssBytes = null;
  if (process.platform === 'darwin' || process.platform === 'linux') {
    try {
      const { stdout } = await run('ps', ['-o', 'rss=', '-p', rendererIds.join(',')]);
      rendererRssBytes =
        stdout
          .trim()
          .split(/\s+/u)
          .map(Number)
          .filter(Number.isFinite)
          .reduce((sum, value) => sum + value, 0) * 1024;
    } catch (error) {
      errors.push(String(error));
    }
  }
  return {
    contexts,
    combinedV8HeapAndBackingStorageBytes: contexts.reduce(
      (sum, context) => sum + context.usedSize + (context.backingStorageSize ?? 0),
      0,
    ),
    rendererRssBytes,
    rendererCount: rendererIds.length,
    errors,
    scope: memoryScope,
  };
}
async function preparePage(browser, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const pageSession = await page.context().newCDPSession(page);
  const browserSession = await browser.newBrowserCDPSession();
  await pageSession.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await pageSession.send('Performance.enable');
  return { page, pageSession, browserSession };
}
async function startTrace(session) {
  await session.send('Tracing.start', {
    categories:
      'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing,v8,disabled-by-default-v8.cpu_profiler,disabled-by-default-devtools.screenshot',
    transferMode: 'ReturnAsStream',
    options: 'sampling-frequency=1000',
  });
}
function applicationCollector() {
  const api = {
    firstRenderMs: null,
    zooms: [],
    hovers: [],
    longTasks: [],
    armed: null,
    pending: null,
    scheduled: false,
    firstScheduled: false,
  };
  window.soupApplicationPerformance = api;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        api.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
    }).observe({ type: 'longtask', buffered: true });
  } catch {
    /* Optional browser metric; timeline remains primary evidence. */
  }
  const view = () => document.querySelector('[data-run-id="run-001"]');
  const charts = () => [...document.querySelectorAll('.metric-chart__interactive')];
  const settled = () => {
    if (
      !view() ||
      charts().length !== 3 ||
      document.querySelector('.metric-chart__updating') ||
      document.fonts.status !== 'loaded'
    )
      return false;
    const params = new URLSearchParams(location.hash.split('?')[1]);
    const expectedMin = Number(params.get('min') ?? 0);
    const expectedMax = Number(params.get('max') ?? 999999);
    return charts().every((chart) =>
      chart.hasAttribute('data-x-min') && chart.hasAttribute('data-x-max')
        ? Number(chart.getAttribute('data-x-min')) === expectedMin &&
          Number(chart.getAttribute('data-x-max')) === expectedMax
        : Number(chart.getAttribute('data-source-points')) === expectedMax - expectedMin + 1 &&
          chart.querySelector('canvas')?.width > 0,
    );
  };
  const afterPaint = (callback) => requestAnimationFrame(() => requestAnimationFrame(callback));
  const check = () => {
    if (api.firstRenderMs === null && !api.firstScheduled && settled()) {
      api.firstScheduled = true;
      afterPaint(() => {
        api.firstScheduled = false;
        if (!settled() || api.firstRenderMs !== null) return;
        api.firstRenderMs = performance.now();
        performance.mark('soup:app:first-settled');
        performance.measure('soup:app:first-render', { start: 0, end: api.firstRenderMs });
      });
    }
    const pending = api.pending;
    if (!pending || api.scheduled) return;
    const tooltip =
      document.querySelector('.metric-chart--loss .metric-chart__tooltip')?.textContent ?? '';
    const ready =
      pending.kind === 'zoom'
        ? settled() && location.hash !== pending.oldHash
        : settled() && !!tooltip && tooltip !== pending.oldTooltip;
    if (!ready) return;
    api.scheduled = true;
    afterPaint(() => {
      api.scheduled = false;
      if (api.pending !== pending || !settled()) return;
      const tip =
        document.querySelector('.metric-chart--loss .metric-chart__tooltip')?.textContent ?? '';
      if (pending.kind === 'zoom' && location.hash === pending.oldHash) return;
      if (pending.kind === 'hover' && (!tip || tip === pending.oldTooltip)) return;
      const end = performance.now();
      const name = `soup:app:${pending.kind}`;
      performance.mark(`${name}-painted`);
      performance.measure(name, { start: pending.start, end });
      const result = {
        durationMs: end - pending.start,
        isTrusted: pending.isTrusted,
        startTime: pending.start,
        endTime: end,
        hash: location.hash,
        tooltip: pending.kind === 'hover' ? tip : undefined,
      };
      if (pending.kind === 'zoom') api.zooms.push(result);
      else api.hovers.push(result);
      api.pending = null;
    });
  };
  api.arm = (kind) => {
    api.armed = kind;
    api.pending = null;
  };
  document.addEventListener(
    'click',
    (event) => {
      if (api.armed !== 'zoom' || !event.target.closest?.('button[aria-label="Zoom in"]')) return;
      api.armed = null;
      api.pending = {
        kind: 'zoom',
        start: performance.now(),
        isTrusted: event.isTrusted,
        oldHash: location.hash,
      };
      performance.mark('soup:app:zoom-start');
      check();
    },
    { capture: true },
  );
  document.addEventListener(
    'mousemove',
    (event) => {
      if (api.armed !== 'hover' || !event.target.closest?.('.metric-chart--loss .u-over')) return;
      api.armed = null;
      api.pending = {
        kind: 'hover',
        start: performance.now(),
        isTrusted: event.isTrusted,
        oldTooltip:
          document.querySelector('.metric-chart--loss .metric-chart__tooltip')?.textContent ?? '',
      };
      performance.mark('soup:app:hover-start');
      check();
    },
    { capture: true },
  );
  new MutationObserver(check).observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  document.addEventListener('DOMContentLoaded', check);
  document.fonts.addEventListener('loadingdone', check);
  void document.fonts.ready.then(check);
}
const fixtureRuns = [];
const applicationRuns = [];
const attributedMemory = [];
try {
  for (const mode of modes) {
    for (let iteration = 1; iteration <= repetitions; iteration++) {
      const browser = await chromium.launch({ headless: true, executablePath });
      try {
        const { page, pageSession, browserSession } = await preparePage(browser, {
          width: 1100,
          height: 850,
        });
        const recordTrace = iteration === 1;
        if (recordTrace) await startTrace(pageSession);
        await page.goto(`${baseURL}/benchmark.html?mode=${mode}`, {
          waitUntil: 'domcontentloaded',
        });
        await page.waitForFunction(() => window.soupBenchmark?.ready === true, undefined, {
          timeout: 90_000,
        });
        const first = await page.evaluate(() => window.soupBenchmark.results);
        if (!first.spikeRetained) throw new Error(`${mode} lost the spike at overview.`);
        const memoryAtOverview = await memorySnapshot(browserSession, pageSession);
        const zoom = await page.evaluate(() => window.soupBenchmark.zoom());
        if (!zoom.spikeRetained) throw new Error(`${mode} lost the spike at zoom.`);
        const hovers = [];
        const bounds = await page.locator('#plot .u-over').boundingBox();
        if (!bounds) throw new Error('Fixture cursor surface missing.');
        for (const fraction of [0.4, 0.5, 0.6]) {
          await page.mouse.move(5, 5);
          await page.evaluate(() => window.soupBenchmark.armHover());
          await page.mouse.move(bounds.x + bounds.width * fraction, bounds.y + bounds.height * 0.5);
          await page.waitForFunction(() => window.soupBenchmark.lastHover !== undefined);
          const hover = await page.evaluate(() => window.soupBenchmark.lastHover);
          if (!hover.isTrusted) throw new Error('Fixture input was not trusted.');
          hovers.push(hover);
        }
        if (hovers[1].step !== 500000 || hovers[1].value !== 9.4)
          throw new Error(`${mode} hover at the spike disagrees with source.`);
        let traceSummary = null;
        if (recordTrace) {
          await page.screenshot({ path: resolve(outputDirectory, `${mode}.png`), fullPage: true });
          traceSummary = await stopTrace(
            pageSession,
            resolve(outputDirectory, `${mode}.trace.json`),
          );
        }
        const row = {
          mode,
          iteration,
          browserVersion: browser.version(),
          ...first,
          zoom,
          hovers,
          memoryAtOverview,
          traceFile: recordTrace ? `${mode}.trace.json` : null,
          traceSummary,
        };
        fixtureRuns.push(row);
        console.log(
          JSON.stringify({
            fixture: mode,
            iteration,
            renderMs: first.firstRenderMs,
            zoomMs: zoom.durationMs,
            hoverMs: hovers.map((hover) => hover.durationMs),
            bytes: memoryAtOverview.combinedV8HeapAndBackingStorageBytes,
          }),
        );
        await writeFile(
          resolve(outputDirectory, 'results.partial.json'),
          JSON.stringify({ build, fixtureRuns, applicationRuns }, null, 2),
        );
      } finally {
        await browser.close();
      }
    }
  }
  for (let iteration = 1; iteration <= repetitions; iteration++) {
    const browser = await chromium.launch({ headless: true, executablePath });
    try {
      const { page, pageSession, browserSession } = await preparePage(browser, {
        width: 1440,
        height: 1000,
      });
      await page.addInitScript(applicationCollector);
      const recordTrace = iteration === 1;
      if (recordTrace) await startTrace(pageSession);
      await page.goto(`${baseURL}/#/runs/run-001`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        () =>
          window.soupApplicationPerformance?.firstRenderMs !== null &&
          window.soupApplicationPerformance?.firstRenderMs !== undefined,
        undefined,
        { timeout: 90_000 },
      );
      const memoryAtOverview = await memorySnapshot(browserSession, pageSession);
      for (let zoom = 0; zoom < 3; zoom++) {
        await page.evaluate(() => window.soupApplicationPerformance.arm('zoom'));
        await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
        await page.waitForFunction(
          (count) => window.soupApplicationPerformance.zooms.length > count,
          zoom,
          { timeout: 30_000 },
        );
      }
      const chart = page.getByTestId('chart-loss');
      await chart.scrollIntoViewIfNeeded();
      const bounds = await chart.locator('.u-over').boundingBox();
      if (!bounds) throw new Error('Application cursor surface missing.');
      for (let index = 0; index < 3; index++) {
        await page.mouse.move(5, 5);
        await page.evaluate(() => window.soupApplicationPerformance.arm('hover'));
        await page.mouse.move(
          bounds.x + bounds.width * [0.25, 0.5, 0.75][index],
          bounds.y + bounds.height * 0.5,
        );
        await page.waitForFunction(
          (count) => window.soupApplicationPerformance.hovers.length > count,
          index,
          { timeout: 30_000 },
        );
      }
      const metrics = await page.evaluate(() => ({
        firstRenderMs: window.soupApplicationPerformance.firstRenderMs,
        zooms: window.soupApplicationPerformance.zooms,
        hovers: window.soupApplicationPerformance.hovers,
        longTasks: window.soupApplicationPerformance.longTasks,
      }));
      if ([...metrics.zooms, ...metrics.hovers].some((action) => !action.isTrusted))
        throw new Error('Application input was not trusted.');
      let traceSummary = null;
      if (recordTrace) {
        await page.screenshot({
          path: resolve(outputDirectory, 'application.png'),
          fullPage: true,
        });
        traceSummary = await stopTrace(
          pageSession,
          resolve(outputDirectory, 'application.trace.json'),
        );
      }
      const domainEvidence = await page.evaluate(() =>
        [...document.querySelectorAll('.metric-chart__interactive')].every((chart) =>
          chart.hasAttribute('data-x-min'),
        )
          ? 'actual uPlot draw-hook domains'
          : 'URL span-matched source count, populated canvases and two animation frames',
      );
      const row = {
        iteration,
        browserVersion: browser.version(),
        ...metrics,
        memoryAtOverview,
        domainEvidence,
        traceFile: recordTrace ? 'application.trace.json' : null,
        traceSummary,
      };
      applicationRuns.push(row);
      console.log(
        JSON.stringify({
          application: iteration,
          renderMs: metrics.firstRenderMs,
          zoomMs: metrics.zooms.map((value) => value.durationMs),
          hoverMs: metrics.hovers.map((value) => value.durationMs),
          bytes: memoryAtOverview.combinedV8HeapAndBackingStorageBytes,
        }),
      );
      await writeFile(
        resolve(outputDirectory, 'results.partial.json'),
        JSON.stringify({ build, fixtureRuns, applicationRuns }, null, 2),
      );
    } finally {
      await browser.close();
    }
  }
  // MemoryInfra runs happen in separate fresh browsers after timings, so a
  // global dump cannot inflate the measured input or first-render spans.
  for (const mode of [...modes, 'application']) {
    const browser = await chromium.launch({ headless: true, executablePath });
    try {
      const { page, pageSession, browserSession } = await preparePage(browser, {
        width: mode === 'application' ? 1440 : 1100,
        height: 1000,
      });
      await page.goto(
        mode === 'application'
          ? `${baseURL}/#/runs/run-001`
          : `${baseURL}/benchmark.html?mode=${mode}`,
        { waitUntil: 'domcontentloaded' },
      );
      await page.waitForFunction(
        (application) =>
          application
            ? document.querySelector('[data-run-id="run-001"][data-ready="true"]') &&
              document.querySelectorAll('.metric-chart canvas').length === 3
            : window.soupBenchmark?.ready === true,
        mode === 'application',
      );
      const v8AndRss = await memorySnapshot(browserSession, pageSession);
      await pageSession.send('Tracing.start', {
        categories: 'disabled-by-default-memory-infra,disabled-by-default-devtools.timeline',
        transferMode: 'ReturnAsStream',
      });
      const dump = await pageSession.send('Tracing.requestMemoryDump', {
        levelOfDetail: 'light',
        deterministic: true,
      });
      if (!dump.success) throw new Error(`MemoryInfra dump failed for ${mode}.`);
      const traceFile = `${mode}.memory.trace.json`;
      const metadata = await stopTrace(pageSession, resolve(outputDirectory, traceFile));
      const frames = metadata.frameProcesses.filter(
        (frame) =>
          frame.isOutermostMainFrame &&
          frame.isInPrimaryMainFrame &&
          frame.url.startsWith(new URL(baseURL).origin),
      );
      const frameIds = new Set(frames.map((frame) => frame.frame));
      const workers = metadata.workerProcesses.filter(
        (worker) => frameIds.has(worker.frame) && worker.url.includes('data.worker'),
      );
      if (frames.length !== 1)
        throw new Error(`Cannot attribute exactly one application frame in ${mode} dump.`);
      if ((mode === 'application' || mode === 'optimized') && workers.length !== 1)
        throw new Error(`Cannot attribute the data worker in ${mode} dump.`);
      const processIds = [
        ...new Set([
          ...frames.map((frame) => frame.processId),
          ...workers.map((worker) => worker.pid),
        ]),
      ];
      const privateByPid = new Map(
        metadata.processPrivateFootprints.map((entry) => [entry.pid, entry.bytes]),
      );
      if (processIds.some((pid) => !privateByPid.has(pid)))
        throw new Error(`Attributed renderer footprint is missing for ${mode}.`);
      const { stdout } = await run('ps', ['-o', 'rss=', '-p', processIds.join(',')]);
      const attributedRendererRssBytes =
        stdout
          .trim()
          .split(/\s+/u)
          .map(Number)
          .reduce((sum, value) => sum + value, 0) * 1024;
      const row = {
        mode,
        traceFile,
        dump,
        frameProcesses: frames,
        workerProcesses: workers,
        attributedProcessIds: processIds,
        attributedRendererPrivateFootprintBytes: processIds.reduce(
          (sum, pid) => sum + privateByPid.get(pid),
          0,
        ),
        attributedRendererRssBytes,
        v8AndRss,
        scope:
          'Single observed overview in a fresh browser. Main frame and data worker are attributed through actual trace frame/worker metadata; PIDs are deduplicated. MemoryInfra process_totals.private_footprint_bytes is summed only for those renderer processes. Spare renderers, browser, GPU and utility processes are excluded. This is stronger renderer-private footprint attribution, not a claim to account for all shared browser/GPU resources or every byte a Task Manager might assign to a tab.',
      };
      attributedMemory.push(row);
      console.log(
        JSON.stringify({
          attributedMemory: mode,
          privateBytes: row.attributedRendererPrivateFootprintBytes,
          rssBytes: attributedRendererRssBytes,
          pids: processIds,
        }),
      );
      await writeFile(
        resolve(outputDirectory, 'results.partial.json'),
        JSON.stringify({ build, fixtureRuns, applicationRuns, attributedMemory }, null, 2),
      );
    } finally {
      await browser.close();
    }
  }
} catch (error) {
  await writeFile(
    resolve(outputDirectory, 'failure.json'),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        error: String(error),
        build,
        fixtureRuns,
        applicationRuns,
        attributedMemory,
      },
      null,
      2,
    ),
  );
  throw error;
}
const quantile = (values, fraction) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)] ?? null;
};
const distribution = (values) => ({
  count: values.length,
  median: quantile(values, 0.5),
  nearestRankP95: quantile(values, 0.95),
  minimum: Math.min(...values),
  maximum: Math.max(...values),
  values,
});
const fixtureSummary = Object.fromEntries(
  modes.map((mode) => {
    const selected = fixtureRuns.filter((value) => value.mode === mode);
    return [
      mode,
      {
        firstRenderMs: distribution(selected.map((value) => value.firstRenderMs)),
        dataPreparationMs: distribution(selected.map((value) => value.dataPreparationMs)),
        zoomMs: distribution(selected.map((value) => value.zoom.durationMs)),
        hoverMs: distribution(
          selected.flatMap((value) => value.hovers.map((hover) => hover.durationMs)),
        ),
        v8AndBackingStorageBytes: distribution(
          selected.map((value) => value.memoryAtOverview.combinedV8HeapAndBackingStorageBytes),
        ),
        rendererRssBytes: distribution(
          selected
            .map((value) => value.memoryAtOverview.rendererRssBytes)
            .filter((value) => value !== null),
        ),
        retainedLossEntries: selected[0].renderedPoints,
      },
    ];
  }),
);
const applicationSummary = {
  firstRenderMs: distribution(applicationRuns.map((value) => value.firstRenderMs)),
  zoomMs: distribution(
    applicationRuns.flatMap((value) => value.zooms.map((action) => action.durationMs)),
  ),
  hoverMs: distribution(
    applicationRuns.flatMap((value) => value.hovers.map((action) => action.durationMs)),
  ),
  v8AndBackingStorageBytes: distribution(
    applicationRuns.map((value) => value.memoryAtOverview.combinedV8HeapAndBackingStorageBytes),
  ),
  rendererRssBytes: distribution(
    applicationRuns
      .map((value) => value.memoryAtOverview.rendererRssBytes)
      .filter((value) => value !== null),
  ),
};
const result = {
  generatedAt: new Date().toISOString(),
  browser: fixtureRuns[0]?.browserVersion ?? applicationRuns[0]?.browserVersion,
  machine: `${process.platform}/${process.arch}`,
  build,
  repetitions,
  fixtureModes: modes,
  cpuThrottle: 4,
  cpuScope,
  memoryScope,
  fixtureScope:
    'Controlled 900px uPlot loss plot. Baseline retains 32 MB canonical data and renders one million copied values; sampled-main retains the same canonical source and samples loss on the x4 main thread; optimized uses the actual worker API returning all three metric viewports on a normally scheduled worker. All use the same deterministic million-point source and observed 9.4 spike. Synthetic benchmark.hover is not used: actual trusted CDP mouse events are timed in-page.',
  applicationScope: `Actual production React route, all three metrics at 1440x1000. First render: navigation start to all three actual drawn domains, no update overlays and fonts loaded plus two animation frames. Zoom: actual capture-phase trusted click to URL/new domain + no update overlays + two animation frames. Hover: actual trusted mousemove to changed tooltip + settled + two animation frames. Playwright transport is outside measured input spans. ${repetitions} cold-browser samples and ${repetitions * 3} zoom/hover observations are a small bounded sample, not an SLA; reported nearest-rankP95 is descriptive, not a stable population tail.`,
  traceScope:
    'The first repetition per fixture mode/application is traced; subsequent repetitions omit tracing overhead and remain labeled by traceFile:null. The representative trace and numeric observations must not be treated as identical instrumentation. All modes use this same schedule; all repetitions retain raw numeric observations. Warm file/network cache and artificial localhost do not model deployment latency. Old evidence/performance remains unchanged.',
  fixtureSummary,
  applicationSummary,
  fixtureRuns,
  applicationRuns,
  attributedMemory,
};
await writeFile(resolve(outputDirectory, 'results.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ fixtureSummary, applicationSummary, outputDirectory }, null, 2));
