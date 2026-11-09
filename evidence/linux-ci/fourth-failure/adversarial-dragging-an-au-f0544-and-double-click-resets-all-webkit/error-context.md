# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all
- Location: tests/e2e/adversarial.spec.ts:261:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /min=/
Received string:  "http://127.0.0.1:4173/#/runs/run-001"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://127.0.0.1:4173/#/runs/run-001"

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
  - text: Running Llama 3.1 Alpaca Nov 9, 12:47 UTC
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
  175 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  176 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 100));
  177 |   await renderedFrames(page);
  178 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  179 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  180 |   await expect(page.getByTestId('chart-grad_norm')).toHaveAttribute('data-source-points', '3');
  181 |   await expect(page.getByTestId('chart-lr')).toHaveAttribute('data-source-points', '3');
  182 | });
  183 | 
  184 | test('selected-range loading never presents full-run loss as the selected latest value', async ({
  185 |   page,
  186 | }) => {
  187 |   await installWorkerGate(page);
  188 |   await openReady(page);
  189 |   await page.evaluate(() => {
  190 |     window.__soupWorkerGate.blocked = true;
  191 |     location.hash = '/runs/run-001?min=499999&max=500001';
  192 |   });
  193 |   await awaitQueued(page, 'run-001', 499999);
  194 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'false');
  195 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  196 |   // Retained same-run charts are acceptable only if every metric is visibly busy.
  197 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  198 |     const chart = page.locator(`.metric-chart--${metric}`);
  199 |     if (await chart.count()) {
  200 |       await expect(chart).toHaveAttribute('aria-busy', 'true');
  201 |       await expect(chart.locator('.metric-chart__updating')).toBeVisible();
  202 |     }
  203 |   }
  204 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  205 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  206 |   await waitRenderedViewport(page, 499999, 500001);
  207 |   const step = 500001;
  208 |   const expectedLatest =
  209 |     2.6 * Math.exp(-(step / 999999) * 5.2) +
  210 |     0.24 +
  211 |     Math.sin(step * 0.047) * 0.026 +
  212 |     Math.sin(step * 0.0071) * 0.016;
  213 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText(
  214 |     expectedLatest.toFixed(4),
  215 |   );
  216 | });
  217 | 
  218 | test('a failed selected range leaves its summary unavailable instead of substituting a full-run statistic', async ({
  219 |   page,
  220 | }) => {
  221 |   await installWorkerGate(page);
  222 |   await openReady(page, 'run-009');
  223 |   await page.evaluate(() => {
  224 |     window.__soupWorkerGate.blocked = true;
  225 |     location.hash = '/runs/run-009?min=100&max=120';
  226 |   });
  227 |   await awaitQueued(page, 'run-009', 100);
  228 |   await page.evaluate(() => window.__soupWorkerGate.fail());
  229 |   await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  230 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  231 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  232 |   await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  233 | });
  234 | 
  235 | for (const malformed of ['identity', 'columns', 'stale'] as const) {
  236 |   test(`malformed worker ${malformed} fails closed and a genuine retry recovers`, async ({
  237 |     page,
  238 |   }) => {
  239 |     await installWorkerGate(page);
  240 |     await openReady(page, 'run-009');
  241 |     await waitRenderedViewport(page, 0, 21599);
  242 |     await page.evaluate((value) => {
  243 |       window.__soupWorkerGate.corrupt = value;
  244 |     }, malformed);
  245 |     await page.getByRole('button', { name: 'Reload snapshot', exact: true }).click();
  246 |     await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  247 |     await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  248 |     expect(await page.evaluate(() => window.__soupWorkerGate.corruptions.length)).toBeGreaterThan(
  249 |       0,
  250 |     );
  251 |     await page.evaluate(() => {
  252 |       window.__soupWorkerGate.corrupt = undefined;
  253 |     });
  254 |     await page.getByRole('button', { name: 'Try again', exact: false }).click();
  255 |     await expect(page.locator('[data-run-id="run-009"]')).toHaveAttribute('data-ready', 'true');
  256 |     await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  257 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '21600');
  258 |   });
  259 | }
  260 | 
  261 | test('dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all', async ({
  262 |   page,
  263 | }) => {
  264 |   await openReady(page);
  265 |   const surface = page.getByTestId('chart-grad_norm').locator('.u-over');
  266 |   await surface.scrollIntoViewIfNeeded();
  267 |   const bounds = await surface.boundingBox();
  268 |   expect(bounds).not.toBeNull();
  269 |   await page.mouse.move(bounds!.x + bounds!.width * 0.35, bounds!.y + bounds!.height * 0.5);
  270 |   await page.mouse.down();
  271 |   await page.mouse.move(bounds!.x + bounds!.width * 0.65, bounds!.y + bounds!.height * 0.5, {
  272 |     steps: 12,
  273 |   });
  274 |   await page.mouse.up();
> 275 |   await expect(page).toHaveURL(/min=/);
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  276 |   const requested = new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
  277 |   const from = Number(requested.get('min'));
  278 |   const to = Number(requested.get('max'));
  279 |   await waitRenderedViewport(page, from, to);
  280 |   expect(from).toBeGreaterThan(300000);
  281 |   expect(from).toBeLessThan(400000);
  282 |   expect(to).toBeGreaterThan(600000);
  283 |   expect(to).toBeLessThan(700000);
  284 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  285 |     const chart = page.getByTestId(`chart-${metric}`);
  286 |     await expect(chart).toHaveAttribute('data-source-points', String(to - from + 1));
  287 |     await expect(chart).toHaveAttribute('data-x-min', String(from));
  288 |     await expect(chart).toHaveAttribute('data-x-max', String(to));
  289 |   }
  290 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  291 |   await page.getByTestId('chart-lr').locator('.u-over').dblclick();
  292 |   await expect(page).not.toHaveURL(/min=/);
  293 |   await waitRenderedViewport(page, 0, 999999);
  294 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  295 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute(
  296 |       'data-source-points',
  297 |       '1000000',
  298 |     );
  299 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-min', '0');
  300 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-max', '999999');
  301 |   }
  302 | });
  303 | 
  304 | test('chart keyboard zoom and roving tabs remain usable without a pointer', async ({ page }) => {
  305 |   await openReady(page, 'run-009');
  306 |   const chart = page.getByTestId('chart-loss');
  307 |   await chart.focus();
  308 |   await page.keyboard.press('+');
  309 |   await expect(page).toHaveURL(/min=/);
  310 |   await waitRenderedViewport(page, 5399, 16200);
  311 |   await chart.focus();
  312 |   await page.keyboard.press('Home');
  313 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  314 |     'Sampled step',
  315 |   );
  316 |   await page.keyboard.press('End');
  317 |   const lastStep = Number(await page.getByRole('spinbutton', { name: 'End step' }).inputValue());
  318 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  319 |     new Intl.NumberFormat('en-US').format(lastStep),
  320 |   );
  321 |   await page.getByRole('tab', { name: 'Metrics', exact: true }).focus();
  322 |   await page.keyboard.press('ArrowRight');
  323 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toHaveAttribute(
  324 |     'aria-selected',
  325 |     'true',
  326 |   );
  327 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  328 |   await page.keyboard.press('ArrowRight');
  329 |   await expect(page.getByRole('tab', { name: 'Run details', exact: true })).toBeFocused();
  330 |   await expect(page.getByRole('tabpanel')).toContainText('Static snapshot');
  331 |   await page.keyboard.press('ArrowLeft');
  332 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  333 | });
  334 | 
  335 | test('search dialog traps focus in both directions and returns focus to the trigger on Escape', async ({
  336 |   page,
  337 | }) => {
  338 |   await page.goto('/#/');
  339 |   const trigger = page.getByRole('button', { name: 'Search runs', exact: true });
  340 |   await trigger.click();
  341 |   const search = page.getByRole('textbox', { name: 'Find a training run' });
  342 |   await expect(search).toBeFocused();
  343 |   await page.keyboard.press('Shift+Tab');
  344 |   const lastResult = page.getByRole('dialog').getByRole('button').last();
  345 |   await expect(lastResult).toBeFocused();
  346 |   await page.keyboard.press('Tab');
  347 |   await expect(search).toBeFocused();
  348 |   await search.fill('absolutely-no-matching-run');
  349 |   await page.keyboard.press('Tab');
  350 |   await expect(page.getByRole('button', { name: 'Close search' })).toBeFocused();
  351 |   await page.keyboard.press('Tab');
  352 |   await expect(search).toBeFocused();
  353 |   await page.keyboard.press('Escape');
  354 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  355 |   await expect(trigger).toBeFocused();
  356 | });
  357 | 
  358 | test('bookmark survives reload and stays isolated by run, then can be removed', async ({
  359 |   page,
  360 | }) => {
  361 |   await openReady(page, 'run-009');
  362 |   await page.getByRole('button', { name: 'Save run', exact: true }).click();
  363 |   await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute(
  364 |     'aria-pressed',
  365 |     'true',
  366 |   );
  367 |   await page.reload();
  368 |   await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute(
  369 |     'aria-pressed',
  370 |     'true',
  371 |   );
  372 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  373 |   await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute(
  374 |     'aria-pressed',
  375 |     'false',
```