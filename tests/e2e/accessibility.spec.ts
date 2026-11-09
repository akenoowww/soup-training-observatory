import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** This is an automated rule check on the actual rendered state. Incomplete
 * checks remain in the artifact rather than being suppressed or counted as a
 * pass. Screen-reader usability, physical touch targets and subjective visual
 * interpretation still require separate human/device evaluation. */
async function audit(page: Page, info: TestInfo, state: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  const results = await new AxeBuilder({ page }).withTags(tags).analyze();
  const directory = 'evidence/round2/accessibility';
  await mkdir(directory, { recursive: true });
  const artifact = {
    capturedAt: new Date().toISOString(),
    project: info.project.name,
    browserVersion: page.context().browser()?.version() ?? 'unknown',
    url: page.url(),
    viewport: page.viewportSize(),
    state,
    tags,
    axeVersion: results.testEngine.version,
    counts: {
      passes: results.passes.length,
      inapplicable: results.inapplicable.length,
      violations: results.violations.length,
      incomplete: results.incomplete.length,
    },
    violations: results.violations,
    incomplete: results.incomplete,
    limits: [
      'Automated WCAG rule checks on this captured browser state only; not an accessibility conformance claim.',
      'Incomplete checks require manual assessment and are not silently treated as passes.',
      'No physical-device ergonomics, assistive-technology usability or full application-state coverage is established by this artifact.',
    ],
  };
  const body = JSON.stringify(artifact, null, 2);
  await writeFile(`${directory}/${info.project.name}-${state}.json`, body);
  await info.attach(`axe-${state}`, { body, contentType: 'application/json' });
  expect(
    results.violations,
    `Confirmed accessibility violations in ${state}; full violations and incomplete checks are retained in the JSON artifact`,
  ).toEqual([]);
}

async function loadedRun(page: Page) {
  await page.goto('/#/runs/run-001');
  await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByTestId('chart-loss')).toBeVisible();
}

test('automatic accessibility rules cover the full run browser', async ({ page }, info) => {
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  await audit(page, info, 'run-browser');
});

test('automatic accessibility rules cover loaded numeric charts and their controls', async ({
  page,
}, info) => {
  await loadedRun(page);
  await audit(page, info, 'loaded-run');
  await page.locator('.metric-chart--loss summary').click();
  await expect(
    page.getByRole('table', { name: 'Plotted training loss values', exact: true }),
  ).toBeVisible();
  await audit(page, info, 'loaded-run-inspector');
});

test('automatic accessibility rules cover the open search modal', async ({ page }, info) => {
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  await page.getByRole('button', { name: 'Search runs', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Find a training run' })).toBeFocused();
  await audit(page, info, 'search-modal');
});

test('automatic accessibility rules cover the open narrow-screen navigation', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Main navigation' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Field guide' })).toBeVisible();
  await audit(page, info, 'mobile-navigation');
});
