import { test, expect } from '@playwright/test';
import path from 'node:path';

test.describe('Core UI interactions', () => {
  test('selects values in standard and country dropdowns', async ({ page }) => {
    await page.goto('/dropdown');
    const selects = page.locator('select');
    await selects.nth(0).selectOption({ index: 2 });
    await expect(selects.nth(0)).not.toHaveValue('');
    await selects.last().selectOption({ label: 'United States' });
    await expect(selects.last()).not.toHaveValue('');
  });

  test('toggles checkboxes and verifies state', async ({ page }) => {
    await page.goto('/checkboxes');
    const boxes = page.getByRole('checkbox');
    await boxes.nth(0).check();
    await boxes.nth(1).uncheck();
    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(1)).not.toBeChecked();
  });

  test('reveals user details on hover', async ({ page }) => {
    await page.goto('/hovers');
    const figure = page.locator('.figure').first();
    await figure.hover();
    await expect(figure.getByText('name: user1')).toBeVisible();
    await expect(figure.getByRole('link', { name: 'View profile' })).toBeVisible();
  });

  test('uploads a small file and confirms its name', async ({ page }) => {
    await page.goto('/upload');
    const fixture = path.resolve(__dirname, '../fixtures/upload-sample.txt');
    await page.locator('input[type=file]').setInputFiles(fixture);
    await page.getByRole('button', { name: 'Upload' }).click();
    await expect(page.locator('body')).toContainText('upload-sample.txt');
  });

  test('rejects an oversized upload safely', async ({ page }) => {
    await page.goto('/upload');
    const bytes = Buffer.alloc(501 * 1024, 'x');
    await page.locator('input[type=file]').setInputFiles({ name: 'too-large.txt', mimeType: 'text/plain', buffer: bytes });
    await page.getByRole('button', { name: 'Upload' }).click();
    await expect(page.locator('body')).toContainText(/500KB|too large|less than/i);
  });

  test('reads content inside the external TinyMCE iframe', async ({ page }) => {
    await page.goto('/iframe');
    const editor = page.frameLocator('iframe[title="Rich Text Area"]').locator('body');
    await expect(editor).toHaveText('Your content goes here.');
  });

  test('reads content from the internal subscription iframe', async ({ page }) => {
    await page.goto('/iframe');
    const internal = page.frameLocator('#email-subscribe');
    await expect(internal.getByRole('heading', { name: /send updates/i })).toBeVisible();
    await expect(internal.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  });

  test('handles an alert dialog', async ({ page }) => {
    await page.goto('/js-dialogs');
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      await dialog.accept();
    });
    await page.getByRole('button', { name: /JS Alert/i }).click();
    await expect(page.locator('#dialog-response')).toHaveText('OK');
  });

  test('opens a new window and validates its destination', async ({ page, context }) => {
    await page.goto('/windows');
    const popupPromise = context.waitForEvent('page');
    await page.getByRole('link', { name: /click here/i }).click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(/windows\/new/);
    await expect(popup.getByRole('heading')).toBeVisible();
  });
});
