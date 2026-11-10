import { expect, test, type Page } from '@playwright/test';
import { canonicalize, sampleMetric } from '../../src/domain/series';
import { getRunDetail } from '../../src/data/engine';
import type { RunDetail } from '../../src/domain/types';

interface CanvasLabel {
  text: string;
  x: number;
  y: number;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
}

// Capture the actual text submitted to Canvas, not a production data attribute or
// a direct invocation of the formatter being tested. Drawing is forwarded intact.
async function captureAxisDrawing(page: Page) {
  await page.addInitScript(() => {
    const labels = new WeakMap<
      HTMLCanvasElement,
      { text: string; x: number; y: number; align: CanvasTextAlign; baseline: CanvasTextBaseline }[]
    >();
    Object.defineProperty(window, '__soupCanvasLabels', { value: labels });
    const originalText = CanvasRenderingContext2D.prototype.fillText;
    const originalClear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      const entries = labels.get(this.canvas) ?? [];
      entries.push({ text, x, y, align: this.textAlign, baseline: this.textBaseline });
      labels.set(this.canvas, entries);
      if (maxWidth === undefined) originalText.call(this, text, x, y);
      else originalText.call(this, text, x, y, maxWidth);
    };
    CanvasRenderingContext2D.prototype.clearRect = function (x, y, width, height) {
      if (x === 0 && y === 0 && width >= this.canvas.width && height >= this.canvas.height)
        labels.set(this.canvas, []);
      originalClear.call(this, x, y, width, height);
    };
  });
}
async function openRun(page: Page, id: string, min: number, max: number) {
  await page.goto(`/#/runs/${id}?min=${min}&max=${max}`);
  await expect(page.locator(`[data-run-id="${id}"]`)).toHaveAttribute('data-ready', 'true');
  await expect(page.getByTestId('chart-loss').locator('canvas')).toBeVisible();
  // The browser can publish React state just before its chart effects paint.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
async function labelsFor(page: Page, metric: string): Promise<CanvasLabel[]> {
  return page
    .getByTestId(`chart-${metric}`)
    .locator('canvas')
    .evaluate((canvas) => {
      const store = (
        window as unknown as { __soupCanvasLabels: WeakMap<HTMLCanvasElement, CanvasLabel[]> }
      ).__soupCanvasLabels;
      return store.get(canvas as HTMLCanvasElement) ?? [];
    });
}
function parseLabel(text: string) {
  const normalized = text.replaceAll(',', '');
  if (/k$/u.test(normalized)) return Number(normalized.slice(0, -1)) * 1_000;
  if (/m$/u.test(normalized)) return Number(normalized.slice(0, -1)) * 1_000_000;
  return Number(normalized);
}
async function greenInkInPlot(page: Page, bands: [number, number][]) {
  return page.getByTestId('chart-loss').evaluate((chart, horizontalBands) => {
    const canvas = chart.querySelector('canvas')!;
    const over = chart.querySelector('.u-over')!;
    const canvasRect = canvas.getBoundingClientRect();
    const plot = over.getBoundingClientRect();
    const sx = canvas.width / canvasRect.width;
    const sy = canvas.height / canvasRect.height;
    const left = (plot.left - canvasRect.left) * sx;
    const top = (plot.top - canvasRect.top) * sy;
    const width = plot.width * sx;
    const height = plot.height * sy;
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    return horizontalBands.map(([start, end]) => {
      let ink = 0;
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
            pixels[offset]! >= 55 &&
            pixels[offset]! <= 155 &&
            pixels[offset + 1]! >= 150 &&
            pixels[offset + 2]! >= 105 &&
            pixels[offset + 2]! <= 205 &&
            pixels[offset + 3]! > 100
          )
            ink++;
        }
      }
      return ink;
    });
  }, bands);
}

