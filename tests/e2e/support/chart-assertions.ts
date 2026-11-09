import { expect, type Page } from '@playwright/test';

/** A route/ready marker can still describe the preceding committed React view.
 * Wait for every renderer's actual requested domain before inspecting new data. */
export async function waitRenderedViewport(page: Page, min: number, max: number, timeout = 10_000) {
  await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue(String(min), {
    timeout,
  });
  await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue(String(max), {
    timeout,
  });
  for (const metric of ['loss', 'lr', 'grad_norm']) {
    await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-min', String(min), {
      timeout,
    });
    await expect(page.getByTestId(`chart-${metric}`)).toHaveAttribute('data-x-max', String(max), {
      timeout,
    });
  }
  await expect(page.locator('[data-ready="true"]')).toBeVisible({ timeout });
}
