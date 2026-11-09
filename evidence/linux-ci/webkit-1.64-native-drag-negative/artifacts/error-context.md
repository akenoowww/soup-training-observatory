# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all
- Location: tests/e2e/adversarial.spec.ts:266:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByTestId('chart-grad_norm').locator('.u-select')
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" getByTestId('chart-grad_norm').locator('.u-select') with timeout 10000ms
  - waiting for getByTestId('chart-grad_norm').locator('.u-select')
    24 × locator resolved to <div class="u-select"></div>
       - unexpected value "hidden"

```

```yaml
- link "Skip to content":
  - /url: "#main"
- complementary "Workspace":
  - link "Soup home":
    - /url: "#/"
    - text: soup.
  - text: O
  - strong: Observatory
  - text: Demo workspace
  - button "Find a run ⌘ K":
    - img
    - text: Find a run ⌘ K
  - paragraph: WORKSPACE
  - navigation "Main navigation":
    - link "Training runs 20":
      - /url: "#/"
      - img
      - text: Training runs 20
    - link "Field guide":
      - /url: "#/guide"
      - img
      - text: Field guide
      - img
  - text: PROJECT Foundation models 20 experiments · 3 metrics
  - img
  - strong: A little room to experiment.
  - paragraph: Explore synthetic runs. Your production training is untouched.
  - text: SC
  - strong: Soup collective
  - text: Research workspace
- banner:
  - text: Foundation models / Training runs Synthetic data
  - button "Search runs":
    - img
  - text: SC
- main:
  - link "Training runs":
    - /url: "#/"
  - img
  - text: run-001
  - button "Previous run" [disabled]:
    - img
  - text: 1 / 20
  - button "Next run":
    - img
  - heading "llama-3.1-8b-finetune" [level=1]
  - text: Running Llama 3.1 Alpaca Nov 9 at 12:47 UTC
  - button "Save run":
    - img
  - button "Export view":
    - img
    - text: Export view
  - button "Reload snapshot":
    - img
    - text: Reload snapshot
  - text: fine-tuning 1M points
  - img
  - text: 1M source points Latest loss
  - img
  - text: 0.2799 Latest recorded value Unsmoothed Training steps
  - img
  - text: 999,999 of 1,200,000 planned steps Run duration
  - img
  - text: 5h 12m At the recorded snapshot Quality findings
  - img
  - text: "01"
  - button "Inspect data quality":
    - text: Inspect data quality
    - img
  - tablist "Run views":
    - tab "Metrics" [selected]
    - tab "Data quality 1"
    - tab "Run details"
    - text: Snapshot · not streaming
  - tabpanel "Metrics":
    - text: TRAINING METRICS Extrema preserved · no smoothing Scale
    - combobox "Chart scale":
      - option "Linear" [selected]
      - option "Logarithmic"
    - button "Zoom in":
      - img
    - button "Zoom out" [disabled]:
      - img
    - button "Reset zoom" [disabled]:
      - img
    - text: ↗
    - strong: A spike worth noticing.
    - text: Loss reaches 9.4 at step 500,000. The full-range chart preserves it.
    - button "Inspect spike":
      - text: Inspect spike
      - img
    - region "Training loss":
      - heading "Training loss" [level=3]
      - paragraph: Lower is better
      - strong: "0.279923"
      - text: Latest in view
      - group "Training loss visible range statistics":
        - text: Min
        - strong: "0.212466"
        - text: Max
        - strong: "9.4"
        - text: Step 0 – 999,999
      - group "Training loss interactive chart":
        - paragraph: Training loss. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 3,980 entries / 1,000,000 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - region "Learning rate":
      - heading "Learning rate" [level=3]
      - paragraph: Optimizer step size
      - strong: "0"
      - text: Latest in view
      - group "Learning rate visible range statistics":
        - text: Min
        - strong: "0"
        - text: Max
        - strong: "3.0000e-4"
        - text: Step 0 – 999,999
      - group "Learning rate interactive chart":
        - paragraph: Learning rate. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,000 entries / 1,000,000 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - region "Gradient norm":
      - heading "Gradient norm" [level=3]
      - paragraph: Gradient magnitude
      - strong: "0.250633"
      - text: Latest in view
      - group "Gradient norm visible range statistics":
        - text: Min
        - strong: "0.245155"
        - text: Max
        - strong: "12.8"
        - text: Step 0 – 999,999
      - group "Gradient norm interactive chart":
        - paragraph: Gradient norm. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 3,974 entries / 1,000,000 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - text: Step range Start step
    - spinbutton "Start step": "0"
    - text: — End step
    - spinbutton "End step": "999999"
    - button "Apply range"
    - button "Reset"
    - text: Drag a chart to zoom. All charts stay in step.
    - img
    - paragraph: Showing 3,980 retained loss entries from 1,000,000 unique observations in view. Entries can include gap markers. Minimum and maximum values are retained in each bucket. Missing and non-finite values break the line.
    - link "How to read this":
      - /url: "#/guide"
      - text: How to read this
      - img
