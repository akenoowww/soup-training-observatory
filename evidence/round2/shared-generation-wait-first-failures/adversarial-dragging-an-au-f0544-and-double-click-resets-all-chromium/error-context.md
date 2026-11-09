# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> dragging an auxiliary chart sets the same numeric viewport on all metrics and double-click resets all
- Location: tests/e2e/adversarial.spec.ts:258:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 300000
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main"
  - complementary "Workspace" [ref=e5]:
    - link "Soup home" [ref=e7] [cursor=pointer]:
      - /url: "#/"
      - generic [ref=e10]: soup.
    - generic [ref=e11]:
      - generic [ref=e12]: O
      - generic [ref=e13]:
        - strong [ref=e14]: Observatory
        - generic [ref=e15]: Demo workspace
    - button "Find a run ⌘ K" [ref=e16] [cursor=pointer]:
      - generic [ref=e20]: Find a run
      - generic [ref=e21]: ⌘ K
    - paragraph [ref=e22]: WORKSPACE
    - navigation "Main navigation" [ref=e23]:
      - link "Training runs 20" [ref=e24] [cursor=pointer]:
        - /url: "#/"
        - generic [ref=e29]: Training runs
        - generic [ref=e30]: "20"
      - link "Field guide" [ref=e31] [cursor=pointer]:
        - /url: "#/guide"
    - generic [ref=e38]:
      - generic [ref=e39]: PROJECT
      - generic [ref=e40]: Foundation models
      - generic [ref=e42]: 20 experiments · 3 metrics
    - generic [ref=e43]:
      - generic [ref=e47]:
        - strong [ref=e48]: A little room to experiment.
        - paragraph [ref=e49]: Explore synthetic runs. Your production training is untouched.
      - generic [ref=e50]:
        - generic [ref=e51]: SC
        - generic [ref=e52]:
          - strong [ref=e53]: Soup collective
          - generic [ref=e54]: Research workspace
  - generic [ref=e55]:
    - banner [ref=e56]:
      - generic [ref=e57]:
        - generic [ref=e58]: Foundation models
        - generic [ref=e59]: /
        - generic [ref=e60]: Training runs
      - generic [ref=e61]:
        - generic [ref=e62]: Synthetic data
        - button "Search runs" [ref=e65] [cursor=pointer]
        - generic [ref=e69]: SC
    - main [ref=e70]:
      - generic [ref=e71]:
        - generic [ref=e72]:
          - link "Training runs" [ref=e73] [cursor=pointer]:
            - /url: "#/"
          - generic [ref=e76]: run-001
          - generic [ref=e77]:
            - button "Previous run" [disabled] [ref=e78]
            - generic [ref=e81]: 1 / 20
            - button "Next run" [ref=e82] [cursor=pointer]
        - generic [ref=e85]:
          - generic [ref=e86]:
            - generic [ref=e87]:
              - heading "llama-3.1-8b-finetune" [level=1] [ref=e88]
              - generic [ref=e89]: Running
            - generic [ref=e91]:
              - generic [ref=e92]: Llama 3.1
              - generic [ref=e94]: Alpaca
              - generic [ref=e96]: Nov 9, 12:47 UTC
          - generic [ref=e97]:
            - button "Save run" [ref=e98] [cursor=pointer]
            - button "Export view" [ref=e101] [cursor=pointer]
            - button "Reload snapshot" [ref=e104] [cursor=pointer]
        - generic [ref=e110]:
          - generic [ref=e111]: fine-tuning
          - generic [ref=e112]: 1M points
          - generic [ref=e113]: 1M source points
        - generic [ref=e118]:
          - generic [ref=e119]:
            - generic [ref=e120]: Latest loss
            - generic [ref=e124]: "0.2917"
            - generic [ref=e125]: In selected rangeUnsmoothed
          - generic [ref=e127]:
            - generic [ref=e128]: Training steps
            - generic [ref=e134]: 999,999
            - generic [ref=e135]: of 1,200,000 planned steps
          - generic [ref=e136]:
            - generic [ref=e137]: Run duration
            - generic [ref=e142]: 5h 12m
            - generic [ref=e143]: At the recorded snapshot
          - generic [ref=e144]:
            - generic [ref=e145]: Quality findings
            - generic [ref=e149]: "01"
            - button "Inspect data quality" [ref=e150] [cursor=pointer]
        - tablist "Run views" [ref=e153]:
          - tab "Metrics" [selected] [ref=e154] [cursor=pointer]
          - tab "Data quality 1" [ref=e155] [cursor=pointer]:
            - text: Data quality
            - generic [ref=e156]: "1"
          - tab "Run details" [ref=e157] [cursor=pointer]
          - generic [ref=e158]: Snapshot · not streaming
        - tabpanel "Metrics" [ref=e160]:
          - generic [ref=e161]:
            - generic [ref=e162]:
              - generic [ref=e163]: TRAINING METRICS
              - generic [ref=e164]: Extrema preserved · no smoothing
            - generic [ref=e165]:
              - generic [ref=e166]:
                - generic [ref=e167]: Scale
                - combobox "Chart scale" [ref=e168]:
                  - option "Linear" [selected]
                  - option "Logarithmic"
              - button "Zoom in" [ref=e170] [cursor=pointer]
              - button "Zoom out" [ref=e174] [cursor=pointer]
              - button "Reset zoom" [ref=e178] [cursor=pointer]
          - generic [ref=e184]:
            - region "Training loss" [ref=e185]:
              - generic [ref=e186]:
                - generic [ref=e187]:
                  - heading "Training loss" [level=3] [ref=e188]
                  - paragraph [ref=e190]: Lower is better
                - generic [ref=e191]:
                  - strong [ref=e192]: "0.291651"
                  - generic [ref=e193]: Latest in view
              - group "Training loss visible range statistics" [ref=e194]:
                - generic [ref=e195]:
                  - text: Min
                  - strong [ref=e196]: "0.288036"
                - generic [ref=e197]:
                  - text: Max
                  - strong [ref=e198]: "9.4"
                - generic [ref=e199]: Step 349,740 – 647,668
              - group "Training loss interactive chart" [ref=e200]:
                - paragraph [ref=e201]: Training loss. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
              - status [ref=e210]
              - generic [ref=e211]: Training step
              - generic [ref=e212]:
                - generic [ref=e213]: 3,760 entries / 297,929 unique observations
                - generic [ref=e217]: No smoothing
              - group [ref=e218]:
                - generic "Inspect plotted values +" [ref=e219] [cursor=pointer]
            - generic [ref=e222]:
              - region "Learning rate" [ref=e223]:
                - generic [ref=e224]:
                  - generic [ref=e225]:
                    - heading "Learning rate" [level=3] [ref=e226]
                    - paragraph [ref=e228]: Optimizer step size
                  - generic [ref=e229]:
                    - strong [ref=e230]: "8.9138e-5"
                    - generic [ref=e231]: Latest in view
                - group "Learning rate visible range statistics" [ref=e232]:
                  - generic [ref=e233]:
                    - text: Min
                    - strong [ref=e234]: "8.9138e-5"
                  - generic [ref=e235]:
                    - text: Max
                    - strong [ref=e236]: "2.2932e-4"
                  - generic [ref=e237]: Step 349,740 – 647,668
                - group "Learning rate interactive chart" [ref=e238]:
                  - paragraph [ref=e239]: Learning rate. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
                - status [ref=e248]
                - generic [ref=e249]: Training step
                - generic [ref=e250]:
                  - generic [ref=e251]: 2,000 entries / 297,929 unique observations
                  - generic [ref=e255]: No smoothing
                - group [ref=e256]:
                  - generic "Inspect plotted values +" [ref=e257] [cursor=pointer]
              - region "Gradient norm" [ref=e260]:
                - generic [ref=e261]:
                  - generic [ref=e262]:
                    - heading "Gradient norm" [level=3] [ref=e263]
                    - paragraph [ref=e265]: Gradient magnitude
                  - generic [ref=e266]:
                    - strong [ref=e267]: "0.583196"
                    - generic [ref=e268]: Latest in view
                - group "Gradient norm visible range statistics" [ref=e269]:
                  - generic [ref=e270]:
                    - text: Min
                    - strong [ref=e271]: "0.438225"
                  - generic [ref=e272]:
                    - text: Max
                    - strong [ref=e273]: "12.8"
                  - generic [ref=e274]: Step 349,740 – 647,668
                - group "Gradient norm interactive chart" [active] [ref=e275]:
                  - paragraph [ref=e276]: Gradient norm. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
                - status [ref=e285]
                - generic [ref=e286]: Training step
                - generic [ref=e287]:
                  - generic [ref=e288]: 3,975 entries / 297,929 unique observations
                  - generic [ref=e292]: No smoothing
                - group [ref=e293]:
                  - generic "Inspect plotted values +" [ref=e294] [cursor=pointer]
          - generic [ref=e297]:
            - generic [ref=e298]: Step range
            - generic [ref=e299]:
              - generic [ref=e300]: Start step
              - spinbutton "Start step" [ref=e301]: "349740"
            - generic [ref=e302]: —
            - generic [ref=e303]:
              - generic [ref=e304]: End step
              - spinbutton "End step" [ref=e305]: "647668"
            - button "Apply range" [ref=e306] [cursor=pointer]
            - button "Reset" [ref=e307] [cursor=pointer]
            - generic [ref=e308]: Drag a chart to zoom. All charts stay in step.
          - generic [ref=e309]:
            - paragraph [ref=e312]: Showing 3,760 retained loss entries from 297,929 unique observations in view. Entries can include gap markers. Minimum and maximum values are retained in each bucket. Missing and non-finite values break the line.
            - link "How to read this" [ref=e313] [cursor=pointer]:
              - /url: "#/guide"
    - contentinfo [ref=e316]:
      - generic [ref=e317]: Built for the signal, including the noise.
      - generic [ref=e320]:
        - text: SOUP OBSERVATORY
        - generic [ref=e321]: / 1.0
