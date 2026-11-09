import { test, expect, type Page } from '@playwright/test';
import { waitRenderedViewport } from './support/chart-assertions';
import {
  installDragObserver,
  readDragObservations,
  recordDragPhase,
} from './support/drag-observer';

interface TransportRequest {
  requestId: number;
  id: string;
  range?: { min: number; max: number };
}
interface QueuedReply {
  request: TransportRequest;
  deliver: () => void;
}
interface WorkerGate {
  blocked: boolean;
  queue: QueuedReply[];
  deliveries: TransportRequest[];
  corrupt?: 'identity' | 'columns' | 'stale';
  corruptions: { requestId: number; id: string; kind: 'identity' | 'columns' | 'stale' }[];
  fail: () => void;
  release: (id: string, min?: number) => number;
}
declare global {
  interface Window {
    __soupWorkerGate: WorkerGate;
  }
}

/** Control delivery of real worker responses, not a replacement data source. The
 * production client/React/query cache receive genuine generated measurements in
 * a deliberately hostile order. No hook or debug mode is shipped in the app. */
async function installWorkerGate(page: Page) {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    const workers: Worker[] = [];
    const gate: WorkerGate = {
      blocked: false,
      queue: [],
      deliveries: [],
      corruptions: [],
      fail() {
        workers.at(-1)?.dispatchEvent(new Event('error'));
      },
      release(id, min) {
        const selected = this.queue.filter(
          (reply) =>
            reply.request.id === id && (min === undefined || reply.request.range?.min === min),
        );
        this.queue = this.queue.filter((reply) => !selected.includes(reply));
        selected.forEach((reply) => reply.deliver());
        return selected.length;
      },
    };
    window.__soupWorkerGate = gate;
    class DeliveryControlledWorker extends NativeWorker {
      private deliveredMessage: ((this: Worker, event: MessageEvent) => unknown) | null = null;
      private requests = new Map<number, TransportRequest>();
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        workers.push(this);
        super.addEventListener('message', (event) => {
          const request = this.requests.get(event.data?.requestId);
          if (!request) return;
          const deliver = () => {
            gate.deliveries.push(request);
            const payload = event.data;
            if (gate.corrupt)
              gate.corruptions.push({
                requestId: request.requestId,
                id: request.id,
                kind: gate.corrupt,
              });
            if (gate.corrupt === 'identity') payload.detail.run.id = 'run-001';
            if (gate.corrupt === 'columns') payload.detail.metrics.loss.y.pop();
            if (gate.corrupt === 'stale') payload.detail.source.revision = 'soup-fixtures-v1';
            this.deliveredMessage?.call(this, new MessageEvent('message', { data: payload }));
          };
          if (gate.blocked) gate.queue.push({ request, deliver });
          else deliver();
        });
      }
      override get onmessage() {
        return this.deliveredMessage;
      }
      override set onmessage(listener) {
        this.deliveredMessage = listener;
      }
      override postMessage(message: TransportRequest) {
        this.requests.set(message.requestId, message);
        super.postMessage(message);
      }
    }
    window.Worker = DeliveryControlledWorker;
  });
}
async function openReady(page: Page, id = 'run-001', suffix = '') {
  await page.goto(`/#/runs/${id}${suffix}`);
  await expect(page.locator(`[data-run-id="${id}"]`)).toHaveAttribute('data-ready', 'true');
  await expect(page.getByTestId('chart-loss')).toBeVisible();
}
async function awaitQueued(page: Page, id: string, min?: number) {
  await expect
    .poll(() =>
      page.evaluate(
        ({ id, min }) =>
          window.__soupWorkerGate.queue.filter(
            (reply) =>
              reply.request.id === id && (min === undefined || reply.request.range?.min === min),
          ).length,
        { id, min },
      ),
    )
    .toBeGreaterThan(0);
}
async function renderedFrames(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

test('actual React route keeps old-run data out while real worker replies arrive in reverse selection order', async ({
  page,
}) => {
  await installWorkerGate(page);
  await openReady(page);
  await page.evaluate(() => {
    window.__soupWorkerGate.blocked = true;
  });
  await page.getByRole('button', { name: 'Next run', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'mistral-7b-instruct-v3' })).toBeVisible();
  await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Loading run metrics' })).toBeVisible();
  await awaitQueued(page, 'run-002');
  await page.getByRole('button', { name: 'Next run', exact: true }).click();
  await awaitQueued(page, 'run-003');
  await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  const released = await page.evaluate(() => window.__soupWorkerGate.release('run-003'));
  expect(released).toBeGreaterThan(0);
  await expect(page.locator('[data-run-id="run-003"]')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.detail-stats .overview-card').first()).toContainText('0.2581');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  await page.evaluate(() => window.__soupWorkerGate.release('run-002'));
  await renderedFrames(page);
  await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  await expect(page.locator('.detail-stats .overview-card').first()).toContainText('0.2581');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
  const deliveryIds = await page.evaluate(() =>
    window.__soupWorkerGate.deliveries.map((request) => request.id),
  );
  expect(deliveryIds.lastIndexOf('run-002')).toBeGreaterThan(deliveryIds.lastIndexOf('run-003'));
});

test('superseded same-run range cannot overwrite a newer zoom when its genuine response arrives late', async ({
  page,
}) => {
  await installWorkerGate(page);
  await openReady(page);
  await page.evaluate(() => {
    window.__soupWorkerGate.blocked = true;
    location.hash = '/runs/run-001?min=100&max=200';
  });
  await awaitQueued(page, 'run-001', 100);
  await page.evaluate(() => {
    location.hash = '/runs/run-001?min=499999&max=500001';
  });
  await awaitQueued(page, 'run-001', 499999);
  await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  await waitRenderedViewport(page, 499999, 500001);
  await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  await page.evaluate(() => window.__soupWorkerGate.release('run-001', 100));
  await renderedFrames(page);
  await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  await expect(page.getByTestId('chart-grad_norm')).toHaveAttribute('data-source-points', '3');
  await expect(page.getByTestId('chart-lr')).toHaveAttribute('data-source-points', '3');
});

test('selected-range loading never presents full-run loss as the selected latest value', async ({
  page,
}) => {
  await installWorkerGate(page);
  await openReady(page);
  await page.evaluate(() => {
    window.__soupWorkerGate.blocked = true;
    location.hash = '/runs/run-001?min=499999&max=500001';
  });
  await awaitQueued(page, 'run-001', 499999);
  await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'false');
  await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  // Retained same-run charts are acceptable only if every metric is visibly busy.
  for (const metric of ['loss', 'lr', 'grad_norm']) {
    const chart = page.locator(`.metric-chart--${metric}`);
    if (await chart.count()) {
      await expect(chart).toHaveAttribute('aria-busy', 'true');
      await expect(chart.locator('.metric-chart__updating')).toBeVisible();
    }
  }
  await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  await waitRenderedViewport(page, 499999, 500001);
  const step = 500001;
  const expectedLatest =
    2.6 * Math.exp(-(step / 999999) * 5.2) +
    0.24 +
    Math.sin(step * 0.047) * 0.026 +
    Math.sin(step * 0.0071) * 0.016;
  await expect(page.locator('.detail-stats .overview-card').first()).toContainText(
    expectedLatest.toFixed(4),
  );
});

