# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adversarial.spec.ts >> layout and reachable keyboard navigation at 320px
- Location: tests/e2e/adversarial.spec.ts:229:3

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('button', { name: 'Open navigation' })
Expected: focused
Received: inactive
Timeout:  10000ms

Call log:
  - Expect "toBeFocused" getByRole('button', { name: 'Open navigation' }) with timeout 10000ms
  - waiting for getByRole('button', { name: 'Open navigation' })
    24 × locator resolved to <button aria-label="Open navigation" class="icon-button mobile-menu">…</button>
       - unexpected value "inactive"

```

```yaml
- button "Open navigation":
  - img
```

# Test source

```ts
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
  162 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('16,199');
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
> 238 |       await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
      |                                                                           ^ Error: expect(locator).toBeFocused() failed
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