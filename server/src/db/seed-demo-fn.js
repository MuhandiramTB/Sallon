// Reusable demo seed function (no process.exit) — can be called from index.js
import db from './database.js';
import { hashPassword } from '../utils/passwordUtils.js';

export async function seedDemoData() {
  console.log('Seeding demo men\'s salon data...');

  const existingCat = await db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (existingCat.c > 0) return;

  const categories = [
    { name: 'Hair', display_order: 1 },
    { name: 'Beard & Shave', display_order: 2 },
    { name: 'Facial & Cleanup', display_order: 3 },
  ];

  const categoryIds = {};
  for (const cat of categories) {
    const result = await db.prepare(
      'INSERT INTO categories (name, display_order, is_active) VALUES (?, ?, 1)'
    ).run(cat.name, cat.display_order);
    categoryIds[cat.name] = result.lastInsertRowid;
  }

  const services = [
    { category: 'Hair', name: 'Haircut', description: 'Classic haircut with styling', duration: 30, price: 500 },
    { category: 'Hair', name: 'Kids Haircut', description: 'Haircut for children under 12', duration: 20, price: 350 },
    { category: 'Hair', name: 'Hair Color', description: 'Professional hair coloring', duration: 60, price: 1500 },
    { category: 'Hair', name: 'Hair Wash & Blow Dry', description: 'Shampoo wash with blow dry', duration: 20, price: 300 },
    { category: 'Hair', name: 'Head Massage', description: 'Relaxing head and scalp massage', duration: 30, price: 600 },
    { category: 'Beard & Shave', name: 'Beard Trim', description: 'Beard shaping and trimming', duration: 20, price: 300 },
    { category: 'Beard & Shave', name: 'Beard Styling', description: 'Detailed beard design and styling', duration: 30, price: 500 },
    { category: 'Beard & Shave', name: 'Hot Towel Shave', description: 'Traditional hot towel razor shave', duration: 30, price: 400 },
    { category: 'Beard & Shave', name: 'Beard Color', description: 'Professional beard coloring', duration: 45, price: 800 },
    { category: 'Facial & Cleanup', name: 'Face Cleanup', description: 'Basic face cleanup and exfoliation', duration: 30, price: 800 },
    { category: 'Facial & Cleanup', name: 'Classic Facial', description: 'Deep cleansing facial treatment', duration: 60, price: 1500 },
    { category: 'Facial & Cleanup', name: 'De-tan Facial', description: 'Tan removal and skin brightening', duration: 60, price: 1800 },
    { category: 'Facial & Cleanup', name: 'Anti-Aging Facial', description: 'Anti-aging treatment with serum', duration: 75, price: 2500 },
    { category: 'Facial & Cleanup', name: 'Eyebrow Threading', description: 'Precise eyebrow shaping', duration: 15, price: 200 },
  ];

  const serviceIds = {};
  for (const s of services) {
    const result = await db.prepare(
      'INSERT INTO services (category_id, name, description, duration_minutes, price, is_active, is_package) VALUES (?, ?, ?, ?, ?, 1, 0)'
    ).run(categoryIds[s.category], s.name, s.description, s.duration, s.price);
    serviceIds[s.name] = result.lastInsertRowid;
  }

  const packages = [
    { category: 'Hair', name: 'Haircut + Beard Combo', description: 'Haircut + Beard Trim', duration: 50, price: 700, includes: ['Haircut', 'Beard Trim'] },
    { category: 'Hair', name: 'Groom Package', description: 'Haircut + Beard Trim + Head Massage', duration: 80, price: 1200, includes: ['Haircut', 'Beard Trim', 'Head Massage'] },
    { category: 'Hair', name: 'Royal Grooming', description: 'Haircut + Beard Styling + Hot Towel Shave + Head Massage', duration: 110, price: 1700, includes: ['Haircut', 'Beard Styling', 'Hot Towel Shave', 'Head Massage'] },
    { category: 'Facial & Cleanup', name: 'Refresh Combo', description: 'Haircut + Face Cleanup', duration: 60, price: 1200, includes: ['Haircut', 'Face Cleanup'] },
    { category: 'Facial & Cleanup', name: 'Gentleman\'s Special', description: 'Haircut + Beard Trim + Classic Facial', duration: 110, price: 2000, includes: ['Haircut', 'Beard Trim', 'Classic Facial'] },
    { category: 'Facial & Cleanup', name: 'Complete Makeover', description: 'Haircut + Hot Towel Shave + De-tan Facial + Head Massage', duration: 150, price: 2800, includes: ['Haircut', 'Hot Towel Shave', 'De-tan Facial', 'Head Massage'] },
  ];

  for (const pkg of packages) {
    const result = await db.prepare(
      'INSERT INTO services (category_id, name, description, duration_minutes, price, is_active, is_package) VALUES (?, ?, ?, ?, ?, 1, 1)'
    ).run(categoryIds[pkg.category], pkg.name, pkg.description, pkg.duration, pkg.price);

    for (const svcName of pkg.includes) {
      await db.prepare('INSERT INTO package_items (package_id, service_id) VALUES (?, ?)')
        .run(result.lastInsertRowid, serviceIds[svcName]);
    }
  }

  console.log('Demo data seeded: 3 categories, 14 services, 6 packages');
}