test('a failed selected range leaves its summary unavailable instead of substituting a full-run statistic', async ({
  page,
}) => {
  await installWorkerGate(page);
  await openReady(page, 'run-009');
  await page.evaluate(() => {
    window.__soupWorkerGate.blocked = true;
    location.hash = '/runs/run-009?min=100&max=120';
  });
  await awaitQueued(page, 'run-009', 100);
  await page.evaluate(() => window.__soupWorkerGate.fail());
  await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
});

for (const malformed of ['identity', 'columns', 'stale'] as const) {
  test(`malformed worker ${malformed} fails closed and a genuine retry recovers`, async ({
    page,
  }) => {
    await installWorkerGate(page);
    await openReady(page, 'run-009');
    await waitRenderedViewport(page, 0, 21599);
    await page.evaluate((value) => {
      window.__soupWorkerGate.corrupt = value;
    }, malformed);
    await page.getByRole('button', { name: 'Reload snapshot', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
    await expect(page.getByTestId('chart-loss')).toHaveCount(0);
    expect(await page.evaluate(() => window.__soupWorkerGate.corruptions.length)).toBeGreaterThan(
      0,
    );
    await page.evaluate(() => {
      window.__soupWorkerGate.corrupt = undefined;
    });
    await page.getByRole('button', { name: 'Try again', exact: false }).click();
    await expect(page.locator('[data-run-id="run-009"]')).toHaveAttribute('data-ready', 'true');
    await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
    await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '21600');
  });
}

test('dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all', async ({
  page,
}, testInfo) => {
  await openReady(page);
  await waitRenderedViewport(page, 0, 999999);
  await installDragObserver(page);
  let pressed = false;
  try {
    await page.bringToFront();
    const chart = page.getByTestId('chart-grad_norm');
    const surface = chart.locator('.u-over');
    await chart.focus();
    await expect(chart).toBeFocused();
    await surface.hover();
    await expect(chart.locator('..')).toHaveAttribute('aria-busy', 'false');
    let previous: { x: number; y: number; width: number; height: number } | null = null;
    await expect
      .poll(async () => {
        const next = await surface.boundingBox();
        if (!next) return false;
        const unchanged =
          previous !== null &&
          ['x', 'y', 'width', 'height'].every(
            (key) =>
              Math.abs(next[key as keyof typeof next] - previous![key as keyof typeof next]) < 0.25,
          );
        previous = next;
        return unchanged;
      })
      .toBe(true);
    const bounds = await surface.boundingBox();
    if (!bounds) throw new Error('Prepared drag surface has no bounding box.');
    await recordDragPhase(page, 'prepared', { bounds });
    await page.mouse.move(bounds.x + bounds.width * 0.35, bounds.y + bounds.height * 0.5);
    await page.mouse.down();
    pressed = true;
    await recordDragPhase(page, 'pressed');
    await page.mouse.move(bounds.x + bounds.width * 0.65, bounds.y + bounds.height * 0.5, {
      steps: 12,
    });
    const selection = chart.locator('.u-select');
    await expect(selection).toBeVisible();
    await expect.poll(async () => (await selection.boundingBox())?.width ?? 0).toBeGreaterThan(4);
    await recordDragPhase(page, 'selection-before-release');
    await page.mouse.up();
    pressed = false;
    await recordDragPhase(page, 'released');
    await expect(page).toHaveURL(/min=/);
    const requested = new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
    const from = Number(requested.get('min'));
    const to = Number(requested.get('max'));
    await waitRenderedViewport(page, from, to);
    expect(from).toBeGreaterThan(300000);
    expect(from).toBeLessThan(400000);
    expect(to).toBeGreaterThan(600000);
    expect(to).toBeLessThan(700000);
    for (const metric of ['loss', 'lr', 'grad_norm']) {
      const metricChart = page.getByTestId(`chart-${metric}`);
      await expect(metricChart).toHaveAttribute('data-source-points', String(to - from + 1));
      await expect(metricChart).toHaveAttribute('data-x-min', String(from));
      await expect(metricChart).toHaveAttribute('data-x-max', String(to));
    }
    await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
    await recordDragPhase(page, 'range-painted', { from, to });
    await page.getByTestId('chart-lr').locator('.u-over').dblclick();
    await expect(page).not.toHaveURL(/min=/);
    await waitRenderedViewport(page, 0, 999999);
    for (const metric of ['loss', 'lr', 'grad_norm']) {
      await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute(
        'data-source-points',
        '1000000',
      );
    }
    await recordDragPhase(page, 'reset-painted');
  } catch (error) {
    await recordDragPhase(page, 'failure', {
      message: error instanceof Error ? error.message : String(error),
    }).catch(() => {});
    throw error;
  } finally {
    if (pressed) {
      await recordDragPhase(page, 'cleanup-release').catch(() => {});
      await page.mouse.up().catch(() => {});
    }
    const observations = await readDragObservations(page).catch((error) => ({
      captureError: String(error),
    }));
    await testInfo.attach('actual-drag-events', {
      body: JSON.stringify(observations, null, 2),
      contentType: 'application/json',
    });
  }
});

test('chart keyboard zoom and roving tabs remain usable without a pointer', async ({ page }) => {
  await openReady(page, 'run-009');
  const chart = page.getByTestId('chart-loss');
  await chart.focus();
  await page.keyboard.press('+');
  await expect(page).toHaveURL(/min=/);
  await waitRenderedViewport(page, 5399, 16200);
  await chart.focus();
  await page.keyboard.press('Home');
  await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
    'Sampled step',
  );
  await page.keyboard.press('End');
  const lastStep = Number(await page.getByRole('spinbutton', { name: 'End step' }).inputValue());
  await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
    new Intl.NumberFormat('en-US').format(lastStep),
  );
  await page.getByRole('tab', { name: 'Metrics', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Data quality/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Run details', exact: true })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Static snapshot');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
});

