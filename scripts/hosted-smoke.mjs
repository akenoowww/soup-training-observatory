/* global document, requestAnimationFrame */
import { chromium, firefox, webkit, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const base = new URL(process.argv[2] ?? 'https://akenoowww.github.io/soup-training-observatory/');
if (base.protocol !== 'https:') throw new Error('Hosted smoke requires an explicit HTTPS site.');
base.hash = '';
base.search = '';
if (!base.pathname.endsWith('/')) base.pathname += '/';
const stamp = new Date().toISOString().replaceAll(/[:.]/gu, '-');
const directory = resolve(process.argv[3] ?? join('evidence/hosted', stamp));
await mkdir(directory, { recursive: true });
const appUrl = (route = '/') => new URL(`#${route}`, base).href;
const rows = [];

function assertSitePrefix(url) {
  const parsed = new URL(url);
  expect(parsed.origin).toBe(base.origin);
  expect(parsed.pathname).toBe(base.pathname);
}
async function frames(page) {
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
}
async function viewport(page, min, max) {
  await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue(String(min));
  await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue(String(max));
  for (const metric of ['loss', 'lr', 'grad_norm']) {
    await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-min', String(min));
    await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-max', String(max));
  }
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await frames(page);
}
async function openRun(page, id, min, max) {
  const suffix = min === undefined ? '' : `?min=${min}&max=${max}`;
  await page.goto(appUrl(`/runs/${id}${suffix}`), { waitUntil: 'domcontentloaded' });
  assertSitePrefix(page.url());
  if (min === undefined) await viewport(page, 0, 999999);
  else await viewport(page, min, max);
  await page.evaluate(() => document.fonts.ready);
}
async function spikePixels(page) {
  const values = await page
    .getByTestId('chart-loss')
    .locator('canvas')
    .evaluateAll((canvases) =>
      canvases.map((canvas) => {
        const { width, height } = canvas;
        const pixels = canvas.getContext('2d').getImageData(0, 0, width, height).data;
        let count = 0;
        for (let y = Math.floor(height * 0.03); y < height * 0.45; y++) {
          for (let x = Math.floor(width * 0.35); x < width * 0.7; x++) {
            const offset = (y * width + x) * 4;
            if (
              pixels[offset] > 55 &&
              pixels[offset] < 155 &&
              pixels[offset + 1] > 150 &&
              pixels[offset + 2] > 105 &&
              pixels[offset + 2] < 205 &&
              pixels[offset + 3] > 100
            )
              count++;
          }
        }
        return count;
      }),
    );
  expect(Math.max(...values)).toBeGreaterThan(20);
  return Math.max(...values);
}
async function lossInk(page, bands) {
  return page.getByTestId('chart-loss').evaluate((chart, selectedBands) => {
    const canvas = chart.querySelector('canvas');
    const over = chart.querySelector('.u-over');
    const canvasRect = canvas.getBoundingClientRect();
    const plot = over.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    const left = (plot.left - canvasRect.left) * scaleX;
    const top = (plot.top - canvasRect.top) * scaleY;
    const width = plot.width * scaleX;
    const height = plot.height * scaleY;
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    return selectedBands.map(([start, end]) => {
      let count = 0;
      for (
        let y = Math.max(0, Math.floor(top));
        y < Math.min(canvas.height, Math.ceil(top + height));
        y++
      ) {
        for (
          let x = Math.max(0, Math.floor(left + start * width));
          x < Math.min(canvas.width, Math.ceil(left + end * width));
          x++
        ) {
          const offset = (y * canvas.width + x) * 4;
          if (
            pixels[offset] >= 55 &&
            pixels[offset] <= 155 &&
            pixels[offset + 1] >= 150 &&
            pixels[offset + 2] >= 105 &&
            pixels[offset + 2] <= 205 &&
            pixels[offset + 3] > 100
          )
            count++;
        }
      }
      return count;
    });
  }, bands);
}
async function publicBundle(context, url) {
  const parsed = new URL(url);
  expect(parsed.origin).toBe(base.origin);
  expect(parsed.pathname.startsWith(base.pathname)).toBe(true);
  const response = await context.request.get(url);
  expect(response.status()).toBe(200);
  const headers = response.headers();
  expect(headers['content-type']).toMatch(/javascript/iu);
  const body = await response.body();
  return {
    url,
    status: response.status(),
    contentType: headers['content-type'],
    cacheControl: headers['cache-control'] ?? null,
    etag: headers.etag ?? null,
    sha256: createHash('sha256').update(body).digest('hex'),
    bytes: body.length,
  };
}

for (const [engine, browserType] of [
  ['chromium', chromium],
  ['firefox', firefox],
  ['webkit', webkit],
]) {
  const result = {
    engine,
    baseUrl: base.href,
    checks: [],
    http: [],
    requestFailures: [],
    pageErrors: [],
    bundles: [],
    screenshots: {},
    error: null,
  };
  let browser;
  let page;
  let recording = true;
  try {
    const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const launchOptions =
      engine === 'chromium' && existsSync(localChrome) ? { executablePath: localChrome } : {};
    browser = await browserType.launch({ headless: true, ...launchOptions });
    result.browserVersion = browser.version();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      locale: 'en-US',
      timezoneId: 'UTC',
      reducedMotion: 'reduce',
      acceptDownloads: true,
    });
    context.on('response', (response) => {
      if (!recording) return;
      const url = new URL(response.url());
      if (url.origin !== base.origin || url.protocol !== base.protocol) return;
      const headers = response.headers();
      result.http.push({
        url: url.href,
        status: response.status(),
        resourceType: response.request().resourceType(),
        underRepositoryPrefix: url.pathname.startsWith(base.pathname),
        contentType: headers['content-type'] ?? null,
        cacheControl: headers['cache-control'] ?? null,
        etag: headers.etag ?? null,
        lastModified: headers['last-modified'] ?? null,
        server: headers.server ?? null,
      });
    });
    context.on('requestfailed', (request) => {
      const url = new URL(request.url());
      if (recording && url.origin === base.origin && url.protocol === base.protocol) {
        result.requestFailures.push({ url: request.url(), error: request.failure()?.errorText });
      }
    });
    page = await context.newPage();
    page.setDefaultTimeout(15_000);
    page.on('pageerror', (error) => result.pageErrors.push(error.message));
    const documentResponse = await page.goto(appUrl(), { waitUntil: 'domcontentloaded' });
    expect(documentResponse?.status()).toBe(200);
    expect(documentResponse?.headers()['content-type']).toMatch(/text\/html/iu);
    await expect(
      page.getByRole('heading', { name: 'Every run. A clearer picture.' }),
    ).toBeVisible();
    await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
    assertSitePrefix(page.url());
    await page.evaluate(() => document.fonts.ready);
    result.checks.push('repository-prefix document loads with20 runs');
    await page.getByRole('button', { name: 'Failed', exact: true }).click();
    await expect(page.locator('.runs-table tbody tr')).toHaveCount(3);
    await page.getByRole('textbox', { name: 'Search runs', exact: true }).fill('not-a-run');
    await expect(page.getByRole('heading', { name: 'No runs in this view' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
    assertSitePrefix(page.url());
    result.checks.push('filter, empty state and clear-filter recovery');

    await openRun(page, 'run-001');
    await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
    result.overviewSpikePixels = await spikePixels(page);
    result.checks.push('real module worker prepares1M points and overview spike is painted');
    const scripts = await page
      .locator('script[type="module"][src]')
      .evaluateAll((nodes) => nodes.map((node) => node.src));
    for (const url of scripts) result.bundles.push(await publicBundle(context, url));
    result.screenshots.desktop = `${engine}-desktop.png`;
    await page.screenshot({ path: join(directory, result.screenshots.desktop), fullPage: true });
    await page.getByRole('button', { name: 'Inspect spike', exact: true }).click();
    await viewport(page, 490000, 510000);
    await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '20001');
    result.zoomSpikePixels = await spikePixels(page);
    const downloading = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export view', exact: true }).click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe('run-001-sampled-viewport.csv');
    const csv = await readFile(await download.path(), 'utf8');
    expect(csv).toContain('loss,500000,9.4');
    await writeFile(join(directory, `${engine}-sampled-viewport.csv`), csv);
    result.checks.push('shared actual490000..510000 viewport and sampled CSV preserve9.4');

    await openRun(page, 'run-003', 4195, 4215);
    await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
    const gapInk = await lossInk(page, [
      [0.03, 0.18],
      [0.3, 0.7],
      [0.82, 0.97],
    ]);
    expect(gapInk[0]).toBeGreaterThan(10);
    expect(gapInk[1]).toBe(0);
    expect(gapInk[2]).toBeGreaterThan(10);
    result.nanGapPixels = gapInk;
    await openRun(page, 'run-003', 4200, 4210);
    await expect(page.locator('.metric-chart--loss')).toContainText(
      'No finite values in this range',
    );
    await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
    result.checks.push('NaN is an actual pixel gap; all-invalid range remains unavailable');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.getByRole('link', { name: 'Field guide', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Look closer. Keep the signal.' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
    assertSitePrefix(page.url());
    await openRun(page, 'run-001');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
    result.screenshots.mobile = `${engine}-mobile.png`;
    await page.screenshot({ path: join(directory, result.screenshots.mobile), fullPage: true });
    result.checks.push('390px navigation, guide, run and document width');

    await page.goto(appUrl('/runs/not-a-run'), { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Run not found' })).toBeVisible();
    await expect(page.getByTestId('chart-loss')).toHaveCount(0);
    await page.getByRole('link', { name: 'Back to training runs', exact: true }).click();
    await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
    assertSitePrefix(page.url());
    result.checks.push('unknown-run recovery keeps the repository prefix');

    const workers = result.http.filter((entry) => /data\.worker-[^/]+\.js/iu.test(entry.url));
    const fonts = result.http.filter((entry) => /\.woff2?(?:\?|$)/iu.test(entry.url));
    const assets = result.http.filter(
      (entry) =>
        ['script', 'stylesheet', 'font'].includes(entry.resourceType) ||
        /data\.worker-[^/]+\.js/iu.test(entry.url),
    );
    expect(workers.length).toBeGreaterThan(0);
    expect(fonts.length).toBeGreaterThan(0);
    expect(result.http.filter((entry) => entry.status >= 400)).toEqual([]);
    expect(assets.every((entry) => entry.underRepositoryPrefix)).toBe(true);
    expect(result.requestFailures).toEqual([]);
    expect(result.pageErrors).toEqual([]);
    for (const worker of new Map(workers.map((entry) => [entry.url, entry])).values())
      result.bundles.push(await publicBundle(context, worker.url));
    result.checks.push(
      'public assets, self-hosted fonts and module worker succeed without4xx, failed requests or page errors',
    );
    result.status = 'pass';
  } catch (error) {
    result.status = 'fail';
    result.error = error instanceof Error ? error.message : String(error);
    if (page && !page.isClosed()) {
      await page
        .screenshot({ path: join(directory, `${engine}-failure.png`), fullPage: true })
        .catch(() => {});
    }
  } finally {
    recording = false;
    if (browser) await browser.close();
    rows.push(result);
    await writeFile(join(directory, `${engine}.json`), JSON.stringify(result, null, 2));
    console.log(
      JSON.stringify({
        engine,
        status: result.status,
        checks: result.checks.length,
        error: result.error,
      }),
    );
  }
}
const report = {
  observedAt: new Date().toISOString(),
  baseUrl: base.href,
  outputDirectory: directory,
  scope:
    'Hosted functional/CDN/base-path smoke in fresh anonymous browser contexts. These observations do not establish uptime, physical-device usability, real training integration, or performance comparable with local CPU-throttled traces.',
  pass: rows.every((row) => row.status === 'pass'),
  engines: rows,
};
await writeFile(join(directory, 'results.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass: report.pass, report: join(directory, 'results.json') }));
if (!report.pass) process.exitCode = 1;
