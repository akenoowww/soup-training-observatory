# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: observatory.spec.ts >> a worker failure never substitutes fabricated values and has a working retry path
- Location: tests/e2e/observatory.spec.ts:218:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Try again' })
    - locator resolved to <button class="button button--primary">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4]:
    - /url: "#main"
  - complementary "Workspace" [ref=e5]:
    - link "Soup home" [ref=e7]:
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
      - link "Training runs 20" [ref=e24]:
        - /url: "#/"
        - generic [ref=e29]: Training runs
        - generic [ref=e30]: "20"
      - link "Field guide" [ref=e31]:
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
          - link "Training runs" [ref=e73]:
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
            - generic [ref=e124]: "0.2799"
            - generic [ref=e125]: Latest recorded valueUnsmoothed
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
              - button "Zoom out" [disabled] [ref=e174]
              - button "Reset zoom" [disabled] [ref=e178]
          - generic [ref=e184]:
            - generic [ref=e185]: ↗
            - generic [ref=e186]:
              - strong [ref=e187]: A spike worth noticing.
              - text: Loss reaches 9.4 at step 500,000. The full-range chart preserves it.
            - button "Inspect spike" [ref=e188] [cursor=pointer]
          - generic [ref=e191]:
            - region "Training loss" [ref=e192]:
              - generic [ref=e193]:
                - generic [ref=e194]:
                  - heading "Training loss" [level=3] [ref=e195]
                  - paragraph [ref=e197]: Lower is better
                - generic [ref=e198]:
                  - strong [ref=e199]: "0.279923"
                  - generic [ref=e200]: Latest in view
              - group "Training loss visible range statistics" [ref=e201]:
                - generic [ref=e202]:
                  - text: Min
                  - strong [ref=e203]: "0.212466"
                - generic [ref=e204]:
                  - text: Max
                  - strong [ref=e205]: "9.4"
                - generic [ref=e206]: Step 0 – 999,999
              - group "Training loss interactive chart" [ref=e207]:
                - paragraph [ref=e208]: Training loss. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
              - status [ref=e217]
              - generic [ref=e218]: Training step
              - generic [ref=e219]:
                - generic [ref=e220]: 3,980 entries / 1,000,000 unique observations
                - generic [ref=e224]: No smoothing
              - group [ref=e225]:
                - generic "Inspect plotted values +" [ref=e226] [cursor=pointer]
            - generic [ref=e229]:
              - region "Learning rate" [ref=e230]:
                - generic [ref=e231]:
                  - generic [ref=e232]:
                    - heading "Learning rate" [level=3] [ref=e233]
                    - paragraph [ref=e235]: Optimizer step size
                  - generic [ref=e236]:
                    - strong [ref=e237]: "0"
                    - generic [ref=e238]: Latest in view
                - group "Learning rate visible range statistics" [ref=e239]:
                  - generic [ref=e240]:
                    - text: Min
                    - strong [ref=e241]: "0"
                  - generic [ref=e242]:
                    - text: Max
                    - strong [ref=e243]: "3.0000e-4"
                  - generic [ref=e244]: Step 0 – 999,999
                - group "Learning rate interactive chart" [ref=e245]:
                  - paragraph [ref=e246]: Learning rate. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
                - status [ref=e255]
                - generic [ref=e256]: Training step
                - generic [ref=e257]:
                  - generic [ref=e258]: 2,000 entries / 1,000,000 unique observations
                  - generic [ref=e262]: No smoothing
                - group [ref=e263]:
                  - generic "Inspect plotted values +" [ref=e264] [cursor=pointer]
              - region "Gradient norm" [ref=e267]:
                - generic [ref=e268]:
                  - generic [ref=e269]:
                    - heading "Gradient norm" [level=3] [ref=e270]
                    - paragraph [ref=e272]: Gradient magnitude
                  - generic [ref=e273]:
                    - strong [ref=e274]: "0.250633"
                    - generic [ref=e275]: Latest in view
                - group "Gradient norm visible range statistics" [ref=e276]:
                  - generic [ref=e277]:
                    - text: Min
                    - strong [ref=e278]: "0.245155"
                  - generic [ref=e279]:
                    - text: Max
                    - strong [ref=e280]: "12.8"
                  - generic [ref=e281]: Step 0 – 999,999
                - group "Gradient norm interactive chart" [ref=e282]:
                  - paragraph [ref=e283]: Gradient norm. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
                - status [ref=e292]
                - generic [ref=e293]: Training step
                - generic [ref=e294]:
                  - generic [ref=e295]: 3,974 entries / 1,000,000 unique observations
                  - generic [ref=e299]: No smoothing
                - group [ref=e300]:
                  - generic "Inspect plotted values +" [ref=e301] [cursor=pointer]
          - generic [ref=e304]:
            - generic [ref=e305]: Step range
            - generic [ref=e306]:
              - generic [ref=e307]: Start step
              - spinbutton "Start step" [ref=e308]: "0"
            - generic [ref=e309]: —
            - generic [ref=e310]:
              - generic [ref=e311]: End step
              - spinbutton "End step" [ref=e312]: "999999"
            - button "Apply range" [ref=e313] [cursor=pointer]
            - button "Reset" [ref=e314] [cursor=pointer]
            - generic [ref=e315]: Drag a chart to zoom. All charts stay in step.
          - generic [ref=e316]:
            - paragraph [ref=e319]: Showing 3,980 retained loss entries from 1,000,000 unique observations in view. Entries can include gap markers. Minimum and maximum values are retained in each bucket. Missing and non-finite values break the line.
            - link "How to read this" [ref=e320]:
              - /url: "#/guide"
    - contentinfo [ref=e323]:
      - generic [ref=e324]: Built for the signal, including the noise.
      - generic [ref=e327]:
        - text: SOUP OBSERVATORY
        - generic [ref=e328]: / 1.0