test('search dialog traps focus in both directions and returns focus to the trigger on Escape', async ({
  page,
}) => {
  await page.goto('/#/');
  const trigger = page.getByRole('button', { name: 'Search runs', exact: true });
  await trigger.click();
  const search = page.getByRole('textbox', { name: 'Find a training run' });
  await expect(search).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  const lastResult = page.getByRole('dialog').getByRole('button').last();
  await expect(lastResult).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(search).toBeFocused();
  await search.fill('absolutely-no-matching-run');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close search' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(search).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('bookmark survives reload and stays isolated by run, then can be removed', async ({
  page,
}) => {
  await openReady(page, 'run-009');
  await page.getByRole('button', { name: 'Save run', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.reload();
  await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Next run', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Previous run', exact: true }).click();
  await page.getByRole('button', { name: 'Unsave run', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('unavailable browser storage reports failed saving without a false saved state', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage is disabled.', 'SecurityError');
    };
  });
  await openReady(page, 'run-009');
  await page.getByRole('button', { name: 'Save run', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'could not save' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('invalid URL range is disclosed and reset restores the full recorded domain', async ({
  page,
}) => {
  await openReady(page, 'run-009', '?min=-5&max=999999');
  await expect(page.getByRole('alert')).toContainText('outside this run');
  await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('0');
  await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue('21599');
  await page.getByRole('button', { name: 'Reset range', exact: true }).click();
  await expect(page).not.toHaveURL(/min=/);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '21600');
});

for (const width of [320, 390, 768]) {
  test(`layout and reachable keyboard navigation at ${width}px`, async ({ page, browserName }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/guide');
    await expect(
      page.getByRole('heading', { name: 'Look closer. Keep the signal.' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    if (width < 760) {
      // Safari's default macOS keyboard preference uses Option+Tab to include
      // links/buttons. Test its real platform traversal rather than .focus().
      const nextFocus =
        browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
      await page.keyboard.press(nextFocus);
      await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
      await page.keyboard.press(nextFocus);
      await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
    }
    await openReady(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.getByTestId('chart-loss')).toBeVisible();
  });
}

test.describe('high-density display', () => {
  test.use({ deviceScaleFactor: 2, viewport: { width: 1280, height: 900 } });
  test('the million-point curve remains usable and spike inspectable at DPR2', async ({ page }) => {
    await openReady(page);
    await page.getByRole('button', { name: 'Inspect spike', exact: true }).click();
    await waitRenderedViewport(page, 490000, 510000);
    await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
    await page.getByTestId('chart-loss').focus();
    await page.keyboard.press('Home');
    await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
      '490,000',
    );
    const canvas = page.getByTestId('chart-loss').locator('canvas').first();
    expect(await canvas.evaluate((node) => (node as HTMLCanvasElement).width)).toBeGreaterThan(
      await canvas.evaluate((node) => node.getBoundingClientRect().width * 1.9),
    );
  });
});

test.describe('international browser settings', () => {
  test.use({ locale: 'ru-RU', timezoneId: 'Pacific/Kiritimati' });
  test('recorded times stay explicitly UTC and numeric step inputs keep their meaning', async ({
    page,
  }) => {
    await openReady(page, 'run-001', '?min=499999&max=500001');
    await expect(page.locator('.run-subtitle')).toContainText(/Nov 9(?:,| at) 12:47 UTC/u);
    await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
    await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue('500001');
    await page.getByTestId('chart-loss').focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
      '500,000',
    );
    await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('9.4');
  });
});

test.describe('touch input emulation', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('navigation and explicit zoom controls work through touchscreen taps', async ({ page }) => {
    await page.goto('/#/');
    await page.getByRole('button', { name: 'Open navigation' }).tap();
    await page.getByRole('link', { name: 'Field guide' }).tap();
    await expect(
      page.getByRole('heading', { name: 'Look closer. Keep the signal.' }),
    ).toBeVisible();
    await openReady(page);
    await page.getByRole('button', { name: 'Zoom in', exact: true }).tap();
    await waitRenderedViewport(page, 999999 / 4, (999999 * 3) / 4);
    await expect(page).toHaveURL(/min=/);
    await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
    await page.getByRole('button', { name: 'Reset zoom', exact: true }).tap();
    await waitRenderedViewport(page, 0, 999999);
    await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
  });
});

test('reloading prepares a new view while keeping the recorded synthetic source time and revision distinct', async ({
  page,
}) => {
  await page.goto('/#/runs/run-009?tab=config');
  await expect(page.locator('[data-run-id="run-009"]')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Run details');
  const row = (label: string) =>
    page.locator('.config-panel dl > div').filter({ has: page.locator('dt', { hasText: label }) });
  const source = row('Source snapshot at').locator('time');
  const prepared = row('View prepared at').locator('time');
  await expect(source).toHaveAttribute('datetime', '2026-11-09T18:00:00.000Z');
  await expect(source).toContainText('UTC');
  await expect(row('Fixture revision')).toContainText('soup-fixtures-v2');
  const before = await prepared.getAttribute('datetime');
  expect(Number.isFinite(Date.parse(before!))).toBe(true);
  await page.getByRole('button', { name: 'Reload snapshot', exact: true }).click();
  await expect(page.locator('[data-ready="true"]')).toBeVisible();
  await expect
    .poll(async () => Date.parse((await prepared.getAttribute('datetime'))!))
    .toBeGreaterThan(Date.parse(before!));
  await expect(source).toHaveAttribute('datetime', '2026-11-09T18:00:00.000Z');
  await expect(row('Fixture revision')).toContainText('soup-fixtures-v2');
  await expect(row('Update mode')).toContainText('does not advance training');
});

test('an already loaded synthetic workspace can prepare a new viewport while the browser is offline', async ({
  page,
  context,
}) => {
  await openReady(page, 'run-009');
  await context.setOffline(true);
  try {
    await page.getByRole('spinbutton', { name: 'Start step' }).fill('100');
    await page.getByRole('spinbutton', { name: 'End step' }).fill('200');
    await page.getByRole('button', { name: 'Apply range', exact: true }).click();
    await waitRenderedViewport(page, 100, 200);
    for (const metric of ['loss', 'lr', 'grad_norm']) {
      await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute(
        'data-source-points',
        '101',
      );
    }
    await page.getByTestId('chart-loss').focus();
    await page.keyboard.press('Home');
    await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
      'Sampled step 100',
    );
  } finally {
    await context.setOffline(false);
  }
});

test('twenty distinct viewports settle with current rendered bounds and bounded real worker requests', async ({
  page,
}, testInfo) => {
  // This regression follows the observed query-eviction loop after12 unique keys.
  // Count only; native Worker delivery and the real query/client path are intact.
  // A page-close guard bounds a future runaway instead of risking browser OOM.
  let runawayRequestCount = 0;
  await page.exposeFunction('__soupStopRunawayTest', async (count: number) => {
    runawayRequestCount = count;
    await page.close();
  });
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    const recorder = { requests: [] as TransportRequest[], armed: false, reported: false };
    Object.defineProperty(window, '__soupViewportRequests', { value: recorder });
    class CountingWorker extends NativeWorker {
      override postMessage(message: TransportRequest) {
        if (recorder.armed) {
          recorder.requests.push({
            requestId: message.requestId,
            id: message.id,
            range: message.range ? { ...message.range } : undefined,
          });
          if (recorder.requests.length > 24 && !recorder.reported) {
            recorder.reported = true;
            const stop = (
              window as unknown as {
                __soupStopRunawayTest: (count: number) => Promise<void>;
              }
            ).__soupStopRunawayTest;
            void stop(recorder.requests.length);
          }
        }
        super.postMessage(message);
      }
    }
    window.Worker = CountingWorker;
  });
  try {
    await openReady(page, 'run-009');
    await page.evaluate(() => {
      const recorder = (
        window as unknown as {
          __soupViewportRequests: { requests: TransportRequest[]; armed: boolean };
        }
      ).__soupViewportRequests;
      recorder.requests = [];
      recorder.armed = true;
    });
    for (let index = 0; index < 20; index++) {
      const from = 100 + index * 300;
      const to = from + 120;
      await page.getByRole('spinbutton', { name: 'Start step' }).fill(String(from));
      await page.getByRole('spinbutton', { name: 'End step' }).fill(String(to));
      await page.getByRole('button', { name: 'Apply range', exact: true }).click();
      await waitRenderedViewport(page, from, to, 3_000);
      for (const metric of ['loss', 'lr', 'grad_norm']) {
        const chart = page.getByTestId(`chart-${metric}`);
        await expect(chart).toHaveAttribute('data-x-min', String(from));
        await expect(chart).toHaveAttribute('data-x-max', String(to));
        await expect(chart).toHaveAttribute('data-source-points', '121');
      }
      // Independent fixture arithmetic confirms the displayed latest is from this
      // viewport, rather than a previously cached window or the complete run.
      const expectedLatest =
        2.6 * Math.exp(-(to / 21599) * 5.2) +
        0.24 +
        8 * 0.014 +
        Math.sin(to * 0.047 + 8) * 0.026 +
        Math.sin(to * 0.0071) * 0.016;
      await expect(page.locator('.detail-stats .overview-card').first()).toContainText(
        expectedLatest.toFixed(4),
      );
    }
    const requests = await page.evaluate(() => {
      const recorder = (
        window as unknown as {
          __soupViewportRequests: { requests: TransportRequest[]; armed: boolean };
        }
      ).__soupViewportRequests;
      recorder.armed = false;
      return recorder.requests;
    });
    testInfo.annotations.push({
      type: 'sequential-viewport-worker-requests',
      description: `${requests.length} native worker requests for20 distinct completed viewports`,
    });
    expect(requests.length).toBeGreaterThanOrEqual(20);
    expect(
      requests.length,
      'twenty completed windows must not trigger an eviction/refetch loop',
    ).toBeLessThanOrEqual(22);
    expect(
      new Set(
        requests.map((request) => `${request.id}:${request.range?.min}:${request.range?.max}`),
      ).size,
    ).toBe(20);
    await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-x-min', '5800');
    await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-x-max', '5920');
  } catch (error) {
    if (runawayRequestCount) {
      throw new Error(
        `Worker request budget exceeded: ${runawayRequestCount} requests during20 sequential viewports; the harness closed the page to bound the regression.`,
      );
    }
    throw error;
  }
});
