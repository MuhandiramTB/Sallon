import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers.js';

test.describe('Admin Flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin dashboard shows stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByText(/Customers/i)).toBeVisible();
    await expect(page.getByText(/Services/i).first()).toBeVisible();
    await expect(page.getByText(/Total Bookings/i)).toBeVisible();
  });

  test('admin can create category', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.getByRole('button', { name: /\+ Add Category/i }).first().click();
    const name = `TestCat_${Date.now()}`;
    await page.fill('input[id="category-name"]', name);
    // Use submit button inside the form specifically
    await page.locator('form').getByRole('button', { name: /Create Category/i }).click();
    await expect(page.getByText(name)).toBeVisible();
  });

  test('admin can navigate to Quick Booking', async ({ page }) => {
    await page.goto('/admin/quick-booking');
    await expect(page.getByRole('heading', { name: /Quick Booking/i })).toBeVisible();
    await expect(page.getByText(/Customer Details/i)).toBeVisible();
  });

  test('admin can manage operating hours', async ({ page }) => {
    await page.goto('/admin/operating-hours');
    await expect(page.getByRole('heading', { name: /Operating Hours/i })).toBeVisible();
    await expect(page.getByText(/Monday/i)).toBeVisible();
    await expect(page.getByText(/Sunday/i)).toBeVisible();
  });

  test('admin navbar has all links', async ({ page }) => {
    // Desktop viewport to see all links
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();
    await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Quick Book', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Services', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Categories', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Hours', exact: true })).toBeVisible();
  });
});