```

# Test source

```ts
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
  249 |     await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
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
> 276 |   expect(from).toBeGreaterThan(300000);
      |                ^ Error: expect(received).toBeGreaterThan(expected)
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
  350 |   await expect(trigger).toBeFocused();
  351 | });
  352 | 
  353 | test('bookmark survives reload and stays isolated by run, then can be removed', async ({
  354 |   page,
  355 | }) => {
  356 |   await openReady(page, 'run-009');
  357 |   await page.getByRole('button', { name: 'Save run', exact: true }).click();
  358 |   await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute(
  359 |     'aria-pressed',
  360 |     'true',
  361 |   );
  362 |   await page.reload();
  363 |   await expect(page.getByRole('button', { name: 'Unsave run', exact: true })).toHaveAttribute(
  364 |     'aria-pressed',
  365 |     'true',
  366 |   );
  367 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  368 |   await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute(
  369 |     'aria-pressed',
  370 |     'false',
  371 |   );
  372 |   await page.getByRole('button', { name: 'Previous run', exact: true }).click();
  373 |   await page.getByRole('button', { name: 'Unsave run', exact: true }).click();
  374 |   await page.reload();
  375 |   await expect(page.getByRole('button', { name: 'Save run', exact: true })).toHaveAttribute(
  376 |     'aria-pressed',
```