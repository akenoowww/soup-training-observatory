import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { waitRenderedViewport } from './support/chart-assertions';

async function openRun(page: Page, id = 'run-001', query = '') {
  await page.goto(`/#/runs/${id}${query}`);
  await expect(page.locator(`[data-run-id="${id}"]`)).toHaveAttribute('data-ready', 'true');
  await expect(page.getByTestId('chart-loss')).toBeVisible();
}
async function assertSpikeActuallyDrawn(page: Page) {
  // Inspect rendered pixels, independently of the sampler's reported max. The spike
  // must place mint line pixels high in the central half of the loss canvas;
  // normal loss values remain below 2.9, so they cannot satisfy this check.
  await expect(page.getByTestId('chart-loss').locator('canvas').first()).toBeVisible();
  const counts = await page
    .getByTestId('chart-loss')
    .locator('canvas')
    .evaluateAll((canvases) => {
      return canvases.map((node) => {
        const canvas = node as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        if (!context) return 0;
        const { width, height } = canvas;
        const pixels = context.getImageData(0, 0, width, height).data;
        let count = 0;
        for (let y = Math.floor(height * 0.03); y < height * 0.45; y++) {
          for (let x = Math.floor(width * 0.35); x < width * 0.7; x++) {
            const offset = (y * width + x) * 4;
            if (
              pixels[offset]! > 55 &&
              pixels[offset]! < 155 &&
              pixels[offset + 1]! > 150 &&
              pixels[offset + 2]! > 105 &&
              pixels[offset + 2]! < 205 &&
              pixels[offset + 3]! > 100
            )
              count++;
          }
        }
        return count;
      });
    });
  expect(Math.max(...counts)).toBeGreaterThan(20);
}

