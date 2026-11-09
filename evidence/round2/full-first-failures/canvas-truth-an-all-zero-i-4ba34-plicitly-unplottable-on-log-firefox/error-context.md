# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: canvas-truth.spec.ts >> an all-zero interval stays a real zero line on linear and becomes explicitly unplottable on log
- Location: tests/e2e/canvas-truth.spec.ts:317:1

# Error details

```
Error: linear mode must draw the genuine zero measurements

expect(received).toBeGreaterThan(expected)

Expected: > 20
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
    - generic [ref=e39]:
      - generic [ref=e40]: PROJECT
      - generic [ref=e41]: Foundation models
      - generic [ref=e43]: 20 experiments · 3 metrics
    - generic [ref=e44]:
      - generic [ref=e50]:
        - strong [ref=e51]: A little room to experiment.
        - paragraph [ref=e52]: Explore synthetic runs. Your production training is untouched.
      - generic [ref=e53]:
        - generic [ref=e54]: SC
        - generic [ref=e55]:
          - strong [ref=e56]: Soup collective
          - generic [ref=e57]: Research workspace
  - generic [ref=e58]:
    - banner [ref=e59]:
      - generic [ref=e60]:
        - generic [ref=e61]: Foundation models
        - generic [ref=e62]: /
        - generic [ref=e63]: Training runs
      - generic [ref=e64]:
        - generic [ref=e65]: Synthetic data
        - button "Search runs" [ref=e68] [cursor=pointer]
        - generic [ref=e72]: SC
    - main [ref=e73]:
      - generic [ref=e74]:
        - generic [ref=e75]:
          - link "Training runs" [ref=e76] [cursor=pointer]:
            - /url: "#/"
          - generic [ref=e79]: run-008
          - generic [ref=e80]:
            - button "Previous run" [ref=e81] [cursor=pointer]
            - generic [ref=e85]: 8 / 20
            - button "Next run" [ref=e86] [cursor=pointer]
        - generic [ref=e90]:
          - generic [ref=e91]:
            - generic [ref=e92]:
              - heading "qwen2.5-7b-dpo" [level=1] [ref=e93]
              - generic [ref=e94]: Stopped
            - generic [ref=e96]:
              - generic [ref=e97]: Qwen 2.5
              - generic [ref=e99]: UltraFeedback
              - generic [ref=e101]: Nov 9, 07:03 UTC
          - generic [ref=e102]:
            - button "Save run" [ref=e103] [cursor=pointer]
            - button "Export view" [ref=e106] [cursor=pointer]
            - button "Reload snapshot" [ref=e111] [cursor=pointer]
        - generic [ref=e117]:
          - generic [ref=e118]: experiment
          - generic [ref=e119]: 19.9K source points
        - generic [ref=e124]:
          - generic [ref=e125]:
            - generic [ref=e126]: Latest loss
            - generic [ref=e130]: "0.0000"
            - generic [ref=e131]: In selected rangeUnsmoothed
          - generic [ref=e133]:
            - generic [ref=e134]: Training steps
            - generic [ref=e140]: 19,899
            - generic [ref=e141]: of 23,880 planned steps
          - generic [ref=e142]:
            - generic [ref=e143]: Run duration
            - generic [ref=e148]: 3h 0m
            - generic [ref=e149]: At the recorded snapshot
          - generic [ref=e150]:
            - generic [ref=e151]: Quality findings
            - generic [ref=e157]: "01"
            - button "Inspect data quality" [ref=e158] [cursor=pointer]
        - tablist "Run views" [ref=e162]:
          - tab "Metrics" [selected] [ref=e163] [cursor=pointer]
          - tab "Data quality 1" [ref=e164] [cursor=pointer]:
            - text: Data quality
            - generic [ref=e165]: "1"
          - tab "Run details" [ref=e166] [cursor=pointer]
          - generic [ref=e167]: Snapshot · not streaming
        - tabpanel "Metrics" [ref=e169]:
          - generic [ref=e170]:
            - generic [ref=e171]:
              - generic [ref=e172]: TRAINING METRICS
              - generic [ref=e173]: Extrema preserved · no smoothing
            - generic [ref=e174]:
              - generic [ref=e175]:
                - generic [ref=e176]: Scale
                - combobox "Chart scale" [ref=e177]:
                  - option "Linear" [selected]
                  - option "Logarithmic"
              - button "Zoom in" [ref=e179] [cursor=pointer]
              - button "Zoom out" [ref=e185] [cursor=pointer]
              - button "Reset zoom" [ref=e190] [cursor=pointer]
          - generic [ref=e196]:
            - region "Training loss" [ref=e197]:
              - generic [ref=e198]:
                - generic [ref=e199]:
                  - heading "Training loss" [level=3] [ref=e200]
                  - paragraph [ref=e202]: Lower is better
                - generic [ref=e203]:
                  - strong [ref=e204]: "0"
                  - generic [ref=e205]: Latest in view
              - group "Training loss visible range statistics" [ref=e206]:
                - generic [ref=e207]:
                  - text: Min
                  - strong [ref=e208]: "0"
                - generic [ref=e209]:
                  - text: Max
                  - strong [ref=e210]: "0"
                - generic [ref=e211]: Step 600 – 605
              - group "Training loss interactive chart" [ref=e212]:
                - paragraph [ref=e213]: Training loss. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
              - status [ref=e222]
              - generic [ref=e223]: Training step
              - generic [ref=e224]:
                - generic [ref=e225]: 6 entries / 6 unique observations
                - generic [ref=e229]: No smoothing
              - group [ref=e230]:
                - generic "Inspect plotted values +" [ref=e231] [cursor=pointer]
            - generic [ref=e242]:
              - region "Learning rate" [ref=e243]:
                - generic [ref=e244]:
                  - generic [ref=e245]:
                    - heading "Learning rate" [level=3] [ref=e246]
                    - paragraph [ref=e248]: Optimizer step size
                  - generic [ref=e249]:
                    - strong [ref=e250]: "0"
                    - generic [ref=e251]: Latest in view
                - group "Learning rate visible range statistics" [ref=e252]:
                  - generic [ref=e253]:
                    - text: Min
                    - strong [ref=e254]: "0"
                  - generic [ref=e255]:
                    - text: Max
                    - strong [ref=e256]: "0"
                  - generic [ref=e257]: Step 600 – 605
                - group "Learning rate interactive chart" [ref=e258]:
                  - paragraph [ref=e259]: Learning rate. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
                - status [ref=e268]
                - generic [ref=e269]: Training step
                - generic [ref=e270]:
                  - generic [ref=e271]: 6 entries / 6 unique observations
                  - generic [ref=e275]: No smoothing
                - group [ref=e276]:
                  - generic "Inspect plotted values +" [ref=e277] [cursor=pointer]
              - region "Gradient norm" [ref=e288]:
                - generic [ref=e289]:
                  - generic [ref=e290]:
                    - heading "Gradient norm" [level=3] [ref=e291]
                    - paragraph [ref=e293]: Gradient magnitude
                  - generic [ref=e294]:
                    - strong [ref=e295]: "1.69608"
                    - generic [ref=e296]: Latest in view
                - group "Gradient norm visible range statistics" [ref=e297]:
                  - generic [ref=e298]:
                    - text: Min
                    - strong [ref=e299]: "1.67867"
                  - generic [ref=e300]:
                    - text: Max
                    - strong [ref=e301]: "1.69608"
                  - generic [ref=e302]: Step 600 – 605
                - group "Gradient norm interactive chart" [ref=e303]:
                  - paragraph [ref=e304]: Gradient norm. Numeric training step on the horizontal axis; linear vertical scale. Drag to zoom, double-click to reset. Use left and right arrows to inspect plotted samples, Shift for ten samples, Home and End for boundaries, plus and minus to zoom. Missing values break the line; isolated finite measurements are drawn as points. Hover shows sampled values, not every raw step.
                - status [ref=e313]
                - generic [ref=e314]: Training step
                - generic [ref=e315]:
                  - generic [ref=e316]: 6 entries / 6 unique observations
                  - generic [ref=e320]: No smoothing
                - group [ref=e321]:
                  - generic "Inspect plotted values +" [ref=e322] [cursor=pointer]
          - generic [ref=e333]:
            - generic [ref=e334]: Step range
            - generic [ref=e335]:
              - generic [ref=e336]: Start step
              - spinbutton "Start step" [ref=e337]: "600"
            - generic [ref=e338]: —
            - generic [ref=e339]:
              - generic [ref=e340]: End step
              - spinbutton "End step" [ref=e341]: "605"
            - button "Apply range" [ref=e342] [cursor=pointer]
            - button "Reset" [ref=e343] [cursor=pointer]
            - generic [ref=e344]: Drag a chart to zoom. All charts stay in step.
          - generic [ref=e345]:
            - paragraph [ref=e350]: Showing 6 retained loss entries from 6 unique observations in view. Entries can include gap markers. Minimum and maximum values are retained in each bucket. Missing and non-finite values break the line.
            - link "How to read this" [ref=e351] [cursor=pointer]:
              - /url: "#/guide"
    - contentinfo [ref=e354]:
      - generic [ref=e355]: Built for the signal, including the noise.
      - generic [ref=e358]:
        - text: SOUP OBSERVATORY
        - generic [ref=e359]: / 1.0
```

