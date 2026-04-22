import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('shows salon name and book button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Welcome to');
    await expect(page.getByRole('button', { name: /Book Appointment/i })).toBeVisible();
  });

  test('shows how it works steps', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Choose Service')).toBeVisible();
    await expect(page.getByText('Pick Your Time')).toBeVisible();
    await expect(page.getByText('Confirm & Relax')).toBeVisible();
  });

  test('navbar shows Sign In for guests', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
  });

  test('Book Appointment redirects guests to login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Book Appointment/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