test('NaN interval is an actual unpainted gap with finite painted neighbours, not zero or interpolation', async ({
  page,
}) => {
  const bands: [number, number][] = [
    [0.03, 0.18],
    [0.3, 0.7],
    [0.82, 0.97],
  ];
  await openRun(page, 'run-003', 4195, 4215);
  await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
  const gap = await greenInkInPlot(page, bands);
  expect(gap[0], 'finite segment before NaN must actually be painted').toBeGreaterThan(10);
  expect(gap[1], 'the NaN interval must have no metric-coloured connecting/zero line').toBe(0);
  expect(gap[2], 'finite segment after NaN must actually be painted').toBeGreaterThan(10);
  // A finite control using the same x range verifies the scanner would detect a
  // connecting line in the region; an entirely blank/broken canvas cannot pass.
  await openRun(page, 'run-002', 4195, 4215);
  const control = await greenInkInPlot(page, bands);
  expect(control[1], 'the finite control must paint through the central interval').toBeGreaterThan(
    20,
  );
});

test('painted values align with actual numeric x/y axis labels for every metric', async ({
  page,
}) => {
  await captureAxisDrawing(page);
  await openRun(page, 'run-002', 100, 200);
  const step = 150;
  const t = step / 9699;
  // Independent arithmetic oracle for the published deterministic fixture. This
  // checks Canvas coordinate/axis/value agreement, not scientific model validity.
  const expected = {
    loss: Math.max(
      0.015,
      2.6 * Math.exp(-t * 5.2) +
        0.24 +
        0.014 +
        Math.sin(step * 0.047 + 1) * 0.026 +
        Math.sin(step * 0.0071) * 0.016,
    ),
    lr: Math.max(
      0,
      0.0003 * (t < 0.04 ? t / 0.04 : 0.5 * (1 + Math.cos((Math.PI * (t - 0.04)) / 0.96))),
    ),
    grad_norm: Math.max(0.01, 1.6 * Math.exp(-t * 2.4) + 0.22 + Math.sin(step * 0.031) * 0.12),
  };
  const colors = { loss: [101, 214, 173], lr: [98, 176, 232], grad_norm: [207, 188, 242] };
  for (const metric of ['loss', 'lr', 'grad_norm'] as const) {
    const labels = await labelsFor(page, metric);
    const xTicks = labels
      .filter((label) => label.baseline === 'top' && label.align === 'center')
      .map((label) => ({ ...label, value: parseLabel(label.text) }))
      .filter((label) => Number.isFinite(label.value));
    const yTicks = labels
      .filter((label) => label.baseline === 'middle' && label.align === 'right')
      .map((label) => ({ ...label, value: parseLabel(label.text) }))
      .filter((label) => Number.isFinite(label.value));
    expect(xTicks.length, `${metric} must draw numeric step ticks`).toBeGreaterThanOrEqual(2);
    expect(yTicks.length, `${metric} must draw numeric value ticks`).toBeGreaterThanOrEqual(2);
    const [x0, x1] = xTicks;
    const [y0, y1] = yTicks;
    const x = x0!.x + ((step - x0!.value) / (x1!.value - x0!.value)) * (x1!.x - x0!.x);
    const y = y0!.y + ((expected[metric] - y0!.value) / (y1!.value - y0!.value)) * (y1!.y - y0!.y);
    const ink = await page
      .getByTestId(`chart-${metric}`)
      .locator('canvas')
      .evaluate(
        (node, target) => {
          const canvas = node as HTMLCanvasElement;
          const pixels = canvas
            .getContext('2d')!
            .getImageData(0, 0, canvas.width, canvas.height).data;
          const radius = Math.ceil((3 * canvas.width) / canvas.getBoundingClientRect().width);
          let count = 0;
          for (
            let py = Math.max(0, Math.floor(target.y - radius));
            py <= Math.min(canvas.height - 1, Math.ceil(target.y + radius));
            py++
          ) {
            for (
              let px = Math.max(0, Math.floor(target.x - radius));
              px <= Math.min(canvas.width - 1, Math.ceil(target.x + radius));
              px++
            ) {
              const offset = (py * canvas.width + px) * 4;
              if (
                pixels[offset + 3]! > 100 &&
                target.color.every(
                  (channel, index) => Math.abs(pixels[offset + index]! - channel) < 55,
                )
              )
                count++;
            }
          }
          return count;
        },
        { x, y, color: colors[metric] },
      );
    expect(
      ink,
      `${metric} step150 value must be drawn where the actual axis labels place it`,
    ).toBeGreaterThan(0);
  }
});