# Test source

```ts
  223 |     expect(stepTicks.length).toBeGreaterThanOrEqual(2);
  224 |     expect(new Set(stepTicks.map((label) => label.text)).size).toBe(stepTicks.length);
  225 |     const values = stepTicks.map((label) => parseLabel(label.text));
  226 |     expect(values.every((value) => value >= 999998 && value <= 999999)).toBe(true);
  227 |   }
  228 |   // This source includes exact zero at the final step and a tiny positive lr at
  229 |   // the preceding step. The actual y labels must not collapse every value to 0.
  230 |   const lrLabels = (await labelsFor(page, 'lr')).filter(
  231 |     (label) => label.baseline === 'middle' && label.align === 'right',
  232 |   );
  233 |   const positive = lrLabels.map((label) => parseLabel(label.text)).filter((value) => value > 0);
  234 |   expect(positive.length).toBeGreaterThan(0);
  235 |   expect(Math.max(...positive)).toBeLessThan(0.000001);
  236 |   expect(new Set(lrLabels.map((label) => label.text)).size).toBe(lrLabels.length);
  237 | });
  238 | 
  239 | test('a finite singleton between missing measurements paints a real point and a later empty response clears it', async ({
  240 |   page,
  241 | }) => {
  242 |   await page.addInitScript(() => {
  243 |     const state = window as unknown as { __soupSingletonMode: 'point' | 'empty' };
  244 |     state.__soupSingletonMode = 'point';
  245 |     const NativeWorker = window.Worker;
  246 |     window.Worker = class extends NativeWorker {
  247 |       constructor(url: string | URL, options?: WorkerOptions) {
  248 |         super(url, options);
  249 |         // The real module worker still generates and sends the response. The
  250 |         // listener changes this one series before the application receives it,
  251 |         // exercising the production Worker/client/query/Canvas integration.
  252 |         this.addEventListener(
  253 |           'message',
  254 |           (event: MessageEvent) => {
  255 |             const detail = event.data?.detail;
  256 |             if (detail?.run?.id !== 'run-003' || detail.metrics.loss.rawCount !== 13) return;
  257 |             const point = state.__soupSingletonMode === 'point';
  258 |             Object.assign(detail.metrics.loss, {
  259 |               x: [4199, 4205, 4211],
  260 |               y: point ? [null, 9.4, null] : [null, null, null],
  261 |               renderedCount: 3,
  262 |               invalidCount: point ? 12 : 13,
  263 |               min: point ? 9.4 : null,
  264 |               max: point ? 9.4 : null,
  265 |               latest: null,
  266 |             });
  267 |           },
  268 |           { capture: true },
  269 |         );
  270 |       }
  271 |     };
  272 |   });
  273 |   await openRun(page, 'run-003', 4199, 4211);
  274 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  275 |   const point = await greenInkInPlot(page, [[0.3, 0.7]]);
  276 |   expect(
  277 |     point[0],
  278 |     'an isolated finite measurement needs a visible point because it has no line segment',
  279 |   ).toBeGreaterThan(8);
  280 |   await page.evaluate(() => {
  281 |     (window as unknown as { __soupSingletonMode: string }).__soupSingletonMode = 'empty';
  282 |   });
  283 |   await page.getByRole('button', { name: 'Reload snapshot', exact: true }).click();
  284 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', 'missing');
  285 |   await expect(page.locator('.metric-chart--loss')).toContainText('No finite values in this range');
  286 |   const empty = await greenInkInPlot(page, [[0.3, 0.7]]);
  287 |   expect(
  288 |     empty[0],
  289 |     'a previous finite singleton must not remain painted after the series becomes empty',
  290 |   ).toBe(0);
  291 | });
  292 | 
  293 | test('logarithmic axes draw only finite positive numeric tick labels', async ({ page }) => {
  294 |   await captureAxisDrawing(page);
  295 |   await openRun(page, 'run-008', 595, 610);
  296 |   await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
  297 |   await expect(page.locator('.metric-chart--loss')).toContainText('excluded from the log scale');
  298 |   await page.evaluate(
  299 |     () =>
  300 |       new Promise<void>((resolve) =>
  301 |         requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  302 |       ),
  303 |   );
  304 |   for (const metric of ['loss', 'lr', 'grad_norm']) {
  305 |     const yLabels = (await labelsFor(page, metric)).filter(
  306 |       (label) => label.baseline === 'middle' && label.align === 'right',
  307 |     );
  308 |     expect(yLabels.length, `${metric} must still render its actual log axis`).toBeGreaterThan(0);
  309 |     for (const label of yLabels) {
  310 |       expect(label.text).not.toMatch(/NaN|Infinity|—/u);
  311 |       expect(Number.isFinite(parseLabel(label.text))).toBe(true);
  312 |       expect(parseLabel(label.text)).toBeGreaterThan(0);
  313 |     }
  314 |   }
  315 | });
  316 | 
  317 | test('an all-zero interval stays a real zero line on linear and becomes explicitly unplottable on log', async ({
  318 |   page,
  319 | }) => {
  320 |   await captureAxisDrawing(page);
  321 |   await openRun(page, 'run-008', 600, 605);
  322 |   const linear = await greenInkInPlot(page, [[0.3, 0.7]]);
> 323 |   expect(linear[0], 'linear mode must draw the genuine zero measurements').toBeGreaterThan(20);
      |                                                                            ^ Error: linear mode must draw the genuine zero measurements
  324 |   await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
  325 |   await expect(page.locator('.metric-chart--loss')).toContainText(
  326 |     'No positive values in this range',
  327 |   );
  328 |   await expect(page.locator('.metric-chart--loss')).toContainText('plotted zero or negative');
  329 |   const log = await greenInkInPlot(page, [[0.3, 0.7]]);
  330 |   expect(log[0], 'zero must not be clamped to an invented small positive log value').toBe(0);
  331 |   const labels = (await labelsFor(page, 'loss')).filter((label) => label.baseline === 'middle');
  332 |   expect(labels.length).toBeGreaterThan(0);
  333 |   expect(
  334 |     labels.every((label) => Number.isFinite(parseLabel(label.text)) && parseLabel(label.text) > 0),
  335 |   ).toBe(true);
  336 |   await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('linear');
  337 |   await expect(page.locator('.metric-chart--loss .metric-chart__empty')).toHaveCount(0);
  338 |   const restored = await greenInkInPlot(page, [[0.3, 0.7]]);
  339 |   expect(restored[0], 'returning to linear restores the actual zero line').toBeGreaterThan(20);
  340 | });
  341 | 
```