test('run browser filters, searches, sorts, persists URL state, and recovers from empty results', async ({
  page,
}) => {
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  await page.getByRole('button', { name: 'Failed', exact: true }).click();
  await expect(page.locator('.runs-table tbody tr')).toHaveCount(3);
  await expect(page).toHaveURL(/status=failed/);
  await page.getByRole('textbox', { name: 'Search runs', exact: true }).fill('not-a-real-run');
  await expect(page.getByRole('heading', { name: 'No runs in this view' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  await page.getByRole('combobox', { name: 'Sort runs' }).selectOption('name');
  await expect(page.locator('.runs-table tbody tr').first()).toContainText('bert-base-sentiment');
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Sort runs' })).toHaveValue('name');
  await page.getByRole('combobox', { name: 'Sort runs' }).selectOption('loss');
  const losses = await page.locator('.runs-table tbody tr td:nth-child(3)').allTextContents();
  const numeric = losses.map((text) => Number(text.replaceAll(',', '')));
  expect(numeric).toEqual([...numeric].sort((a, b) => a - b));
});

test('million-point spike remains painted in overview, narrow zoom and reset', async ({ page }) => {
  await openRun(page);
  await expect(page.getByText('Synthetic data', { exact: true })).toBeVisible();
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  await assertSpikeActuallyDrawn(page);
  await page.getByRole('button', { name: 'Inspect spike' }).click();
  await waitRenderedViewport(page, 490000, 510000);
  await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('490000');
  await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue('510000');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '20001');
  await assertSpikeActuallyDrawn(page);
  await page.getByRole('spinbutton', { name: 'Start step' }).fill('499999');
  await page.getByRole('spinbutton', { name: 'End step' }).fill('500001');
  await page.getByRole('button', { name: 'Apply range' }).click();
  await waitRenderedViewport(page, 499999, 500001);
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  await assertSpikeActuallyDrawn(page);
  await page.getByRole('button', { name: 'Reset zoom', exact: true }).click();
  await waitRenderedViewport(page, 0, 999999);
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
  await assertSpikeActuallyDrawn(page);
});

test('non-finite values produce visible disclosure and exact missing-value inspection', async ({
  page,
}) => {
  await openRun(page, 'run-003', '?min=4199&max=4211');
  await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
  const chart = page.getByTestId('chart-loss');
  await chart.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
    'Missing / excluded',
  );
  await page.locator('.metric-chart--loss summary').click();
  await expect(
    page.getByRole('table', { name: 'Plotted training loss values', exact: true }),
  ).toContainText('Missing / excluded');
  await page.getByRole('tab', { name: /Data quality/ }).click();
  await expect(page.getByRole('tabpanel')).toContainText(
    'Non-finite loss measurements are shown as gaps, never as zero.',
  );
  await expect(page.getByRole('tabpanel')).toContainText('11 affected');
});

test('duplicate, unordered and missing-step observations remain discoverable', async ({ page }) => {
  for (const [id, expected] of [
    ['run-005', 'Out-of-order measurements were sorted by numeric step.'],
    ['run-006', 'Duplicate steps use the last received measurement.'],
    ['run-007', 'Missing steps break the line; values are not interpolated.'],
  ]) {
    await openRun(page, id);
    await page.getByRole('tab', { name: /Data quality/ }).click();
    await expect(page.getByRole('tabpanel')).toContainText(expected);
  }
});

test('log scale discloses zero exclusions and linear restores the measured zero', async ({
  page,
}) => {
  await openRun(page, 'run-008', '?min=595&max=610');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', '0');
  await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
  await expect(page.locator('.metric-chart--loss')).toContainText(/plotted zero or negative/);
  await expect(page.locator('.metric-chart--loss')).toContainText('excluded from the log scale');
  await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('linear');
  await expect(page.locator('.metric-chart--loss .metric-chart__warning')).toHaveCount(0);
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', '0');
});

test('rapid run switching never paints previous run measurements under the next run title', async ({
  page,
}) => {
  await page.goto('/#/runs/run-001');
  await expect(page.getByRole('heading', { name: 'llama-3.1-8b-finetune' })).toBeVisible();
  await page.getByRole('button', { name: 'Next run', exact: true }).click();
  await page.getByRole('button', { name: 'Next run', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  await expect(page.locator('[data-run-id="run-003"]')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  const max = Number(await page.getByTestId('chart-loss').getAttribute('data-max-value'));
  expect(max).toBeLessThan(4);
  await expect(page.locator('.metric-chart--loss')).toContainText('non-finite');
});

test('keyboard search opens a run and chart keyboard inspection reveals measured values', async ({
  page,
}) => {
  await page.goto('/#/');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('textbox', { name: 'Find a training run' }).fill('whisper');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await page.getByTestId('chart-loss').focus();
  await page.keyboard.press('Home');
  await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
    'Sampled step 0',
  );
  await page.keyboard.press('End');
  await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('21,599');
});

test('export identifies a sampled viewport and retains spike numeric value', async ({ page }) => {
  await openRun(page, 'run-001', '?min=499999&max=500001');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export view' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('run-001-sampled-viewport.csv');
  const path = await download.path();
  expect(path).not.toBeNull();
  const csv = await readFile(path!, 'utf8');
  expect(csv).toContain('metric,step,value');
  expect(csv).toContain('loss,500000,9.4');
  await expect(
    page.getByRole('status').filter({ hasText: 'Sampled viewport exported.' }),
  ).toBeVisible();
});

test('mobile layout fits viewport and navigation remains reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Field guide' }).click();
  await expect(page.getByRole('heading', { name: 'Look closer. Keep the signal.' })).toBeVisible();
  await openRun(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByTestId('chart-loss')).toBeVisible();
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await waitRenderedViewport(page, 999999 / 4, (999999 * 3) / 4);
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
});

test('unknown run fails clearly with a working recovery route', async ({ page }) => {
  await page.goto('/#/runs/does-not-exist');
  await expect(page.getByRole('heading', { name: 'Run not found' })).toBeVisible();
  await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  await page.getByRole('link', { name: 'Back to training runs' }).click();
  await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
});

test('a worker failure never substitutes fabricated values and has a working retry path', async ({
  page,
}) => {
  await page.route(/data\.worker-[^/]+\.js(?:\?.*)?$/, (route) => route.abort('failed'));
  await page.goto('/#/runs/run-001');
  await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  await page.unroute(/data\.worker-[^/]+\.js(?:\?.*)?$/);
  await page.getByRole('button', { name: 'Try again', exact: false }).click();
  await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
});

test('an entirely invalid viewport shows unavailable values and never fabricates a zero curve', async ({
  page,
}) => {
  await openRun(page, 'run-003', '?min=4200&max=4210');
  await expect(page.locator('.metric-chart--loss')).toContainText('No finite values in this range');
  await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', 'missing');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', 'missing');
  await page.locator('.metric-chart--loss summary').click();
  await expect(
    page.getByRole('table', { name: 'Plotted training loss values', exact: true }).locator('tbody'),
  ).toContainText('Missing / excluded');
});

test('initial worker loading exposes a reserved loading view before any chart is drawn', async ({
  page,
}) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/data\.worker-[^/]+\.js(?:\?.*)?$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/#/runs/run-001');
  await expect(page.getByRole('status', { name: 'Loading run metrics' })).toBeVisible();
  await expect(page.getByText('Preparing training metrics…', { exact: true })).toBeVisible();
  await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  release();
  await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
});