test('drawn deep-zoom step labels stay distinct and learning-rate labels retain nonzero magnitudes', async ({
  page,
}) => {
  await captureAxisDrawing(page);
  await openRun(page, 'run-001', 999998, 999999);
  for (const metric of ['loss', 'lr', 'grad_norm']) {
    const labels = await labelsFor(page, metric);
    const stepTicks = labels.filter(
      (label) => label.baseline === 'top' && label.align === 'center',
    );
    expect(stepTicks.length).toBeGreaterThanOrEqual(2);
    expect(new Set(stepTicks.map((label) => label.text)).size).toBe(stepTicks.length);
    const values = stepTicks.map((label) => parseLabel(label.text));
    expect(values.every((value) => value >= 999998 && value <= 999999)).toBe(true);
  }
  // This source includes exact zero at the final step and a tiny positive lr at
  // the preceding step. The actual y labels must not collapse every value to 0.
  const lrLabels = (await labelsFor(page, 'lr')).filter(
    (label) => label.baseline === 'middle' && label.align === 'right',
  );
  const positive = lrLabels.map((label) => parseLabel(label.text)).filter((value) => value > 0);
  expect(positive.length).toBeGreaterThan(0);
  expect(Math.max(...positive)).toBeLessThan(0.000001);
  expect(new Set(lrLabels.map((label) => label.text)).size).toBe(lrLabels.length);
});

test('a finite singleton between missing measurements paints a real point and a later empty response clears it', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as unknown as { __soupSingletonMode: 'point' | 'empty' };
    state.__soupSingletonMode = 'point';
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        // The real module worker still generates and sends the response. The
        // listener changes this one series before the application receives it,
        // exercising the production Worker/client/query/Canvas integration.
        this.addEventListener(
          'message',
          (event: MessageEvent) => {
            const detail = event.data?.detail;
            if (detail?.run?.id !== 'run-003' || detail.metrics.loss.rawCount !== 13) return;
            const point = state.__soupSingletonMode === 'point';
            Object.assign(detail.metrics.loss, {
              x: [4199, 4205, 4211],
              y: point ? [null, 9.4, null] : [null, null, null],
              renderedCount: 3,
              invalidCount: point ? 12 : 13,
              min: point ? 9.4 : null,
              max: point ? 9.4 : null,
              latest: null,
            });
          },
          { capture: true },
        );
      }
    };
  });
  await openRun(page, 'run-003', 4199, 4211);
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  const point = await greenInkInPlot(page, [[0.3, 0.7]]);
  expect(
    point[0],
    'an isolated finite measurement needs a visible point because it has no line segment',
  ).toBeGreaterThan(8);
  await page.evaluate(() => {
    (window as unknown as { __soupSingletonMode: string }).__soupSingletonMode = 'empty';
  });
  await page.getByRole('button', { name: 'Reload snapshot', exact: true }).click();
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', 'missing');
  await expect(page.locator('.metric-chart--loss')).toContainText('No finite values in this range');
  const empty = await greenInkInPlot(page, [[0.3, 0.7]]);
  expect(
    empty[0],
    'a previous finite singleton must not remain painted after the series becomes empty',
  ).toBe(0);
});

test('logarithmic axes draw only finite positive numeric tick labels', async ({ page }) => {
  await captureAxisDrawing(page);
  await openRun(page, 'run-008', 595, 610);
  await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
  await expect(page.locator('.metric-chart--loss')).toContainText('excluded from the log scale');
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  for (const metric of ['loss', 'lr', 'grad_norm']) {
    const yLabels = (await labelsFor(page, metric)).filter(
      (label) => label.baseline === 'middle' && label.align === 'right',
    );
    expect(yLabels.length, `${metric} must still render its actual log axis`).toBeGreaterThan(0);
    for (const label of yLabels) {
      expect(label.text).not.toMatch(/NaN|Infinity|—/u);
      expect(Number.isFinite(parseLabel(label.text))).toBe(true);
      expect(parseLabel(label.text)).toBeGreaterThan(0);
    }
  }
});

