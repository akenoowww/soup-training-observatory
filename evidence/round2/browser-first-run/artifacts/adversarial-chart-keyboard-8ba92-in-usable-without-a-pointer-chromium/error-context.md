# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> chart keyboard zoom and roving tabs remain usable without a pointer
- Location: tests/e2e/adversarial.spec.ts:151:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.metric-chart--loss .metric-chart__tooltip')
Expected substring: "16,199"
Received string:    "Sampled step 16,2000.4270788993874785"
Timeout: 10000ms

Call log:
  - Expect "toContainText" locator('.metric-chart--loss .metric-chart__tooltip') with timeout 10000ms
  - waiting for locator('.metric-chart--loss .metric-chart__tooltip')
    24 × locator resolved to <div aria-hidden="true" class="metric-chart__tooltip">…</div>
       - unexpected value "Sampled step 16,2000.4270788993874785"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main"
  - complementary "Main navigation" [ref=e5]:
    - link "Soup home" [ref=e6] [cursor=pointer]:
      - /url: "#/"
      - generic [ref=e9]: soup.
    - generic [ref=e10]:
      - generic [ref=e11]: O
      - generic [ref=e12]:
        - strong [ref=e13]: Observatory
        - generic [ref=e14]: Demo workspace
    - button "Find a run ⌘ K" [ref=e15] [cursor=pointer]:
      - generic [ref=e19]: Find a run
      - generic [ref=e20]: ⌘ K
    - paragraph [ref=e21]: WORKSPACE
    - navigation [ref=e22]:
      - link "Training runs 20" [ref=e23] [cursor=pointer]:
        - /url: "#/"
        - generic [ref=e28]: Training runs
        - generic [ref=e29]: "20"
      - link "Field guide" [ref=e30] [cursor=pointer]:
        - /url: "#/guide"
    - generic [ref=e37]:
      - generic [ref=e38]: PROJECT
      - generic [ref=e39]: Foundation models
      - generic [ref=e41]: 20 experiments · 3 metrics
    - generic [ref=e42]:
      - generic [ref=e46]:
        - strong [ref=e47]: A little room to experiment.
        - paragraph [ref=e48]: Explore synthetic runs. Your production training is untouched.
      - generic [ref=e49]:
        - generic [ref=e50]: SC
        - generic [ref=e51]:
          - strong [ref=e52]: Soup collective
          - generic [ref=e53]: Research workspace
  - generic [ref=e54]:
    - banner [ref=e55]:
      - generic [ref=e56]:
        - generic [ref=e57]: Foundation models
        - generic [ref=e58]: /
        - generic [ref=e59]: Training runs
      - generic [ref=e60]:
        - generic [ref=e61]: Synthetic data
        - button "Search runs" [ref=e64] [cursor=pointer]
        - generic [ref=e68]: SC
    - main [ref=e69]:
      - generic [ref=e70]:
        - generic [ref=e71]:
          - link "Training runs" [ref=e72] [cursor=pointer]:
            - /url: "#/"
          - generic [ref=e75]: run-009
          - generic [ref=e76]:
            - button "Previous run" [ref=e77] [cursor=pointer]
            - generic [ref=e80]: 9 / 20
            - button "Next run" [ref=e81] [cursor=pointer]
        - generic [ref=e84]:
          - generic [ref=e85]:
            - generic [ref=e86]:
              - heading "whisper-small-en" [level=1] [ref=e87]
              - generic [ref=e88]: Completed
            - generic [ref=e90]:
              - generic [ref=e91]: Whisper
              - generic [ref=e93]: LibriSpeech
              - generic [ref=e95]: Nov 9, 09:38 UTC
          - generic [ref=e96]:
            - button "Save run" [ref=e97] [cursor=pointer]
            - button "Export view" [ref=e100] [cursor=pointer]
            - button "Reload snapshot" [ref=e103] [cursor=pointer]
        - generic [ref=e109]:
          - generic [ref=e110]: baseline
          - generic [ref=e111]: 21.6K source points
        - generic [ref=e116]:
          - generic [ref=e117]:
            - generic [ref=e118]: Latest loss
            - generic [ref=e122]: "0.4271"
            - generic [ref=e123]: In selected range Unsmoothed
          - generic [ref=e125]:
            - generic [ref=e126]: Training steps
            - generic [ref=e132]: 21,599
            - generic [ref=e133]: of 21,599 planned steps
          - generic [ref=e134]:
            - generic [ref=e135]: Run duration
            - generic [ref=e140]: 3h 23m
            - generic [ref=e141]: At the recorded snapshot
          - generic [ref=e142]:
            - generic [ref=e143]: Quality findings
            - generic [ref=e147]: "00"
            - button "Inspect data quality" [ref=e148] [cursor=pointer]
        - tablist "Run views" [ref=e151]:
          - tab "Metrics" [selected] [ref=e152] [cursor=pointer]
          - tab "Data quality" [ref=e153] [cursor=pointer]
          - tab "Run details" [ref=e154] [cursor=pointer]
          - generic [ref=e155]: Snapshot · not streaming
        - tabpanel "Metrics" [ref=e157]:
          - generic [ref=e158]:
            - generic [ref=e159]:
              - generic [ref=e160]: TRAINING METRICS
              - generic [ref=e161]: Extrema preserved · no smoothing
            - generic [ref=e162]:
              - generic [ref=e163]:
                - generic [ref=e164]: Scale
                - combobox "Chart scale" [ref=e165]:
                  - option "Linear" [selected]
                  - option "Logarithmic"
              - button "Zoom in" [ref=e167] [cursor=pointer]
              - button "Zoom out" [ref=e171] [cursor=pointer]
              - button "Reset zoom" [ref=e175] [cursor=pointer]
          - generic [ref=e181]:
            - region "Training loss" [ref=e182]:
              - generic [ref=e183]:
                - generic [ref=e184]:
                  - heading "Training loss" [level=3] [ref=e185]
                  - paragraph [ref=e187]: Lower is better
                - generic [ref=e188]:
                  - strong [ref=e189]: "0.427079"
                  - generic [ref=e190]: Latest in view
              - group "Training loss interactive chart" [active] [ref=e191]:
                - paragraph [ref=e192]: Training loss. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line. Hover shows sampled values, not every raw step.
                - generic [aria-hidden]:
                  - generic: Sampled step 16,200
                  - strong: "0.4270788993874785"
              - status [ref=e201]: "Sampled step 16,200: 0.4270788993874785."
              - generic [ref=e202]: Training step
              - generic [ref=e203]:
                - generic [ref=e204]: 2,133 entries / 10,802 unique observations
                - generic [ref=e208]: No smoothing
              - group [ref=e209]:
                - generic "Inspect plotted values +" [ref=e210] [cursor=pointer]
            - generic [ref=e213]:
              - region "Learning rate" [ref=e214]:
                - generic [ref=e215]:
                  - generic [ref=e216]:
                    - heading "Learning rate" [level=3] [ref=e217]
                    - paragraph [ref=e219]: Optimizer step size
                  - generic [ref=e220]:
                    - strong [ref=e221]: "4.7449e-5"
                    - generic [ref=e222]: Latest in view
                - group "Learning rate interactive chart" [ref=e223]:
                  - paragraph [ref=e224]: Learning rate. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line. Hover shows sampled values, not every raw step.
                - status [ref=e233]
                - generic [ref=e234]: Training step
                - generic [ref=e235]:
                  - generic [ref=e236]: 2,000 entries / 10,802 unique observations
                  - generic [ref=e240]: No smoothing
                - group [ref=e241]:
                  - generic "Inspect plotted values +" [ref=e242] [cursor=pointer]
              - region "Gradient norm" [ref=e245]:
                - generic [ref=e246]:
                  - generic [ref=e247]:
                    - heading "Gradient norm" [level=3] [ref=e248]
                    - paragraph [ref=e250]: Gradient magnitude
                  - generic [ref=e251]:
                    - strong [ref=e252]: "0.43174"
                    - generic [ref=e253]: Latest in view
                - group "Gradient norm interactive chart" [ref=e254]:
                  - paragraph [ref=e255]: Gradient norm. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line. Hover shows sampled values, not every raw step.
                - status [ref=e264]
                - generic [ref=e265]: Training step
                - generic [ref=e266]:
                  - generic [ref=e267]: 2,085 entries / 10,802 unique observations
                  - generic [ref=e271]: No smoothing
                - group [ref=e272]:
                  - generic "Inspect plotted values +" [ref=e273] [cursor=pointer]
          - generic [ref=e276]:
            - generic [ref=e277]: Step range
            - generic [ref=e278]:
              - generic [ref=e279]: Start step
              - spinbutton "Start step" [ref=e280]: "5399"
            - generic [ref=e281]: —
            - generic [ref=e282]:
              - generic [ref=e283]: End step
              - spinbutton "End step" [ref=e284]: "16200"
            - button "Apply range" [ref=e285] [cursor=pointer]
            - button "Reset" [ref=e286] [cursor=pointer]
            - generic [ref=e287]: Drag a chart to zoom. All charts stay in step.
          - generic [ref=e288]:
            - paragraph [ref=e291]: Showing 2,133 retained loss entries from 10,802 unique observations in view. Entries can include gap markers. Minimum and maximum values are retained in each bucket. Missing and non-finite values break the line.
            - link "How to read this" [ref=e292] [cursor=pointer]:
              - /url: "#/guide"
    - contentinfo [ref=e295]:
      - generic [ref=e296]: Built for the signal, including the noise.
      - generic [ref=e299]:
        - text: SOUP OBSERVATORY
        - generic [ref=e300]: / 1.0
