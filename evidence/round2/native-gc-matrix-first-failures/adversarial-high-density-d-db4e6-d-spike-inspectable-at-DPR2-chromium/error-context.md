# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> high-density display >> the million-point curve remains usable and spike inspectable at DPR2
- Location: tests/e2e/adversarial.spec.ts:429:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.metric-chart--loss .metric-chart__tooltip')
Expected substring: "490,000"
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
  - text: 0.4296 In selected range Unsmoothed Training steps
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
    - button "Zoom out":
      - img
    - button "Reset zoom":
      - img
    - region "Training loss":
      - heading "Training loss" [level=3]
      - paragraph: Lower is better
      - strong: "0.429578"
      - text: Latest in view
      - group "Training loss visible range statistics":
        - text: Min
        - strong: "0.382662"
        - text: Max
        - strong: "9.4"
        - text: Step 490,000 – 510,000
      - group "Training loss interactive chart":
        - paragraph: Training loss. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,270 entries / 20,001 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - region "Learning rate":
      - heading "Learning rate" [level=3]
      - paragraph: Optimizer step size
      - strong: "1.5491e-4"
      - text: Latest in view
      - group "Learning rate visible range statistics":
        - text: Min
        - strong: "1.5491e-4"
        - text: Max
        - strong: "1.6470e-4"
        - text: Step 490,000 – 510,000
      - group "Learning rate interactive chart":
        - paragraph: Learning rate. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,000 entries / 20,001 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - region "Gradient norm":
      - heading "Gradient norm" [level=3]
      - paragraph: Gradient magnitude
      - strong: "0.810228"
      - text: Latest in view
      - group "Gradient norm visible range statistics":
        - text: Min
        - strong: "0.570597"
        - text: Max
        - strong: "12.8"
        - text: Step 490,000 – 510,000
      - group "Gradient norm interactive chart":
        - paragraph: Gradient norm. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,178 entries / 20,001 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - text: Step range Start step
    - spinbutton "Start step": "490000"
    - text: — End step
    - spinbutton "End step": "510000"
    - button "Apply range"
    - button "Reset"
    - text: Drag a chart to zoom. All charts stay in step.
    - img
    - paragraph: Showing 2,270 retained loss entries from 20,001 unique observations in view. Entries can include gap markers. Minimum and maximum values are retained in each bucket. Missing and non-finite values break the line.
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
  398 | });
  399 | 
  400 | for (const width of [320, 390, 768]) {
  401 |   test(`layout and reachable keyboard navigation at ${width}px`, async ({ page, browserName }) => {
  402 |     await page.setViewportSize({ width, height: 844 });
  403 |     await page.goto('/#/guide');
  404 |     await expect(
  405 |       page.getByRole('heading', { name: 'Look closer. Keep the signal.' }),
  406 |     ).toBeVisible();
  407 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
  408 |       width,
  409 |     );
  410 |     if (width < 760) {
  411 |       // Safari's default macOS keyboard preference uses Option+Tab to include
  412 |       // links/buttons. Test its real platform traversal rather than .focus().
  413 |       const nextFocus = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  414 |       await page.keyboard.press(nextFocus);
  415 |       await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  416 |       await page.keyboard.press(nextFocus);
  417 |       await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  418 |     }
  419 |     await openReady(page);
  420 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
  421 |       width,
  422 |     );
  423 |     await expect(page.getByTestId('chart-loss')).toBeVisible();
  424 |   });
  425 | }
  426 | 
  427 | test.describe('high-density display', () => {
  428 |   test.use({ deviceScaleFactor: 2, viewport: { width: 1280, height: 900 } });
  429 |   test('the million-point curve remains usable and spike inspectable at DPR2', async ({ page }) => {
  430 |     await openReady(page);
  431 |     await page.getByRole('button', { name: 'Inspect spike', exact: true }).click();
  432 |     await expect(page.locator('[data-ready="true"]')).toBeVisible();
  433 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  434 |     await page.getByTestId('chart-loss').focus();
  435 |     await page.keyboard.press('Home');
> 436 |     await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
      |                                                                              ^ Error: expect(locator).toContainText(expected) failed
  437 |       '490,000',
  438 |     );
  439 |     const canvas = page.getByTestId('chart-loss').locator('canvas').first();
  440 |     expect(await canvas.evaluate((node) => (node as HTMLCanvasElement).width)).toBeGreaterThan(
  441 |       await canvas.evaluate((node) => node.getBoundingClientRect().width * 1.9),
  442 |     );
  443 |   });
  444 | });
  445 | 
  446 | test.describe('international browser settings', () => {
  447 |   test.use({ locale: 'ru-RU', timezoneId: 'Pacific/Kiritimati' });
  448 |   test('recorded times stay explicitly UTC and numeric step inputs keep their meaning', async ({
  449 |     page,
  450 |   }) => {
  451 |     await openReady(page, 'run-001', '?min=499999&max=500001');
  452 |     await expect(page.locator('.run-subtitle')).toContainText(/Nov 9(?:,| at) 12:47 UTC/u);
  453 |     await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  454 |     await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue('500001');
  455 |     await page.getByTestId('chart-loss').focus();
  456 |     await page.keyboard.press('Home');
  457 |     await page.keyboard.press('ArrowRight');
  458 |     await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  459 |       '500,000',
  460 |     );
  461 |     await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('9.4');
  462 |   });
  463 | });
  464 | 
  465 | test.describe('touch input emulation', () => {
  466 |   test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  467 |   test('navigation and explicit zoom controls work through touchscreen taps', async ({ page }) => {
  468 |     await page.goto('/#/');
  469 |     await page.getByRole('button', { name: 'Open navigation' }).tap();
  470 |     await page.getByRole('link', { name: 'Field guide' }).tap();
  471 |     await expect(
  472 |       page.getByRole('heading', { name: 'Look closer. Keep the signal.' }),
  473 |     ).toBeVisible();
  474 |     await openReady(page);
  475 |     await page.getByRole('button', { name: 'Zoom in', exact: true }).tap();
  476 |     await expect(page.locator('[data-ready="true"]')).toBeVisible();
  477 |     await expect(page).toHaveURL(/min=/);
  478 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  479 |     await page.getByRole('button', { name: 'Reset zoom', exact: true }).tap();
  480 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
  481 |   });
  482 | });
  483 | 
  484 | test('reloading prepares a new view while keeping the recorded synthetic source time and revision distinct', async ({
  485 |   page,
  486 | }) => {
  487 |   await page.goto('/#/runs/run-009?tab=config');
  488 |   await expect(page.locator('[data-run-id="run-009"]')).toHaveAttribute('data-ready', 'true');
  489 |   await expect(page.getByRole('tabpanel')).toContainText('Run details');
  490 |   const row = (label: string) =>
  491 |     page.locator('.config-panel dl > div').filter({ has: page.locator('dt', { hasText: label }) });
  492 |   const source = row('Source snapshot at').locator('time');
  493 |   const prepared = row('View prepared at').locator('time');
  494 |   await expect(source).toHaveAttribute('datetime', '2026-11-09T18:00:00.000Z');
  495 |   await expect(source).toContainText('UTC');
  496 |   await expect(row('Fixture revision')).toContainText('soup-fixtures-v2');
  497 |   const before = await prepared.getAttribute('datetime');
  498 |   expect(Number.isFinite(Date.parse(before!))).toBe(true);
  499 |   await page.getByRole('button', { name: 'Reload snapshot', exact: true }).click();
  500 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  501 |   await expect
  502 |     .poll(async () => Date.parse((await prepared.getAttribute('datetime'))!))
  503 |     .toBeGreaterThan(Date.parse(before!));
  504 |   await expect(source).toHaveAttribute('datetime', '2026-11-09T18:00:00.000Z');
  505 |   await expect(row('Fixture revision')).toContainText('soup-fixtures-v2');
  506 |   await expect(row('Update mode')).toContainText('does not advance training');
  507 | });
  508 | 
  509 | test('an already loaded synthetic workspace can prepare a new viewport while the browser is offline', async ({
  510 |   page,
  511 |   context,
  512 | }) => {
  513 |   await openReady(page, 'run-009');
  514 |   await context.setOffline(true);
  515 |   try {
  516 |     await page.getByRole('spinbutton', { name: 'Start step' }).fill('100');
  517 |     await page.getByRole('spinbutton', { name: 'End step' }).fill('200');
  518 |     await page.getByRole('button', { name: 'Apply range', exact: true }).click();
  519 |     await expect(page.locator('[data-run-id="run-009"]')).toHaveAttribute('data-ready', 'true');
  520 |     for (const metric of ['loss', 'lr', 'grad_norm']) {
  521 |       await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute(
  522 |         'data-source-points',
  523 |         '101',
  524 |       );
  525 |     }
  526 |     await page.getByTestId('chart-loss').focus();
  527 |     await page.keyboard.press('Home');
  528 |     await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  529 |       'Sampled step 100',
  530 |     );
  531 |   } finally {
  532 |     await context.setOffline(false);
  533 |   }
  534 | });
  535 | 
  536 | test('twenty distinct viewports settle with current rendered bounds and bounded real worker requests', async ({
```