test('an all-zero interval stays a real zero line on linear and becomes explicitly unplottable on log', async ({
  page,
}) => {
  await captureAxisDrawing(page);
  await openRun(page, 'run-008', 600, 605);
  const linear = await greenInkInPlot(page, [[0.3, 0.7]]);
  expect(linear[0], 'linear mode must draw the genuine zero measurements').toBeGreaterThan(20);
  await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
  await expect(page.locator('.metric-chart--loss')).toContainText(
    'No positive values in this range',
  );
  await expect(page.locator('.metric-chart--loss')).toContainText('plotted zero or negative');
  const log = await greenInkInPlot(page, [[0.3, 0.7]]);
  expect(log[0], 'zero must not be clamped to an invented small positive log value').toBe(0);
  const labels = (await labelsFor(page, 'loss')).filter((label) => label.baseline === 'middle');
  expect(labels.length).toBeGreaterThan(0);
  expect(
    labels.every((label) => Number.isFinite(parseLabel(label.text)) && parseLabel(label.text) > 0),
  ).toBe(true);
  await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('linear');
  await expect(page.locator('.metric-chart--loss .metric-chart__empty')).toHaveCount(0);
  const restored = await greenInkInPlot(page, [[0.3, 0.7]]);
  expect(restored[0], 'returning to linear restores the actual zero line').toBeGreaterThan(20);
});

test('coarse reduction retains every zero interval before logarithmic rendering', async ({
  page,
}) => {
  // This fixture deliberately has two zero plateaus in ONE reduction bucket.
  // The global maximum lies between them: retaining only one bucket minimum
  // would connect that maximum to the final point through the second zero.
  const original = getRunDetail('run-008');
  const source = canonicalize(
    Array.from({ length: original.run.pointCount }, (_, step) => {
      const zero = (step >= 5_000 && step <= 5_499) || (step >= 11_000 && step <= 11_499);
      // A negative endpoint puts zero strictly inside the linear plot for the
      // pixel control, independently of boundary-stroke clipping.
      // A positive trough also keeps finite log controls off the y-axis edge.
      const loss = step === 0 ? -1 : zero ? 0 : step === 1_000 ? 1 : step === 9_000 ? 3 : 2;
      return { step, loss, lr: loss / 1_000, grad_norm: loss * 2 };
    }),
  );
  const detail: RunDetail = {
    ...original,
    run: { ...original.run, loss: 2, issueCount: 1 },
    metrics: {
      loss: sampleMetric(source, 'loss', 1),
      lr: sampleMetric(source, 'lr', 1),
      grad_norm: sampleMetric(source, 'grad_norm', 1),
    },
    issues: [
      {
        kind: 'zero',
        message: 'Synthetic regression source contains two zero intervals and a negative endpoint.',
        count: 1_001,
      },
    ],
  };
  await page.addInitScript((replacement) => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        this.addEventListener(
          'message',
          (event: MessageEvent) => {
            if (event.data?.detail?.run?.id === 'run-008') {
              // Samples come from the production reducer above; native client,
              // response validation, query state and Canvas rendering stay real.
              Object.assign(event.data.detail, replacement);
            }
          },
          { capture: true },
        );
      }
    };
  }, detail);
  await openRun(page, 'run-008', 0, original.run.steps);
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', '-1');
  const bands: [number, number][] = [
    [0.2, 0.23],
    [0.257, 0.27],
    [0.35, 0.38],
    [0.56, 0.574],
    [0.64, 0.68],
  ];
  const linear = await greenInkInPlot(page, bands);
  expect(
    linear[1],
    'the first real zero plateau must remain visible on linear scale',
  ).toBeGreaterThan(10);
  expect(
    linear[3],
    'the second real zero plateau must remain visible on linear scale',
  ).toBeGreaterThan(10);
  await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
  await expect(page.locator('.metric-chart--loss .metric-chart__linear-note')).toHaveText(
    'Log scale',
  );
  await expect
    .poll(async () => Number(await page.getByTestId('chart-loss').getAttribute('data-y-min')))
    .toBeGreaterThan(0);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const log = await greenInkInPlot(page, bands);
  for (const index of [0, 2, 4])
    expect(log[index], 'positive source components must still be painted').toBeGreaterThan(10);
  expect(log[1], 'log must not bridge the first reduced zero interval').toBe(0);
  expect(log[3], 'log must not bridge the second reduced zero interval').toBe(0);
  await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('linear');
  await expect(page.locator('.metric-chart--loss .metric-chart__linear-note')).toHaveText(
    'No smoothing',
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const restored = await greenInkInPlot(page, bands);
  expect(restored[1]).toBeGreaterThan(10);
  expect(restored[3]).toBeGreaterThan(10);
});
