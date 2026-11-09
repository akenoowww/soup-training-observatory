# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> layout and reachable keyboard navigation at 320px
- Location: tests/e2e/adversarial.spec.ts:401:3

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('link', { name: 'Skip to content' })
Expected: focused
Received: inactive
Timeout:  10000ms

Call log:
  - Expect "toBeFocused" getByRole('link', { name: 'Skip to content' }) with timeout 10000ms
  - waiting for getByRole('link', { name: 'Skip to content' })
    24 × locator resolved to <a href="#main" class="skip-link">Skip to content</a>
       - unexpected value "inactive"

```

```yaml
- link "Skip to content":
  - /url: "#main"
```

# Test source

```ts
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
  398 | });
  399 | 
  400 | for (const width of [320, 390, 768]) {
  401 |   test(`layout and reachable keyboard navigation at ${width}px`, async ({ page }) => {
  402 |     await page.setViewportSize({ width, height: 844 });
  403 |     await page.goto('/#/guide');
  404 |     await expect(
  405 |       page.getByRole('heading', { name: 'Look closer. Keep the signal.' }),
  406 |     ).toBeVisible();
  407 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
  408 |       width,
  409 |     );
  410 |     if (width < 760) {
  411 |       await page.keyboard.press('Tab');
> 412 |       await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
      |                                                                         ^ Error: expect(locator).toBeFocused() failed
  413 |       await page.keyboard.press('Tab');
  414 |       await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  415 |     }
  416 |     await openReady(page);
  417 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
  418 |       width,
  419 |     );
  420 |     await expect(page.getByTestId('chart-loss')).toBeVisible();
  421 |   });
  422 | }
  423 | 
  424 | test.describe('high-density display', () => {
  425 |   test.use({ deviceScaleFactor: 2, viewport: { width: 1280, height: 900 } });
  426 |   test('the million-point curve remains usable and spike inspectable at DPR2', async ({ page }) => {
  427 |     await openReady(page);
  428 |     await page.getByRole('button', { name: 'Inspect spike', exact: true }).click();
  429 |     await expect(page.locator('[data-ready="true"]')).toBeVisible();
  430 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  431 |     await page.getByTestId('chart-loss').focus();
  432 |     await page.keyboard.press('Home');
  433 |     await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  434 |       '490,000',
  435 |     );
  436 |     const canvas = page.getByTestId('chart-loss').locator('canvas').first();
  437 |     expect(await canvas.evaluate((node) => (node as HTMLCanvasElement).width)).toBeGreaterThan(
  438 |       await canvas.evaluate((node) => node.getBoundingClientRect().width * 1.9),
  439 |     );
  440 |   });
  441 | });
  442 | 
  443 | test.describe('international browser settings', () => {
  444 |   test.use({ locale: 'ru-RU', timezoneId: 'Pacific/Kiritimati' });
  445 |   test('recorded times stay explicitly UTC and numeric step inputs keep their meaning', async ({
  446 |     page,
  447 |   }) => {
  448 |     await openReady(page, 'run-001', '?min=499999&max=500001');
  449 |     await expect(page.locator('.run-subtitle')).toContainText(/Nov 9(?:,| at) 12:47 UTC/u);
  450 |     await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  451 |     await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue('500001');
  452 |     await page.getByTestId('chart-loss').focus();
  453 |     await page.keyboard.press('Home');
  454 |     await page.keyboard.press('ArrowRight');
  455 |     await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  456 |       '500,000',
  457 |     );
  458 |     await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('9.4');
  459 |   });
  460 | });
  461 | 
  462 | test.describe('touch input emulation', () => {
  463 |   test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  464 |   test('navigation and explicit zoom controls work through touchscreen taps', async ({ page }) => {
  465 |     await page.goto('/#/');
  466 |     await page.getByRole('button', { name: 'Open navigation' }).tap();
  467 |     await page.getByRole('link', { name: 'Field guide' }).tap();
  468 |     await expect(
  469 |       page.getByRole('heading', { name: 'Look closer. Keep the signal.' }),
  470 |     ).toBeVisible();
  471 |     await openReady(page);
  472 |     await page.getByRole('button', { name: 'Zoom in', exact: true }).tap();
  473 |     await expect(page.locator('[data-ready="true"]')).toBeVisible();
  474 |     await expect(page).toHaveURL(/min=/);
  475 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  476 |     await page.getByRole('button', { name: 'Reset zoom', exact: true }).tap();
  477 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
  478 |   });
  479 | });
  480 | 
  481 | test('reloading prepares a new view while keeping the recorded synthetic source time and revision distinct', async ({
  482 |   page,
  483 | }) => {
  484 |   await openReady(page, 'run-009', '?tab=config');
  485 |   const row = (label: string) =>
  486 |     page.locator('.config-panel dl > div').filter({ has: page.locator('dt', { hasText: label }) });
  487 |   const source = row('Source snapshot at').locator('time');
  488 |   const prepared = row('View prepared at').locator('time');
  489 |   await expect(source).toHaveAttribute('datetime', '2026-11-09T18:00:00.000Z');
  490 |   await expect(source).toContainText('UTC');
  491 |   await expect(row('Fixture revision')).toContainText('soup-fixtures-v2');
  492 |   const before = await prepared.getAttribute('datetime');
  493 |   expect(Number.isFinite(Date.parse(before!))).toBe(true);
  494 |   await page.getByRole('button', { name: 'Reload snapshot', exact: true }).click();
  495 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  496 |   await expect
  497 |     .poll(async () => Date.parse((await prepared.getAttribute('datetime'))!))
  498 |     .toBeGreaterThan(Date.parse(before!));
  499 |   await expect(source).toHaveAttribute('datetime', '2026-11-09T18:00:00.000Z');
  500 |   await expect(row('Fixture revision')).toContainText('soup-fixtures-v2');
  501 |   await expect(row('Update mode')).toContainText('does not advance training');
  502 | });
  503 | 
  504 | test('an already loaded synthetic workspace can prepare a new viewport while the browser is offline', async ({
  505 |   page,
  506 |   context,
  507 | }) => {
  508 |   await openReady(page, 'run-009');
  509 |   await context.setOffline(true);
  510 |   try {
  511 |     await page.getByRole('spinbutton', { name: 'Start step' }).fill('100');
  512 |     await page.getByRole('spinbutton', { name: 'End step' }).fill('200');
```