```

# Test source

```ts
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
  138 |     await expect(chart).toHaveAttribute('data-x-min', String(from));
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
> 162 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('16,199');
      |                                                                            ^ Error: expect(locator).toContainText(expected) failed
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
  239 |     }
  240 |     await openReady(page);
  241 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  242 |     await expect(page.getByTestId('chart-loss')).toBeVisible();
  243 |   });
  244 | }
  245 | 
  246 | test.describe('high-density display', () => {
  247 |   test.use({ deviceScaleFactor: 2, viewport: { width: 1280, height: 900 } });
  248 |   test('the million-point curve remains usable and spike inspectable at DPR2', async ({ page }) => {
  249 |     await openReady(page);
  250 |     await page.getByRole('button', { name: 'Inspect spike', exact: true }).click();
  251 |     await expect(page.locator('[data-ready="true"]')).toBeVisible();
  252 |     await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  253 |     await page.getByTestId('chart-loss').focus();
  254 |     await page.keyboard.press('Home');
  255 |     await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('490,000');
  256 |     const canvas = page.getByTestId('chart-loss').locator('canvas').first();
  257 |     expect(await canvas.evaluate(node => (node as HTMLCanvasElement).width)).toBeGreaterThan(await canvas.evaluate(node => node.getBoundingClientRect().width * 1.9));
  258 |   });
  259 | });
  260 | 
```