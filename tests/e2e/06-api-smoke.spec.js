import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api/v1';

test.describe('API Smoke Tests', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data.status).toBe('ok');
  });

  test('branding config is public', async ({ request }) => {
    const res = await request.get(`${API}/config/branding`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data.salonName).toBeTruthy();
    expect(body.data.primaryColor).toBeTruthy();
  });

  test('operating hours is public', async ({ request }) => {
    const res = await request.get(`${API}/operating-hours`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data).toHaveLength(7);
  });

  test('admin endpoints require auth', async ({ request }) => {
    const res = await request.get(`${API}/admin/bookings`);
    expect(res.status()).toBe(401);
  });

  test('admin endpoints reject customer role', async ({ request }) => {
    // Register a customer and get token
    const email = `customer_${Date.now()}@test.com`;
    const phone = `07${Date.now().toString().slice(-8)}`;
    const regRes = await request.post(`${API}/auth/register`, {
      data: { name: 'Cust', email, phone, password: 'password123' },
    });
    const { data } = await regRes.json();

    // Try to access admin endpoint with customer token
    const adminRes = await request.get(`${API}/admin/bookings`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    expect(adminRes.status()).toBe(403);
  });

  test('input validation rejects bad data', async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
      data: { name: 'X', email: 'not-an-email', phone: '123', password: '12' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Validation failed');
  });
});
