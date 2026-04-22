export const ADMIN = {
  email: 'admin@sallon.com',
  password: 'admin123',
};

export async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', ADMIN.email);
  await page.fill('input[name="password"]', ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin');
}

export async function registerCustomer(page, { name, email, phone, password }) {
  await page.goto('/register');
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="phone"]', phone);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

export function uniqueEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`;
}

export function uniquePhone() {
  return `07${Date.now().toString().slice(-8)}`;
}
