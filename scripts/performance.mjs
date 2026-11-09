/* global clearTimeout, window, document, requestAnimationFrame, performance, URLSearchParams, location */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';

const baseURL = process.argv[2] ?? 'http://127.0.0.1:4173';
const outputDirectory = resolve('evidence/performance');
const repetitions = Math.max(1, Number(process.argv[3] ?? 3));
const run = promisify(execFile);
await mkdir(outputDirectory, { recursive: true });

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
  const complete = new Promise(resolveTrace => session.once('Tracing.tracingComplete', resolveTrace));
  await session.send('Tracing.end');
  const result = await complete;
  if (!result.stream) throw new Error('Chrome did not return a trace stream.');
  await writeFile(target, await readStream(session, result.stream));
}
async function workerHeap(browserSession) {
  const { targetInfos } = await browserSession.send('Target.getTargets');
  const heaps = [];
  for (const target of targetInfos.filter(info => info.type === 'worker' && info.url.includes('data.worker'))) {
    const { sessionId } = await browserSession.send('Target.attachToTarget', { targetId: target.targetId, flatten: false });
    const id = Math.floor(Math.random() * 1_000_000) + 1;
    let timeout;
    const response = new Promise((resolveResponse, reject) => {
      const listener = event => {
        if (event.sessionId !== sessionId) return;
        const message = JSON.parse(event.message);
        if (message.id !== id) return;
        clearTimeout(timeout);
        browserSession.off('Target.receivedMessageFromTarget', listener);
        if (message.error) reject(new Error(message.error.message));
        else resolveResponse(message.result);
      };
      browserSession.on('Target.receivedMessageFromTarget', listener);
      timeout = setTimeout(() => { browserSession.off('Target.receivedMessageFromTarget', listener); reject(new Error('Worker heap request timed out.')); }, 5_000);
    });
    await browserSession.send('Target.sendMessageToTarget', { sessionId, message: JSON.stringify({ id, method: 'Runtime.getHeapUsage', params: {} }) });
    try { heaps.push({ url: target.url, ...await response }); }
    finally { await browserSession.send('Target.detachFromTarget', { sessionId }); }
  }
  return heaps;
}
async function memorySnapshot(browserSession, pageSession) {
  await pageSession.send('HeapProfiler.collectGarbage');
  const main = await pageSession.send('Runtime.getHeapUsage');
  let workers = [], workerError = null;
  try { workers = await workerHeap(browserSession); } catch (error) { workerError = String(error); }
  const { metrics } = await pageSession.send('Performance.getMetrics');
  const { processInfo } = await browserSession.send('SystemInfo.getProcessInfo');
  const rendererIds = processInfo.filter(info => info.type === 'renderer').map(info => info.id);
  let rendererRssBytes = null, rendererMemoryError = null;
  if (process.platform === 'darwin' || process.platform === 'linux') {
    try {
      const { stdout } = await run('ps', ['-o', 'rss=', '-p', rendererIds.join(',')]);
      rendererRssBytes = stdout.trim().split(/\s+/u).map(Number).filter(Number.isFinite).reduce((sum, value) => sum + value, 0) * 1024;
    } catch (error) { rendererMemoryError = String(error); }
  }
  const contexts = [main, ...workers];
  return {
    mainThreadV8HeapUsedBytes: metrics.find(metric => metric.name === 'JSHeapUsedSize')?.value ?? main.usedSize,
    contexts,
    combinedV8HeapAndBackingStorageBytes: contexts.reduce((sum, context) => sum + context.usedSize + (context.backingStorageSize ?? 0), 0),
    rendererRssBytes, rendererCount: rendererIds.length, workerError, rendererMemoryError,
    scope: 'Renderer RSS is the sum of all renderer processes in a fresh isolated Chromium instance containing one page. It includes native/canvas memory and worker renderers but may include spare-renderer overhead; it is an approximation of tab footprint. V8+backing storage includes measured page and worker contexts, excludes native/GPU allocations. Browser/GPU/utility processes are excluded.',
  };
}
const runs = [];
for (const mode of ['baseline', 'optimized']) {
  for (let iteration = 0; iteration < repetitions; iteration++) {
    const defaultExecutable = chromium.executablePath();
    const executablePath = existsSync(defaultExecutable) ? defaultExecutable : ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(candidate => existsSync(candidate)) ?? defaultExecutable;
    const browser = await chromium.launch({ headless: true, executablePath });
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 850 }, deviceScaleFactor: 1 });
      const pageSession = await page.context().newCDPSession(page);
      const browserSession = await browser.newBrowserCDPSession();
      await pageSession.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await pageSession.send('Performance.enable');
      const tracePath = resolve(outputDirectory, `${mode}-${iteration + 1}.trace.json`);
      await pageSession.send('Tracing.start', {
        categories: 'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing,v8,disabled-by-default-v8.cpu_profiler,disabled-by-default-devtools.screenshot',
        transferMode: 'ReturnAsStream', options: 'sampling-frequency=1000',
      });
      await page.goto(`${baseURL}/benchmark.html?mode=${mode}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.soupBenchmark?.ready === true, undefined, { timeout: 90_000 });
      const first = await page.evaluate(() => window.soupBenchmark.results);
      const memoryAtOverview = await memorySnapshot(browserSession, pageSession);
      const zoom = await page.evaluate(() => window.soupBenchmark.zoom());
      const hovers = [];
      for (const fraction of [0.4, 0.5, 0.6]) hovers.push(await page.evaluate(value => window.soupBenchmark.hover(value), fraction));
      if (iteration === 0) await page.screenshot({ path: resolve(outputDirectory, `${mode}.png`), fullPage: true });
      await stopTrace(pageSession, tracePath);
      const row = { mode, iteration: iteration + 1, browserVersion: browser.version(), executable: executablePath.split('/').at(-1), ...first, zoom, hovers, memoryAtOverview, traceFile: tracePath.split('/').at(-1) };
      runs.push(row);
      console.log(JSON.stringify({ mode, iteration: iteration + 1, firstRenderMs: first.firstRenderMs, zoomMs: zoom.durationMs, hoverMs: hovers.map(value => value.durationMs), rendererRssMB: memoryAtOverview.rendererRssBytes === null ? null : memoryAtOverview.rendererRssBytes / 1024 / 1024, renderedPoints: first.renderedPoints }));
      await writeFile(resolve(outputDirectory, 'results.partial.json'), JSON.stringify({ runs }, null, 2));
    } finally { await browser.close(); }
  }
}
// Capture the real React route separately; never relabel the fixture as app proof.
let actualApplication;
{
  const defaultExecutable = chromium.executablePath();
  const executablePath = existsSync(defaultExecutable) ? defaultExecutable : ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(candidate => existsSync(candidate)) ?? defaultExecutable;
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const pageSession = await page.context().newCDPSession(page);
    const browserSession = await browser.newBrowserCDPSession();
    await pageSession.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await pageSession.send('Performance.enable');
    await pageSession.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing,v8,disabled-by-default-v8.cpu_profiler,disabled-by-default-devtools.screenshot', transferMode: 'ReturnAsStream' });
    await page.goto(`${baseURL}/#/runs/run-001`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('[data-run-id="run-001"][data-ready="true"]') && document.querySelectorAll('.metric-chart canvas').length === 3, undefined, { timeout: 90_000 });
    const firstRenderMs = await page.evaluate(() => new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(() => { performance.mark('soup:app:first-painted'); resolveFrame(performance.now()); }))));
    const memoryAtOverview = await memorySnapshot(browserSession, pageSession);
    await page.evaluate(() => { performance.mark('soup:app:zoom-start'); });
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-ready="true"]') && new URLSearchParams(location.hash.split('?')[1]).has('min') && Number(document.querySelector('[data-testid="chart-loss"]')?.getAttribute('data-source-points')) < 1_000_000);
    const zoomMs = await page.evaluate(() => new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(() => { const start = performance.getEntriesByName('soup:app:zoom-start').at(-1).startTime; performance.mark('soup:app:zoom-painted'); resolveFrame(performance.now() - start); }))));
    const chart = page.getByTestId('chart-loss');
    await chart.scrollIntoViewIfNeeded();
    const plotBounds = await chart.locator('.u-over').boundingBox();
    if (!plotBounds) throw new Error('The real application loss chart has no hover surface.');
    await page.evaluate(() => { performance.mark('soup:app:hover-start'); });
    await page.mouse.move(plotBounds.x + plotBounds.width * 0.5, plotBounds.y + plotBounds.height * 0.5);
    await chart.locator('.metric-chart__tooltip').waitFor({ state: 'visible' });
    const hoverMs = await page.evaluate(() => new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(() => { const start = performance.getEntriesByName('soup:app:hover-start').at(-1).startTime; performance.mark('soup:app:hover-painted'); resolveFrame(performance.now() - start); }))));
    await page.screenshot({ path: resolve(outputDirectory, 'application-optimized.png'), fullPage: true });
    await stopTrace(pageSession, resolve(outputDirectory, 'application-optimized.trace.json'));
    actualApplication = { firstRenderMs, zoomMs, hoverMs, memoryAtOverview, browserVersion: browser.version(), viewport: { width: 1440, height: 1000 }, scope: 'Actual production React route run-001 with all three metrics. User-action timings include Playwright click/mouse transport and two animation frames; compare separately from in-page fixture timings. One observed run, not a median or SLA.' };
    console.log(JSON.stringify({ actualApplication }));
  } finally { await browser.close(); }
}
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const summary = Object.fromEntries(['baseline', 'optimized'].map(mode => {
  const selected = runs.filter(value => value.mode === mode);
  return [mode, {
    firstRenderMedianMs: median(selected.map(value => value.firstRenderMs)),
    zoomMedianMs: median(selected.map(value => value.zoom.durationMs)),
    hoverMedianMs: median(selected.flatMap(value => value.hovers.map(hover => hover.durationMs))),
    rendererRssMedianBytes: median(selected.map(value => value.memoryAtOverview.rendererRssBytes).filter(value => value !== null)),
    v8AndBackingStorageMedianBytes: median(selected.map(value => value.memoryAtOverview.combinedV8HeapAndBackingStorageBytes)),
    plottedPoints: selected[0].renderedPoints,
  }];
}));
await writeFile(resolve(outputDirectory, 'results.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), cpuThrottle: 4, repetitions, viewport: { width: 1100, height: 850 },
  browser: `Headless ${runs[0]?.executable ?? 'Chromium'} ${runs[0]?.browserVersion ?? 'unknown'}`, cpuThrottleScope: 'Emulation.setCPUThrottlingRate(rate:4) applied to page target. Dedicated-worker scheduling is browser-defined; equivalent worker slowdown is not asserted. Worker generation is included in measured end-to-end latency.', machine: `${process.platform}/${process.arch}`, fixture: 'isolated same uPlot loss chart, run-001; baseline main-thread generation and 1M arrays; optimized actual data worker and extrema sampler; both keep canonical source measurements',
  timingScope: 'Navigation start through data preparation and two animation frames after chart construction; zoom includes actual viewport change (and worker resampling for optimized); hover is real mousemove handler to two animation frames. This is a controlled chart fixture, not React app initial render or real-cluster network latency.',
  memoryScope: runs[0]?.memoryAtOverview.scope,
  summary, actualApplication, runs,
}, null, 2));
console.log(JSON.stringify({ summary, evidence: outputDirectory }, null, 2));
