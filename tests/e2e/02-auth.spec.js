import { test, expect } from '@playwright/test';
import { ADMIN, uniqueEmail, uniquePhone } from './helpers.js';

test.describe('Authentication', () => {
  test('admin can login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', ADMIN.email);
    await page.fill('input[name="password"]', ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('login with wrong credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test('customer can register', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="email"]', uniqueEmail());
    await page.fill('input[name="phone"]', uniquePhone());
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('registration requires phone number', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test');
    await page.fill('input[name="email"]', uniqueEmail());
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    // Should stay on register page due to HTML5 required validation
    await expect(page).toHaveURL(/\/register/);
  });

  test('duplicate email registration shows error', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto('/register');
    await page.fill('input[name="name"]', 'First');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', uniquePhone());
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Log out and try again with same email
    await page.evaluate(() => localStorage.clear());
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Second');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', uniquePhone());
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/already registered/i)).toBeVisible();
  });
});
