# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all
- Location: tests/e2e/adversarial.spec.ts:117:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByTestId('chart-loss')
Expected: "349740"
Received: ""
Timeout:  10000ms

Call log:
  - Expect "toHaveAttribute" getByTestId('chart-loss') with timeout 10000ms
  - waiting for getByTestId('chart-loss')
    24 × locator resolved to <div tabindex="0" role="group" data-max-value="9.4" aria-describedby="_r_6_" data-testid="chart-loss" data-rendered-points="3760" data-source-points="297929" class="metric-chart__interactive" data-min-value="0.2880360910450614" aria-label="Training loss interactive chart">…</div>
       - unexpected value "null"

```

```yaml
- group "Training loss interactive chart":
  - paragraph: Training loss. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line. Hover shows sampled values, not every raw step.
```

# Test source

```ts
  38  |           if (!request) return;
  39  |           const deliver = () => {
  40  |             gate.deliveries.push(request);
  41  |             this.deliveredMessage?.call(this, new MessageEvent('message', { data: event.data }));
  42  |           };
  43  |           if (gate.blocked) gate.queue.push({ request, deliver });
  44  |           else deliver();
  45  |         });
  46  |       }
  47  |       override get onmessage() { return this.deliveredMessage; }
  48  |       override set onmessage(listener) { this.deliveredMessage = listener; }
  49  |       override postMessage(message: TransportRequest) {
  50  |         this.requests.set(message.requestId, message);
  51  |         super.postMessage(message);
  52  |       }
  53  |     }
  54  |     window.Worker = DeliveryControlledWorker;
  55  |   });
  56  | }
  57  | async function openReady(page: Page, id = 'run-001', suffix = '') {
  58  |   await page.goto(`/#/runs/${id}${suffix}`);
  59  |   await expect(page.locator(`[data-run-id="${id}"]`)).toHaveAttribute('data-ready', 'true');
  60  |   await expect(page.getByTestId('chart-loss')).toBeVisible();
  61  | }
  62  | async function awaitQueued(page: Page, id: string, min?: number) {
  63  |   await expect.poll(() => page.evaluate(({ id, min }) => window.__soupWorkerGate.queue.filter(reply => reply.request.id === id && (min === undefined || reply.request.range?.min === min)).length, { id, min })).toBeGreaterThan(0);
  64  | }
  65  | async function renderedFrames(page: Page) {
  66  |   await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  67  | }
  68  | 
  69  | test('actual React route keeps old-run data out while real worker replies arrive in reverse selection order', async ({ page }) => {
  70  |   await installWorkerGate(page);
  71  |   await openReady(page);
  72  |   await page.evaluate(() => { window.__soupWorkerGate.blocked = true; });
  73  |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  74  |   await expect(page.getByRole('heading', { name: 'mistral-7b-instruct-v3' })).toBeVisible();
  75  |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  76  |   await expect(page.getByRole('status', { name: 'Loading run metrics' })).toBeVisible();
  77  |   await awaitQueued(page, 'run-002');
  78  |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  79  |   await awaitQueued(page, 'run-003');
  80  |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  81  |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  82  |   const released = await page.evaluate(() => window.__soupWorkerGate.release('run-003'));
  83  |   expect(released).toBeGreaterThan(0);
  84  |   await expect(page.locator('[data-run-id="run-003"]')).toHaveAttribute('data-ready', 'true');
  85  |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('0.2581');
  86  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  87  |   await page.evaluate(() => window.__soupWorkerGate.release('run-002'));
  88  |   await renderedFrames(page);
  89  |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  90  |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('0.2581');
  91  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  92  |   await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
  93  |   const deliveryIds = await page.evaluate(() => window.__soupWorkerGate.deliveries.map(request => request.id));
  94  |   expect(deliveryIds.lastIndexOf('run-002')).toBeGreaterThan(deliveryIds.lastIndexOf('run-003'));
  95  | });
  96  | 
  97  | test('superseded same-run range cannot overwrite a newer zoom when its genuine response arrives late', async ({ page }) => {
  98  |   await installWorkerGate(page);
  99  |   await openReady(page);
  100 |   await page.evaluate(() => { window.__soupWorkerGate.blocked = true; location.hash = '/runs/run-001?min=100&max=200'; });
  101 |   await awaitQueued(page, 'run-001', 100);
  102 |   await page.evaluate(() => { location.hash = '/runs/run-001?min=499999&max=500001'; });
  103 |   await awaitQueued(page, 'run-001', 499999);
  104 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  105 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  106 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  107 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  108 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  109 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 100));
  110 |   await renderedFrames(page);
  111 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  112 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  113 |   await expect(page.getByTestId('chart-grad_norm')).toHaveAttribute('data-source-points', '3');
  114 |   await expect(page.getByTestId('chart-lr')).toHaveAttribute('data-source-points', '3');
  115 | });
  116 | 
  117 | test('dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all', async ({ page }) => {
  118 |   await openReady(page);
  119 |   const surface = page.getByTestId('chart-grad_norm').locator('.u-over');
  120 |   await surface.scrollIntoViewIfNeeded();
  121 |   const bounds = await surface.boundingBox();
  122 |   expect(bounds).not.toBeNull();
  123 |   await page.mouse.move(bounds!.x + bounds!.width * 0.35, bounds!.y + bounds!.height * 0.5);
  124 |   await page.mouse.down();
  125 |   await page.mouse.move(bounds!.x + bounds!.width * 0.65, bounds!.y + bounds!.height * 0.5, { steps: 12 });
  126 |   await page.mouse.up();
  127 |   await expect(page).toHaveURL(/min=/);
  128 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  129 |   const from = Number(await page.getByRole('spinbutton', { name: 'Start step' }).inputValue());
  130 |   const to = Number(await page.getByRole('spinbutton', { name: 'End step' }).inputValue());
  131 |   expect(from).toBeGreaterThan(300000);
  132 |   expect(from).toBeLessThan(400000);
  133 |   expect(to).toBeGreaterThan(600000);
  134 |   expect(to).toBeLessThan(700000);
  135 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  136 |     const chart = page.getByTestId(`chart-${metric}`);
  137 |     await expect(chart).toHaveAttribute('data-source-points', String(to - from + 1));
> 138 |     await expect(chart).toHaveAttribute('data-x-min', String(from));
      |                         ^ Error: expect(locator).toHaveAttribute(expected) failed
  139 |     await expect(chart).toHaveAttribute('data-x-max', String(to));
  140 |   }
  141 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  142 |   await page.getByTestId('chart-lr').locator('.u-over').dblclick();
  143 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  144 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  145 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-source-points', '1000000');
  146 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-min', '0');
  147 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-max', '999999');
  148 |   }
  149 | });
  150 | 
  151 | test('chart keyboard zoom and roving tabs remain usable without a pointer', async ({ page }) => {
  152 |   await openReady(page, 'run-009');
  153 |   const chart = page.getByTestId('chart-loss');
  154 |   await chart.focus();
  155 |   await page.keyboard.press('+');
  156 |   await expect(page).toHaveURL(/min=/);
  157 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  158 |   await chart.focus();
  159 |   await page.keyboard.press('Home');
  160 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('Sampled step');
  161 |   await page.keyboard.press('End');
  162 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('16,199');
  163 |   await page.getByRole('tab', { name: 'Metrics', exact: true }).focus();
  164 |   await page.keyboard.press('ArrowRight');
  165 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toHaveAttribute('aria-selected', 'true');
  166 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  167 |   await page.keyboard.press('ArrowRight');
  168 |   await expect(page.getByRole('tab', { name: 'Run details', exact: true })).toBeFocused();
  169 |   await expect(page.getByRole('tabpanel')).toContainText('Static snapshot');
  170 |   await page.keyboard.press('ArrowLeft');
  171 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  172 | });
  173 | 
  174 | test('search dialog traps focus in both directions and returns focus to the trigger on Escape', async ({ page }) => {
  175 |   await page.goto('/#/');
  176 |   const trigger = page.getByRole('button', { name: 'Search runs', exact: true });
  177 |   await trigger.click();
  178 |   const search = page.getByRole('textbox', { name: 'Find a training run' });
  179 |   await expect(search).toBeFocused();
  180 |   await page.keyboard.press('Shift+Tab');
  181 |   const lastResult = page.getByRole('dialog').getByRole('button').last();
  182 |   await expect(lastResult).toBeFocused();
  183 |   await page.keyboard.press('Tab');
  184 |   await expect(search).toBeFocused();
  185 |   await search.fill('absolutely-no-matching-run');
  186 |   await page.keyboard.press('Tab');
  187 |   await expect(page.getByRole('button', { name: 'Close search' })).toBeFocused();
  188 |   await page.keyboard.press('Tab');
  189 |   await expect(search).toBeFocused();
  190 |   await page.keyboard.press('Escape');
  191 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  192 |   await expect(trigger).toBeFocused();
  193 | });
  194 | 
  195 | test('bookmark survives reload and stays isolated by run, then can be removed', async ({ page }) => {
  196 |   await openReady(page, 'run-009');
  197 |   await page.getByRole('button', { name: 'Save run', exact: true }).click();
  198 |   await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute('aria-pressed', 'true');
  199 |   await page.reload();
  200 |   await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute('aria-pressed', 'true');
  201 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  202 |   await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute('aria-pressed', 'false');
  203 |   await page.getByRole('button', { name: 'Previous run', exact: true }).click();
  204 |   await page.getByRole('button', { name: 'Unsave run', exact: true }).click();
  205 |   await page.reload();
  206 |   await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute('aria-pressed', 'false');
  207 | });
  208 | 
  209 | test('unavailable browser storage reports failed saving without a false saved state', async ({ page }) => {
  210 |   await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage is disabled.', 'SecurityError'); }; });
  211 |   await openReady(page, 'run-009');
  212 |   await page.getByRole('button', { name: 'Save run', exact: true }).click();
  213 |   await expect(page.getByRole('status').filter({ hasText: 'could not save' })).toBeVisible();
  214 |   await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute('aria-pressed', 'false');
  215 | });
  216 | 
  217 | test('invalid URL range is disclosed and reset restores the full recorded domain', async ({ page }) => {
  218 |   await openReady(page, 'run-009', '?min=-5&max=999999');
  219 |   await expect(page.getByRole('alert')).toContainText('outside this run');
  220 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('0');
  221 |   await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue('21599');
  222 |   await page.getByRole('button', { name: 'Reset range', exact: true }).click();
  223 |   await expect(page).not.toHaveURL(/min=/);
  224 |   await expect(page.getByRole('alert')).toHaveCount(0);
  225 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '21600');
  226 | });
  227 | 
  228 | for (const width of [320, 390, 768]) {
  229 |   test(`layout and reachable keyboard navigation at ${width}px`, async ({ page }) => {
  230 |     await page.setViewportSize({ width, height: 844 });
  231 |     await page.goto('/#/guide');
  232 |     await expect(page.getByRole('heading', { name: 'Look closer. Keep the signal.' })).toBeVisible();
  233 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  234 |     if (width < 760) {
  235 |       await page.keyboard.press('Tab');
  236 |       await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  237 |       await page.keyboard.press('Tab');
  238 |       await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
```