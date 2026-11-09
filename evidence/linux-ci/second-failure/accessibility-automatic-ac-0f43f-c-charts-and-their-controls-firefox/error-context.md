# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> automatic accessibility rules cover loaded numeric charts and their controls
- Location: tests/e2e/accessibility.spec.ts:66:1

# Error details

```
Error: frame.evaluate: Page crashed
```

# Test source

```ts
  1  | import AxeBuilder from '@axe-core/playwright';
  2  | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  3  | import { mkdir, writeFile } from 'node:fs/promises';
  4  | 
  5  | const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  6  | 
  7  | /** This is an automated rule check on the actual rendered state. Incomplete
  8  |  * checks remain in the artifact rather than being suppressed or counted as a
  9  |  * pass. Screen-reader usability, physical touch targets and subjective visual
  10 |  * interpretation still require separate human/device evaluation. */
  11 | async function audit(page: Page, info: TestInfo, state: string) {
  12 |   await page.evaluate(async () => {
  13 |     await document.fonts.ready;
  14 |     await new Promise<void>((resolve) =>
  15 |       requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  16 |     );
  17 |   });
> 18 |   const results = await new AxeBuilder({ page }).withTags(tags).analyze();
     |                   ^ Error: frame.evaluate: Page crashed
  19 |   const directory = 'evidence/round2/accessibility';
  20 |   await mkdir(directory, { recursive: true });
  21 |   const artifact = {
  22 |     capturedAt: new Date().toISOString(),
  23 |     project: info.project.name,
  24 |     browserVersion: page.context().browser()?.version() ?? 'unknown',
  25 |     url: page.url(),
  26 |     viewport: page.viewportSize(),
  27 |     state,
  28 |     tags,
  29 |     axeVersion: results.testEngine.version,
  30 |     counts: {
  31 |       passes: results.passes.length,
  32 |       inapplicable: results.inapplicable.length,
  33 |       violations: results.violations.length,
  34 |       incomplete: results.incomplete.length,
  35 |     },
  36 |     violations: results.violations,
  37 |     incomplete: results.incomplete,
  38 |     limits: [
  39 |       'Automated WCAG rule checks on this captured browser state only; not an accessibility conformance claim.',
  40 |       'Incomplete checks require manual assessment and are not silently treated as passes.',
  41 |       'No physical-device ergonomics, assistive-technology usability or full application-state coverage is established by this artifact.',
  42 |     ],
  43 |   };
  44 |   const body = JSON.stringify(artifact, null, 2);
  45 |   await writeFile(`${directory}/${info.project.name}-${state}.json`, body);
  46 |   await info.attach(`axe-${state}`, { body, contentType: 'application/json' });
  47 |   expect(
  48 |     results.violations,
  49 |     `Confirmed accessibility violations in ${state}; full violations and incomplete checks are retained in the JSON artifact`,
  50 |   ).toEqual([]);
  51 | }
  52 | 
  53 | async function loadedRun(page: Page) {
  54 |   await page.goto('/#/runs/run-001');
  55 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  56 |   await expect(page.getByTestId('chart-loss')).toBeVisible();
  57 | }
  58 | 
  59 | test('automatic accessibility rules cover the full run browser', async ({ page }, info) => {
  60 |   await page.goto('/#/');
  61 |   await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  62 |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  63 |   await audit(page, info, 'run-browser');
  64 | });
  65 | 
  66 | test('automatic accessibility rules cover loaded numeric charts and their controls', async ({
  67 |   page,
  68 | }, info) => {
  69 |   await loadedRun(page);
  70 |   await audit(page, info, 'loaded-run');
  71 |   await page.locator('.metric-chart--loss summary').click();
  72 |   await expect(
  73 |     page.getByRole('table', { name: 'Plotted training loss values', exact: true }),
  74 |   ).toBeVisible();
  75 |   await audit(page, info, 'loaded-run-inspector');
  76 | });
  77 | 
  78 | test('automatic accessibility rules cover the open search modal', async ({ page }, info) => {
  79 |   await page.goto('/#/');
  80 |   await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  81 |   await page.getByRole('button', { name: 'Search runs', exact: true }).click();
  82 |   await expect(page.getByRole('dialog')).toBeVisible();
  83 |   await expect(page.getByRole('textbox', { name: 'Find a training run' })).toBeFocused();
  84 |   await audit(page, info, 'search-modal');
  85 | });
  86 | 
  87 | test('automatic accessibility rules cover the open narrow-screen navigation', async ({
  88 |   page,
  89 | }, info) => {
  90 |   await page.setViewportSize({ width: 390, height: 844 });
  91 |   await page.goto('/#/');
  92 |   await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  93 |   await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  94 |   await expect(page.getByRole('dialog', { name: 'Main navigation' })).toBeVisible();
  95 |   await expect(page.getByRole('link', { name: 'Field guide' })).toBeVisible();
  96 |   await audit(page, info, 'mobile-navigation');
  97 | });
  98 | 
```