# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> search dialog traps focus in both directions and returns focus to the trigger on Escape
- Location: tests/e2e/adversarial.spec.ts:319:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('button', { name: 'Search runs', exact: true })
Expected: focused
Received: inactive
Timeout:  10000ms

Call log:
  - Expect "toBeFocused" getByRole('button', { name: 'Search runs', exact: true }) with timeout 10000ms
  - waiting for getByRole('button', { name: 'Search runs', exact: true })
    24 × locator resolved to <button class="icon-button" aria-haspopup="dialog" aria-label="Search runs">…</button>
       - unexpected value "inactive"

```

```yaml
- button "Search runs":
  - img
```

# Test source

```ts
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
  297 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
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
> 339 |   await expect(trigger).toBeFocused();
      |                         ^ Error: expect(locator).toBeFocused() failed
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
  412 |       await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
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
```