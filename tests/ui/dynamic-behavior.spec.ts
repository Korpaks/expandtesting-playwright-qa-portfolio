import { test, expect } from '@playwright/test';

test.describe('Dynamic and resilient UI behavior', () => {
  test('waits for a checkbox to be removed asynchronously', async ({ page }) => {
    await page.goto('/dynamic-controls');
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(page.locator('#message')).toHaveText(/gone/i);
  });

  test('waits for an input to become enabled', async ({ page }) => {
    await page.goto('/dynamic-controls');
    const input = page.locator('#input-example input');
    await expect(input).toBeDisabled();
    await page.getByRole('button', { name: 'Enable' }).click();
    await expect(input).toBeEnabled();
    await input.fill('Ready after async update');
    await expect(input).toHaveValue('Ready after async update');
  });

  test('waits for dynamically loaded content', async ({ page }) => {
    await page.goto('/dynamic-loading/1');
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('#finish')).toContainText('Hello World!');
  });

  test('adds and removes elements without stale references', async ({ page }) => {
    await page.goto('/add-remove-elements');
    await page.getByRole('button', { name: 'Add Element' }).click();
    await page.getByRole('button', { name: 'Add Element' }).click();
    const remove = page.getByRole('button', { name: 'Delete' });
    await expect(remove).toHaveCount(2);
    await remove.first().click();
    await expect(remove).toHaveCount(1);
  });

  test('uses keyboard input on the key presses page', async ({ page }) => {
    await page.goto('/key-presses');
    await page.locator('body').press('Escape');
    await expect(page.locator('#result')).toContainText('ESCAPE');
  });
});

