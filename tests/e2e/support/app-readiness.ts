import { expect, type Page } from '@playwright/test';

/** A document load event does not establish that a scheduled React render and
 * its passive effects have reached a painted, interactive application surface. */
export async function waitForRunBrowser(page: Page) {
  await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search runs', exact: true })).toBeEnabled();
  await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  // Observe actual rendering turns; do not introduce a machine-dependent delay.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
