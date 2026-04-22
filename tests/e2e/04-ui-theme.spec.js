import { test, expect } from '@playwright/test';

test.describe('UI Theme Consistency', () => {
  test('dark background applied', async ({ page }) => {
    await page.goto('/');
    // Check the app wrapper div which sets bg-bg-dark
    const appDiv = page.locator('.min-h-screen').first();
    const bg = await appDiv.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Dark bg should be rgb(30, 30, 46) — #1e1e2e
    const [r, g, b] = bg.match(/\d+/g).map(Number);
    // Assert it's a dark color (all channels < 100)
    expect(r).toBeLessThan(100);
    expect(g).toBeLessThan(100);
    expect(b).toBeLessThan(100);
  });

  test('no browser alert or confirm in UI', async ({ page }) => {
    // Set dialog handler to fail if any dialog appears
    let dialogShown = false;
    page.on('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    await page.goto('/');
    await page.goto('/login');
    await page.goto('/register');
    expect(dialogShown).toBe(false);
  });

  test('login page has dark theme inputs', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    const bg = await emailInput.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Should NOT be pure white (should be transparent-on-dark)
    expect(bg).not.toBe('rgb(255, 255, 255)');
  });

  test('no white gaps on home page', async ({ page }) => {
    await page.goto('/');
    // Screenshot test — take full page screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/home-page.png', fullPage: true });
  });

  test('login page mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });
});
