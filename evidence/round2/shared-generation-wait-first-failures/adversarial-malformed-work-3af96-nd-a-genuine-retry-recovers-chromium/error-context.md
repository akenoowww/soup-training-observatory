# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> malformed worker identity fails closed and a genuine retry recovers
- Location: tests/e2e/adversarial.spec.ts:240:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'We couldn’t load this run' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'We couldn’t load this run' }) with timeout 10000ms
  - waiting for getByRole('heading', { name: 'We couldn’t load this run' })

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
  - text: 0.3532 Latest recorded value Unsmoothed Training steps
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
    - button "Zoom out" [disabled]:
      - img
    - button "Reset zoom" [disabled]:
      - img
    - region "Training loss":
      - heading "Training loss" [level=3]
      - paragraph: Lower is better
      - strong: "0.353215"
      - text: Latest in view
      - group "Training loss visible range statistics":
        - text: Min
        - strong: "0.326836"
        - text: Max
        - strong: "2.97772"
        - text: Step 0 – 21,599
      - group "Training loss interactive chart":
        - paragraph: Training loss. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,292 entries / 21,600 unique observations No smoothing
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
        - text: Step 0 – 21,599
      - group "Learning rate interactive chart":
        - paragraph: Learning rate. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,000 entries / 21,600 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - region "Gradient norm":
      - heading "Gradient norm" [level=3]
      - paragraph: Gradient magnitude
      - strong: "0.317341"
      - text: Latest in view
      - group "Gradient norm visible range statistics":
        - text: Min
        - strong: "0.247838"
        - text: Max
        - strong: "1.93115"
        - text: Step 0 – 21,599
      - group "Gradient norm interactive chart":
        - paragraph: Gradient norm. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
      - status
      - text: Training step
      - img
      - text: 2,193 entries / 21,600 unique observations No smoothing
      - group:
        - img
        - text: Inspect plotted values +
    - text: Step range Start step
    - spinbutton "Start step": "0"
    - text: — End step
    - spinbutton "End step": "21599"
    - button "Apply range"
    - button "Reset"
    - text: Drag a chart to zoom. All charts stay in step.
    - img
    - paragraph: Showing 2,292 retained loss entries from 21,600 unique observations in view. Entries can include gap markers. Minimum and maximum values are retained in each bucket. Missing and non-finite values break the line.
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
  149 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  150 |   await page.evaluate(() => window.__soupWorkerGate.release('run-002'));
  151 |   await renderedFrames(page);
  152 |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  153 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('0.2581');
  154 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  155 |   await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
  156 |   const deliveryIds = await page.evaluate(() =>
  157 |     window.__soupWorkerGate.deliveries.map((request) => request.id),
  158 |   );
  159 |   expect(deliveryIds.lastIndexOf('run-002')).toBeGreaterThan(deliveryIds.lastIndexOf('run-003'));
  160 | });
  161 | 
  162 | test('superseded same-run range cannot overwrite a newer zoom when its genuine response arrives late', async ({
  163 |   page,
  164 | }) => {
  165 |   await installWorkerGate(page);
  166 |   await openReady(page);
  167 |   await page.evaluate(() => {
  168 |     window.__soupWorkerGate.blocked = true;
  169 |     location.hash = '/runs/run-001?min=100&max=200';
  170 |   });
  171 |   await awaitQueued(page, 'run-001', 100);
  172 |   await page.evaluate(() => {
  173 |     location.hash = '/runs/run-001?min=499999&max=500001';
  174 |   });
  175 |   await awaitQueued(page, 'run-001', 499999);
  176 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  177 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  178 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  179 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  180 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  181 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 100));
  182 |   await renderedFrames(page);
  183 |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('499999');
  184 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  185 |   await expect(page.getByTestId('chart-grad_norm')).toHaveAttribute('data-source-points', '3');
  186 |   await expect(page.getByTestId('chart-lr')).toHaveAttribute('data-source-points', '3');
  187 | });
  188 | 
  189 | test('selected-range loading never presents full-run loss as the selected latest value', async ({
  190 |   page,
  191 | }) => {
  192 |   await installWorkerGate(page);
  193 |   await openReady(page);
  194 |   await page.evaluate(() => {
  195 |     window.__soupWorkerGate.blocked = true;
  196 |     location.hash = '/runs/run-001?min=499999&max=500001';
  197 |   });
  198 |   await awaitQueued(page, 'run-001', 499999);
  199 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'false');
  200 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  201 |   // Retained same-run charts are acceptable only if every metric is visibly busy.
  202 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  203 |     const chart = page.locator(`.metric-chart--${metric}`);
  204 |     if (await chart.count()) {
  205 |       await expect(chart).toHaveAttribute('aria-busy', 'true');
  206 |       await expect(chart.locator('.metric-chart__updating')).toBeVisible();
  207 |     }
  208 |   }
  209 |   await page.evaluate(() => window.__soupWorkerGate.release('run-001', 499999));
  210 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  211 |   const step = 500001;
  212 |   const expectedLatest =
  213 |     2.6 * Math.exp(-(step / 999999) * 5.2) +
  214 |     0.24 +
  215 |     Math.sin(step * 0.047) * 0.026 +
  216 |     Math.sin(step * 0.0071) * 0.016;
  217 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText(
  218 |     expectedLatest.toFixed(4),
  219 |   );
  220 | });
  221 | 
  222 | test('a failed selected range leaves its summary unavailable instead of substituting a full-run statistic', async ({
  223 |   page,
  224 | }) => {
  225 |   await installWorkerGate(page);
  226 |   await openReady(page, 'run-009');
  227 |   await page.evaluate(() => {
  228 |     window.__soupWorkerGate.blocked = true;
  229 |     location.hash = '/runs/run-009?min=100&max=120';
  230 |   });
  231 |   await awaitQueued(page, 'run-009', 100);
  232 |   await page.evaluate(() => window.__soupWorkerGate.fail());
  233 |   await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  234 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  235 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  236 |   await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  237 | });
  238 | 
  239 | for (const malformed of ['identity', 'columns', 'stale'] as const) {
  240 |   test(`malformed worker ${malformed} fails closed and a genuine retry recovers`, async ({
  241 |     page,
  242 |   }) => {
  243 |     await installWorkerGate(page);
  244 |     await page.goto('/#/');
  245 |     await page.evaluate((value) => {
  246 |       window.__soupWorkerGate.corruptNext = value;
  247 |     }, malformed);
  248 |     await page.locator('a[href="#/runs/run-009"]').first().click();
> 249 |     await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
      |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  250 |     await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  251 |     await page.getByRole('button', { name: 'Try again', exact: false }).click();
  252 |     await expect(page.locator('[data-run-id="run-009"]')).toHaveAttribute('data-ready', 'true');
  253 |     await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  254 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '21600');
  255 |   });
  256 | }
  257 | 
  258 | test('dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all', async ({
  259 |   page,
  260 | }) => {
  261 |   await openReady(page);
  262 |   const surface = page.getByTestId('chart-grad_norm').locator('.u-over');
  263 |   await surface.scrollIntoViewIfNeeded();
  264 |   const bounds = await surface.boundingBox();
  265 |   expect(bounds).not.toBeNull();
  266 |   await page.mouse.move(bounds!.x + bounds!.width * 0.35, bounds!.y + bounds!.height * 0.5);
  267 |   await page.mouse.down();
  268 |   await page.mouse.move(bounds!.x + bounds!.width * 0.65, bounds!.y + bounds!.height * 0.5, {
  269 |     steps: 12,
  270 |   });
  271 |   await page.mouse.up();
  272 |   await expect(page).toHaveURL(/min=/);
  273 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  274 |   const from = Number(await page.getByRole('spinbutton', { name: 'Start step' }).inputValue());
  275 |   const to = Number(await page.getByRole('spinbutton', { name: 'End step' }).inputValue());
  276 |   expect(from).toBeGreaterThan(300000);
  277 |   expect(from).toBeLessThan(400000);
  278 |   expect(to).toBeGreaterThan(600000);
  279 |   expect(to).toBeLessThan(700000);
  280 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  281 |     const chart = page.getByTestId(`chart-${metric}`);
  282 |     await expect(chart).toHaveAttribute('data-source-points', String(to - from + 1));
  283 |     await expect(chart).toHaveAttribute('data-x-min', String(from));
  284 |     await expect(chart).toHaveAttribute('data-x-max', String(to));
  285 |   }
  286 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  287 |   await page.getByTestId('chart-lr').locator('.u-over').dblclick();
  288 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  289 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  290 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute(
  291 |       'data-source-points',
  292 |       '1000000',
  293 |     );
  294 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-min', '0');
  295 |     await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-max', '999999');
  296 |   }
  297 | });
  298 | 
  299 | test('chart keyboard zoom and roving tabs remain usable without a pointer', async ({ page }) => {
  300 |   await openReady(page, 'run-009');
  301 |   const chart = page.getByTestId('chart-loss');
  302 |   await chart.focus();
  303 |   await page.keyboard.press('+');
  304 |   await expect(page).toHaveURL(/min=/);
  305 |   await waitRenderedViewport(page, 5399, 16200);
  306 |   await chart.focus();
  307 |   await page.keyboard.press('Home');
  308 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  309 |     'Sampled step',
  310 |   );
  311 |   await page.keyboard.press('End');
  312 |   const lastStep = Number(await page.getByRole('spinbutton', { name: 'End step' }).inputValue());
  313 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  314 |     new Intl.NumberFormat('en-US').format(lastStep),
  315 |   );
  316 |   await page.getByRole('tab', { name: 'Metrics', exact: true }).focus();
  317 |   await page.keyboard.press('ArrowRight');
  318 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toHaveAttribute(
  319 |     'aria-selected',
  320 |     'true',
  321 |   );
  322 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  323 |   await page.keyboard.press('ArrowRight');
  324 |   await expect(page.getByRole('tab', { name: 'Run details', exact: true })).toBeFocused();
  325 |   await expect(page.getByRole('tabpanel')).toContainText('Static snapshot');
  326 |   await page.keyboard.press('ArrowLeft');
  327 |   await expect(page.getByRole('tab', { name: /Data quality/ })).toBeFocused();
  328 | });
  329 | 
  330 | test('search dialog traps focus in both directions and returns focus to the trigger on Escape', async ({
  331 |   page,
  332 | }) => {
  333 |   await page.goto('/#/');
  334 |   const trigger = page.getByRole('button', { name: 'Search runs', exact: true });
  335 |   await trigger.click();
  336 |   const search = page.getByRole('textbox', { name: 'Find a training run' });
  337 |   await expect(search).toBeFocused();
  338 |   await page.keyboard.press('Shift+Tab');
  339 |   const lastResult = page.getByRole('dialog').getByRole('button').last();
  340 |   await expect(lastResult).toBeFocused();
  341 |   await page.keyboard.press('Tab');
  342 |   await expect(search).toBeFocused();
  343 |   await search.fill('absolutely-no-matching-run');
  344 |   await page.keyboard.press('Tab');
  345 |   await expect(page.getByRole('button', { name: 'Close search' })).toBeFocused();
  346 |   await page.keyboard.press('Tab');
  347 |   await expect(search).toBeFocused();
  348 |   await page.keyboard.press('Escape');
  349 |   await expect(page.getByRole('dialog')).toHaveCount(0);
```