- contentinfo:
  - img
  - text: Built for the signal, including the noise. SOUP OBSERVATORY / 1.0
```

# Test source

```ts
  207 |     }
  208 |   }
  209 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  210 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  211 |   await waitRenderedViewport(page, 499999, 500001);
  212 |   const step = 500001;
  213 |   const expectedLatest =
  214 |     2.6 * Math.exp(-(step / 999999) * 5.2) +
  215 |     0.24 +
  216 |     Math.sin(step * 0.047) * 0.026 +
  217 |     Math.sin(step * 0.0071) * 0.016;
  218 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText(
  219 |     expectedLatest.toFixed(4),
  220 |   );
  221 | });
  222 | 
  223 | test('a failed selected range leaves its summary unavailable instead of substituting a full-run statistic', async ({
  224 |   page,
  225 | }) => {
  226 |   await installWorkerGate(page);
  227 |   await openReady(page, 'run-009');
  228 |   await page.evaluate(() => {
  229 |     window.__soupWorkerGate.blocked = true;
  230 |     location.hash = '/runs/run-009?min=100&max=120';
  231 |   });
  232 |   await awaitQueued(page, 'run-009', 100);
  233 |   await page.evaluate(() => window.__soupWorkerGate.fail());
  234 |   await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  235 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  236 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  237 |   await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  238 | });
  239 | 
  240 | for (const malformed of ['identity', 'columns', 'stale'] as const) {
  241 |   test(`malformed worker ${malformed} fails closed and a genuine retry recovers`, async ({
  242 |     page,
  243 |   }) => {
  244 |     await installWorkerGate(page);
  245 |     await openReady(page, 'run-009');
  246 |     await waitRenderedViewport(page, 0, 21599);
  247 |     await page.evaluate((value) => {
  248 |       window.__soupWorkerGate.corrupt = value;
  249 |     }, malformed);
  250 |     await page.getByRole('button', { name: 'Reload snapshot', exact: true }).click();
  251 |     await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  252 |     await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  253 |     expect(await page.evaluate(() => window.__soupWorkerGate.corruptions.length)).toBeGreaterThan(
  254 |       0,
  255 |     );
  256 |     await page.evaluate(() => {
  257 |       window.__soupWorkerGate.corrupt = undefined;
  258 |     });
  259 |     await page.getByRole('button', { name: 'Try again', exact: false }).click();
  260 |     await expect(page.locator('[data-run-id="run-009"]')).toHaveAttribute('data-ready', 'true');
  261 |     await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  262 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '21600');
  263 |   });
  264 | }
  265 | 
  266 | test('dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all', async ({
  267 |   page,
  268 | }, testInfo) => {
  269 |   await openReady(page);
  270 |   await waitRenderedViewport(page, 0, 999999);
  271 |   await installDragObserver(page);
  272 |   let pressed = false;
  273 |   try {
  274 |     await page.bringToFront();
  275 |     const chart = page.getByTestId('chart-grad_norm');
  276 |     const surface = chart.locator('.u-over');
  277 |     await chart.focus();
  278 |     await expect(chart).toBeFocused();
  279 |     await surface.hover();
  280 |     await expect(chart.locator('..')).toHaveAttribute('aria-busy', 'false');
  281 |     let previous: { x: number; y: number; width: number; height: number } | null = null;
  282 |     await expect
  283 |       .poll(async () => {
  284 |         const next = await surface.boundingBox();
  285 |         if (!next) return false;
  286 |         const unchanged =
  287 |           previous !== null &&
  288 |           ['x', 'y', 'width', 'height'].every(
  289 |             (key) =>
  290 |               Math.abs(next[key as keyof typeof next] - previous![key as keyof typeof next]) < 0.25,
  291 |           );
  292 |         previous = next;
  293 |         return unchanged;
  294 |       })
  295 |       .toBe(true);
  296 |     const bounds = await surface.boundingBox();
  297 |     if (!bounds) throw new Error('Prepared drag surface has no bounding box.');
  298 |     await recordDragPhase(page, 'prepared', { bounds });
  299 |     await page.mouse.move(bounds.x + bounds.width * 0.35, bounds.y + bounds.height * 0.5);
  300 |     await page.mouse.down();
  301 |     pressed = true;
  302 |     await recordDragPhase(page, 'pressed');
  303 |     await page.mouse.move(bounds.x + bounds.width * 0.65, bounds.y + bounds.height * 0.5, {
  304 |       steps: 12,
  305 |     });
  306 |     const selection = chart.locator('.u-select');
> 307 |     await expect(selection).toBeVisible();
      |                             ^ Error: expect(locator).toBeVisible() failed
  308 |     await expect.poll(async () => (await selection.boundingBox())?.width ?? 0).toBeGreaterThan(4);
  309 |     await recordDragPhase(page, 'selection-before-release');
  310 |     await page.mouse.up();
  311 |     pressed = false;
  312 |     await recordDragPhase(page, 'released');
  313 |     await expect(page).toHaveURL(/min=/);
  314 |     const requested = new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
  315 |     const from = Number(requested.get('min'));
  316 |     const to = Number(requested.get('max'));
  317 |     await waitRenderedViewport(page, from, to);
  318 |     expect(from).toBeGreaterThan(300000);
  319 |     expect(from).toBeLessThan(400000);
  320 |     expect(to).toBeGreaterThan(600000);
  321 |     expect(to).toBeLessThan(700000);
  322 |     for (const metric of ['loss', 'lr', 'grad_norm']) {
  323 |       const metricChart = page.getByTestId(`chart-${metric}`);
  324 |       await expect(metricChart).toHaveAttribute('data-source-points', String(to - from + 1));
  325 |       await expect(metricChart).toHaveAttribute('data-x-min', String(from));
  326 |       await expect(metricChart).toHaveAttribute('data-x-max', String(to));
  327 |     }
  328 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  329 |     await recordDragPhase(page, 'range-painted', { from, to });
  330 |     await page.getByTestId('chart-lr').locator('.u-over').dblclick();
  331 |     await expect(page).not.toHaveURL(/min=/);
  332 |     await waitRenderedViewport(page, 0, 999999);
  333 |     for (const metric of ['loss', 'lr', 'grad_norm']) {
  334 |       await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute(
  335 |         'data-source-points',
  336 |         '1000000',
  337 |       );
  338 |     }
  339 |     await recordDragPhase(page, 'reset-painted');
  340 |   } catch (error) {
  341 |     await recordDragPhase(page, 'failure', {
  342 |       message: error instanceof Error ? error.message : String(error),
  343 |     }).catch(() => {});
  344 |     throw error;
  345 |   } finally {
  346 |     if (pressed) {
  347 |       await recordDragPhase(page, 'cleanup-release').catch(() => {});
  348 |       await page.mouse.up().catch(() => {});
  349 |     }
  350 |     const observations = await readDragObservations(page).catch((error) => ({
  351 |       captureError: String(error),
  352 |     }));
  353 |     await testInfo.attach('actual-drag-events', {
  354 |       body: JSON.stringify(observations, null, 2),
  355 |       contentType: 'application/json',
  356 |     });
  357 |   }
  358 | });
  359 | 
  360 | test('chart keyboard zoom and roving tabs remain usable without a pointer', async ({ page }) => {
  361 |   await openReady(page, 'run-009');
  362 |   const chart = page.getByTestId('chart-loss');
  363 |   await chart.focus();
  364 |   await page.keyboard.press('+');
  365 |   await expect(page).toHaveURL(/min=/);
  366 |   await waitRenderedViewport(page, 5399, 16200);
  367 |   await chart.focus();
  368 |   await page.keyboard.press('Home');
  369 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  370 |     'Sampled step',
  371 |   );
  372 |   await page.keyboard.press('End');
  373 |   const lastStep = Number(await page.getByRole('spinbutton', { name: 'End step' }).inputValue());
  374 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  375 |     new Intl.NumberFormat('en-US').format(lastStep),
  376 |   );
  377 |   await page.getByRole('tab', { name: 'Metrics', exact: true }).focus();
  378 |   await page.keyboard.press('ArrowRight');
  379 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toHaveAttribute(
  380 |     'aria-selected',
  381 |     'true',
  382 |   );
  383 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  384 |   await page.keyboard.press('ArrowRight');
  385 |   await expect(page.getByRole('tab', { name: 'Run details', exact: true })).toBeFocused();
  386 |   await expect(page.getByRole('tabpanel')).toContainText('Static snapshot');
  387 |   await page.keyboard.press('ArrowLeft');
  388 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  389 | });
  390 | 
  391 | test('search dialog traps focus in both directions and returns focus to the trigger on Escape', async ({
  392 |   page,
  393 | }) => {
  394 |   await page.goto('/#/');
  395 |   const trigger = page.getByRole('button', { name: 'Search runs', exact: true });
  396 |   await trigger.click();
  397 |   const search = page.getByRole('textbox', { name: 'Find a training run' });
  398 |   await expect(search).toBeFocused();
  399 |   await page.keyboard.press('Shift+Tab');
  400 |   const lastResult = page.getByRole('dialog').getByRole('button').last();
  401 |   await expect(lastResult).toBeFocused();
  402 |   await page.keyboard.press('Tab');
  403 |   await expect(search).toBeFocused();
  404 |   await search.fill('absolutely-no-matching-run');
  405 |   await page.keyboard.press('Tab');
  406 |   await expect(page.getByRole('button', { name: 'Close search' })).toBeFocused();
  407 |   await page.keyboard.press('Tab');
```