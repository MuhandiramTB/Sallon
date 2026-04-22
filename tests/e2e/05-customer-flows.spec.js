import { test, expect } from '@playwright/test';
import { registerCustomer, uniqueEmail, uniquePhone } from './helpers.js';

test.describe('Customer Flows', () => {
  test('customer sees services page after login', async ({ page }) => {
    await registerCustomer(page, {
      name: 'Test Customer',
      email: uniqueEmail(),
      phone: uniquePhone(),
      password: 'password123',
    });
    await page.click('a:has-text("Services")');
    await expect(page.getByRole('heading', { name: /Our Services/i })).toBeVisible();
  });

  test('customer can access My Bookings', async ({ page }) => {
    await registerCustomer(page, {
      name: 'Test Customer',
      email: uniqueEmail(),
      phone: uniquePhone(),
      password: 'password123',
    });
    await page.goto('/my-bookings');
    await expect(page.getByRole('heading', { name: /My Bookings/i })).toBeVisible();
  });

  test('customer can access Profile', async ({ page }) => {
    await registerCustomer(page, {
      name: 'Test Customer',
      email: uniqueEmail(),
      phone: uniquePhone(),
      password: 'password123',
    });
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /My Profile/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Personal Details/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Change Password/i })).toBeVisible();
  });

  test('customer cannot access admin pages', async ({ page }) => {
    await registerCustomer(page, {
      name: 'Test Customer',
      email: uniqueEmail(),
      phone: uniquePhone(),
      password: 'password123',
    });
    await page.goto('/admin');
    await expect(page).toHaveURL('/');
  });

  test('unauthenticated user redirected from protected routes', async ({ page }) => {
    await page.goto('/my-bookings');
    await expect(page).toHaveURL(/\/login/);
  });
});