```

# Test source

```ts
  126 | });
  127 | 
  128 | test('log scale discloses zero exclusions and linear restores the measured zero', async ({
  129 |   page,
  130 | }) => {
  131 |   await openRun(page, 'run-008', '?min=595&max=610');
  132 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', '0');
  133 |   await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
  134 |   await expect(page.locator('.metric-chart--loss')).toContainText(/plotted zero or negative/);
  135 |   await expect(page.locator('.metric-chart--loss')).toContainText('excluded from the log scale');
  136 |   await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('linear');
  137 |   await expect(page.locator('.metric-chart--loss .metric-chart__warning')).toHaveCount(0);
  138 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', '0');
  139 | });
  140 | 
  141 | test('rapid run switching never paints previous run measurements under the next run title', async ({
  142 |   page,
  143 | }) => {
  144 |   await page.goto('/#/runs/run-001');
  145 |   await expect(page.getByRole('heading', { name: 'llama-3.1-8b-finetune' })).toBeVisible();
  146 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  147 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  148 |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  149 |   await expect(page.locator('[data-run-id="run-003"]')).toHaveAttribute('data-ready', 'true');
  150 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  151 |   const max = Number(await page.getByTestId('chart-loss').getAttribute('data-max-value'));
  152 |   expect(max).toBeLessThan(4);
  153 |   await expect(page.locator('.metric-chart--loss')).toContainText('non-finite');
  154 | });
  155 | 
  156 | test('keyboard search opens a run and chart keyboard inspection reveals measured values', async ({
  157 |   page,
  158 | }) => {
  159 |   await page.goto('/#/');
  160 |   await page.keyboard.press('Control+k');
  161 |   await expect(page.getByRole('dialog')).toBeVisible();
  162 |   await page.getByRole('textbox', { name: 'Find a training run' }).fill('whisper');
  163 |   await page.keyboard.press('Tab');
  164 |   await page.keyboard.press('Tab');
  165 |   await page.keyboard.press('Enter');
  166 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  167 |   await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  168 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  169 |   await page.getByTestId('chart-loss').focus();
  170 |   await page.keyboard.press('Home');
  171 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  172 |     'Sampled step 0',
  173 |   );
  174 |   await page.keyboard.press('End');
  175 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('21,599');
  176 | });
  177 | 
  178 | test('export identifies a sampled viewport and retains spike numeric value', async ({ page }) => {
  179 |   await openRun(page, 'run-001', '?min=499999&max=500001');
  180 |   const downloadEvent = page.waitForEvent('download');
  181 |   await page.getByRole('button', { name: 'Export view' }).click();
  182 |   const download = await downloadEvent;
  183 |   expect(download.suggestedFilename()).toBe('run-001-sampled-viewport.csv');
  184 |   const path = await download.path();
  185 |   expect(path).not.toBeNull();
  186 |   const csv = await readFile(path!, 'utf8');
  187 |   expect(csv).toContain('metric,step,value');
  188 |   expect(csv).toContain('loss,500000,9.4');
  189 |   await expect(
  190 |     page.getByRole('status').filter({ hasText: 'Sampled viewport exported.' }),
  191 |   ).toBeVisible();
  192 | });
  193 | 
  194 | test('mobile layout fits viewport and navigation remains reachable', async ({ page }) => {
  195 |   await page.setViewportSize({ width: 390, height: 844 });
  196 |   await page.goto('/#/');
  197 |   await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  198 |   expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  199 |   await page.getByRole('button', { name: 'Open navigation' }).click();
  200 |   await page.getByRole('link', { name: 'Field guide' }).click();
  201 |   await expect(page.getByRole('heading', { name: 'Look closer. Keep the signal.' })).toBeVisible();
  202 |   await openRun(page);
  203 |   expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  204 |   await expect(page.getByTestId('chart-loss')).toBeVisible();
  205 |   await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  206 |   await waitRenderedViewport(page, 999999 / 4, (999999 * 3) / 4);
  207 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  208 | });
  209 | 
  210 | test('unknown run fails clearly with a working recovery route', async ({ page }) => {
  211 |   await page.goto('/#/runs/does-not-exist');
  212 |   await expect(page.getByRole('heading', { name: 'Run not found' })).toBeVisible();
  213 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  214 |   await page.getByRole('link', { name: 'Back to training runs' }).click();
  215 |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  216 | });
  217 | 
  218 | test('a worker failure never substitutes fabricated values and has a working retry path', async ({
  219 |   page,
  220 | }) => {
  221 |   await page.route(/data\.worker-[^/]+\.js(?:\?.*)?$/, (route) => route.abort('failed'));
  222 |   await page.goto('/#/runs/run-001');
  223 |   await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  224 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  225 |   await page.unroute(/data\.worker-[^/]+\.js(?:\?.*)?$/);
> 226 |   await page.getByRole('button', { name: 'Try again', exact: false }).click();
      |                                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  227 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  228 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  229 | });
  230 | 
  231 | test('an entirely invalid viewport shows unavailable values and never fabricates a zero curve', async ({
  232 |   page,
  233 | }) => {
  234 |   await openRun(page, 'run-003', '?min=4200&max=4210');
  235 |   await expect(page.locator('.metric-chart--loss')).toContainText('No finite values in this range');
  236 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  237 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', 'missing');
  238 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', 'missing');
  239 |   await page.locator('.metric-chart--loss summary').click();
  240 |   await expect(
  241 |     page.getByRole('table', { name: 'Plotted training loss values', exact: true }).locator('tbody'),
  242 |   ).toContainText('Missing / excluded');
  243 | });
  244 | 
  245 | test('initial worker loading exposes a reserved loading view before any chart is drawn', async ({
  246 |   page,
  247 | }) => {
  248 |   let release: () => void = () => {};
  249 |   const gate = new Promise<void>((resolve) => {
  250 |     release = resolve;
  251 |   });
  252 |   await page.route(/data\.worker-[^/]+\.js(?:\?.*)?$/, async (route) => {
  253 |     await gate;
  254 |     await route.continue();
  255 |   });
  256 |   await page.goto('/#/runs/run-001');
  257 |   await expect(page.getByRole('status', { name: 'Loading run metrics' })).toBeVisible();
  258 |   await expect(page.getByText('Preparing training metrics…', { exact: true })).toBeVisible();
  259 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  260 |   release();
  261 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  262 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  263 | });
  264 | 
```