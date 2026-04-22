import { test, expect } from '@playwright/test';

test.describe('Error Pages', () => {
  test('404 page shown for invalid URL', async ({ page }) => {
    await page.goto('/some-random-url-that-does-not-exist');
    await expect(page.getByRole('heading', { name: /Page Not Found/i })).toBeVisible();
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('button', { name: /Go to Home/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Go Back/i })).toBeVisible();
  });

  test('404 page "Go to Home" button works', async ({ page }) => {
    await page.goto('/invalid-page');
    await page.getByRole('button', { name: /Go to Home/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('404 page shown for nested invalid admin URL', async ({ page }) => {
    await page.goto('/admin/non-existent-section');
    // Should show 404 (unless it's a protected route redirecting to login first)
    // Non-admin will be redirected, but 404 layout should be consistent
    const is404 = await page.getByRole('heading', { name: /Page Not Found/i }).isVisible().catch(() => false);
    const isLogin = page.url().includes('/login');
    expect(is404 || isLogin).toBeTruthy();
  });
});
