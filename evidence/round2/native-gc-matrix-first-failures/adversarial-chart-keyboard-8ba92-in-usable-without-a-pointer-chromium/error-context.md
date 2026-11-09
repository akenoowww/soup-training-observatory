# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> chart keyboard zoom and roving tabs remain usable without a pointer
- Location: tests/e2e/adversarial.spec.ts:288:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.metric-chart--loss .metric-chart__tooltip')
Expected substring: "Sampled step"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" locator('.metric-chart--loss .metric-chart__tooltip') with timeout 10000ms
  - waiting for locator('.metric-chart--loss .metric-chart__tooltip')

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
  - text: run-009
  - button "Previous run":
    - img
  - text: 9 / 20
  - button "Next run":
    - img
  - heading "whisper-small-en" [level=1]
  - text: Completed Whisper LibriSpeech Nov 9, 05:32 UTC
  - button "Save run":
    - img
  - button "Export view":
    - img
    - text: Export view
  - button "Reload snapshot":
    - img
    - text: Reload snapshot
  - text: baseline
  - img
  - text: 21.6K source points Latest loss
  - img
  - text: 0.4271 In selected range Unsmoothed Training steps
  - img
  - text: 21,599 of 21,599 planned steps Run duration
  - img
  - text: 3h 23m At the recorded snapshot Quality findings
  - img
  - text: "00"
  - button "Inspect data quality":
    - text: Inspect data quality
    - img
  - tablist "Run views":
    - tab "Metrics" [selected]
    - tab "Data quality"
    - tab "Run details"
    - text: Snapshot · not streaming
  - tabpanel "Metrics":
    - text: TRAINING METRICS Extrema preserved · no smoothing Scale
    - combobox "Chart scale":
      - option "Linear" [selected]
      - option "Logarithmic"
    - button "Zoom in":
      - img
    - button "Zoom out":
      - img
    - button "Reset zoom":
      - img
    - region "Training loss":
      - heading "Training loss" [level=3]
      - paragraph: Lower is better
      - strong: "0.427079"
      - text: Latest in view
      - group "Training loss visible range statistics":
        - text: Min
        - strong: "0.369283"
        - text: Max
        - strong: "1.08838"
        - text: Step 5,399 – 16,200
      - group "Training loss interactive chart":
        - paragraph: Training loss. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,133 entries / 10,802 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - region "Learning rate":
      - heading "Learning rate" [level=3]
      - paragraph: Optimizer step size
      - strong: "4.7449e-5"
      - text: Latest in view
      - group "Learning rate visible range statistics":
        - text: Min
        - strong: "4.7449e-5"
        - text: Max
        - strong: "2.6596e-4"
        - text: Step 5,399 – 16,200
      - group "Learning rate interactive chart":
        - paragraph: Learning rate. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,000 entries / 10,802 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - region "Gradient norm":
      - heading "Gradient norm" [level=3]
      - paragraph: Gradient magnitude
      - strong: "0.43174"
      - text: Latest in view
      - group "Gradient norm visible range statistics":
        - text: Min
        - strong: "0.365516"
        - text: Max
        - strong: "1.20618"
        - text: Step 5,399 – 16,200
      - group "Gradient norm interactive chart":
        - paragraph: Gradient norm. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,085 entries / 10,802 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - text: Step range Start step
    - spinbutton "Start step": "5399"
    - text: — End step
    - spinbutton "End step": "16200"
    - button "Apply range"
    - button "Reset"
    - text: Drag a chart to zoom. All charts stay in step.
    - img
    - paragraph: Showing 2,133 retained loss entries from 10,802 unique observations in view. Entries can include gap markers. Minimum and maximum values are retained in each bucket. Missing and non-finite values break the line.
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
  197 |   }
  198 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  199 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  200 |   const step = 500001;
  201 |   const expectedLatest =
  202 |     2.6 * Math.exp(-(step / 999999) * 5.2) +
  203 |     0.24 +
  204 |     Math.sin(step * 0.047) * 0.026 +
  205 |     Math.sin(step * 0.0071) * 0.016;
  206 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText(
  207 |     expectedLatest.toFixed(4),
  208 |   );
  209 | });
  210 | 
  211 | test('a failed selected range leaves its summary unavailable instead of substituting a full-run statistic', async ({
  212 |   page,
  213 | }) => {
  214 |   await installWorkerGate(page);
  215 |   await openReady(page, 'run-009');
  216 |   await page.evaluate(() => {
  217 |     window.__soupWorkerGate.blocked = true;
  218 |     location.hash = '/runs/run-009?min=100&max=120';
  219 |   });
  220 |   await awaitQueued(page, 'run-009', 100);
  221 |   await page.evaluate(() => window.__soupWorkerGate.fail());
  222 |   await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  223 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  224 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  225 |   await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  226 | });
  227 | 
  228 | for (const malformed of ['identity', 'columns', 'stale'] as const) {
  229 |   test(`malformed worker ${malformed} fails closed and a genuine retry recovers`, async ({
  230 |     page,
  231 |   }) => {
  232 |     await installWorkerGate(page);
  233 |     await page.goto('/#/');
  234 |     await page.evaluate((value) => {
  235 |       window.__soupWorkerGate.corruptNext = value;
  236 |     }, malformed);
  237 |     await page.locator('a[href="#/runs/run-009"]').first().click();
  238 |     await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  239 |     await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  240 |     await page.getByRole('button', { name: 'Try again', exact: false }).click();
  241 |     await expect(page.locator('[data-run-id="run-009"]')).toHaveAttribute('data-ready', 'true');
  242 |     await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  243 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '21600');
  244 |   });
  245 | }
  246 | 
  247 | test('dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all', async ({
  248 |   page,
  249 | }) => {
  250 |   await openReady(page);
  251 |   const surface = page.getByTestId('chart-grad_norm').locator('.u-over');
  252 |   await surface.scrollIntoViewIfNeeded();
  253 |   const bounds = await surface.boundingBox();
  254 |   expect(bounds).not.toBeNull();
  255 |   await page.mouse.move(bounds!.x + bounds!.width * 0.35, bounds!.y + bounds!.height * 0.5);
  256 |   await page.mouse.down();
  257 |   await page.mouse.move(bounds!.x + bounds!.width * 0.65, bounds!.y + bounds!.height * 0.5, {
  258 |     steps: 12,
  259 |   });
  260 |   await page.mouse.up();
  261 |   await expect(page).toHaveURL(/min=/);
  262 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  263 |   const from = Number(await page.getByRole('spinbutton', { name: 'Start step' }).inputValue());
  264 |   const to = Number(await page.getByRole('spinbutton', { name: 'End step' }).inputValue());
  265 |   expect(from).toBeGreaterThan(300000);
  266 |   expect(from).toBeLessThan(400000);
  267 |   expect(to).toBeGreaterThan(600000);
  268 |   expect(to).toBeLessThan(700000);
  269 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  270 |     const chart = page.getByTestId(`chart-${metric}`);
  271 |     await expect(chart).toHaveAttribute('data-source-points', String(to - from + 1));
  272 |     await expect(chart).toHaveAttribute('data-x-min', String(from));
  273 |     await expect(chart).toHaveAttribute('data-x-max', String(to));
  274 |   }
  275 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  276 |   await page.getByTestId('chart-lr').locator('.u-over').dblclick();
  277 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  278 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  279 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute(
  280 |       'data-source-points',
  281 |       '1000000',
  282 |     );
  283 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-min', '0');
  284 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-max', '999999');
  285 |   }
  286 | });
  287 | 
  288 | test('chart keyboard zoom and roving tabs remain usable without a pointer', async ({ page }) => {
  289 |   await openReady(page, 'run-009');
  290 |   const chart = page.getByTestId('chart-loss');
  291 |   await chart.focus();
  292 |   await page.keyboard.press('+');
  293 |   await expect(page).toHaveURL(/min=/);
  294 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  295 |   await chart.focus();
  296 |   await page.keyboard.press('Home');
> 297 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
      |                                                                            ^ Error: expect(locator).toContainText(expected) failed
  298 |     'Sampled step',
  299 |   );
  300 |   await page.keyboard.press('End');
  301 |   const lastStep = Number(await page.getByRole('spinbutton', { name: 'End step' }).inputValue());
  302 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  303 |     new Intl.NumberFormat('en-US').format(lastStep),
  304 |   );
  305 |   await page.getByRole('tab', { name: 'Metrics', exact: true }).focus();
  306 |   await page.keyboard.press('ArrowRight');
  307 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toHaveAttribute(
  308 |     'aria-selected',
  309 |     'true',
  310 |   );
  311 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  312 |   await page.keyboard.press('ArrowRight');
  313 |   await expect(page.getByRole('tab', { name: 'Run details', exact: true })).toBeFocused();
  314 |   await expect(page.getByRole('tabpanel')).toContainText('Static snapshot');
  315 |   await page.keyboard.press('ArrowLeft');
  316 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  317 | });
  318 | 
  319 | test('search dialog traps focus in both directions and returns focus to the trigger on Escape', async ({
  320 |   page,
  321 | }) => {
  322 |   await page.goto('/#/');
  323 |   const trigger = page.getByRole('button', { name: 'Search runs', exact: true });
  324 |   await trigger.click();
  325 |   const search = page.getByRole('textbox', { name: 'Find a training run' });
  326 |   await expect(search).toBeFocused();
  327 |   await page.keyboard.press('Shift+Tab');
  328 |   const lastResult = page.getByRole('dialog').getByRole('button').last();
  329 |   await expect(lastResult).toBeFocused();
  330 |   await page.keyboard.press('Tab');
  331 |   await expect(search).toBeFocused();
  332 |   await search.fill('absolutely-no-matching-run');
  333 |   await page.keyboard.press('Tab');
  334 |   await expect(page.getByRole('button', { name: 'Close search' })).toBeFocused();
  335 |   await page.keyboard.press('Tab');
  336 |   await expect(search).toBeFocused();
  337 |   await page.keyboard.press('Escape');
  338 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  339 |   await expect(trigger).toBeFocused();
  340 | });
  341 | 
  342 | test('bookmark survives reload and stays isolated by run, then can be removed', async ({
  343 |   page,
  344 | }) => {
  345 |   await openReady(page, 'run-009');
  346 |   await page.getByRole('button', { name: 'Save run', exact: true }).click();
  347 |   await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute(
  348 |     'aria-pressed',
  349 |     'true',
  350 |   );
  351 |   await page.reload();
  352 |   await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute(
  353 |     'aria-pressed',
  354 |     'true',
  355 |   );
  356 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  357 |   await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute(
  358 |     'aria-pressed',
  359 |     'false',
  360 |   );
  361 |   await page.getByRole('button', { name: 'Previous run', exact: true }).click();
  362 |   await page.getByRole('button', { name: 'Unsave run', exact: true }).click();
  363 |   await page.reload();
  364 |   await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute(
  365 |     'aria-pressed',
  366 |     'false',
  367 |   );
  368 | });
  369 | 
  370 | test('unavailable browser storage reports failed saving without a false saved state', async ({
  371 |   page,
  372 | }) => {
  373 |   await page.addInitScript(() => {
  374 |     Storage.prototype.setItem = () => {
  375 |       throw new DOMException('Storage is disabled.', 'SecurityError');
  376 |     };
  377 |   });
  378 |   await openReady(page, 'run-009');
  379 |   await page.getByRole('button', { name: 'Save run', exact: true }).click();
  380 |   await expect(page.getByRole('status').filter({ hasText: 'could not save' })).toBeVisible();
  381 |   await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute(
  382 |     'aria-pressed',
  383 |     'false',
  384 |   );
  385 | });
  386 | 
  387 | test('invalid URL range is disclosed and reset restores the full recorded domain', async ({
  388 |   page,
  389 | }) => {
  390 |   await openReady(page, 'run-009', '?min=-5&max=999999');
  391 |   await expect(page.getByRole('alert')).toContainText('outside this run');
  392 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('0');
  393 |   await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue('21599');
  394 |   await page.getByRole('button', { name: 'Reset range', exact: true }).click();
  395 |   await expect(page).not.toHaveURL(/min=/);
  396 |   await expect(page.getByRole('alert')).toHaveCount(0);
  397 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '21600');
```