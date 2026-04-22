// Demo data seeder — creates realistic salon data for customer demo
// Run: cd server && npm run db:seed-demo
import db from './database.js';
import { hashPassword } from '../utils/passwordUtils.js';

async function seedDemo() {
  console.log('\nSeeding demo salon data...\n');

  // Check if already seeded (don't duplicate)
  const existingCat = await db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (existingCat.c > 0) {
    console.log('Categories already exist. Run npm run db:reset first to start fresh.');
    process.exit(0);
  }

  // ==========================================
  // CATEGORIES — Real salon categories
  // ==========================================
  console.log('Creating categories...');
  const categories = [
    { name: "Men's Grooming", display_order: 1 },
    { name: "Ladies Salon", display_order: 2 },
    { name: 'Spa & Massage', display_order: 3 },
    { name: 'Nails & Beauty', display_order: 4 },
  ];

  const categoryIds = {};
  for (const cat of categories) {
    const result = await db.prepare(
      'INSERT INTO categories (name, display_order, is_active) VALUES (?, ?, 1)'
    ).run(cat.name, cat.display_order);
    categoryIds[cat.name] = result.lastInsertRowid;
    console.log(`  ${cat.name} (#${result.lastInsertRowid})`);
  }

  // ==========================================
  // SERVICES — Individual services
  // ==========================================
  console.log('\nCreating services...');
  const services = [
    // Men's Grooming
    { category: "Men's Grooming", name: 'Haircut', description: 'Classic haircut with styling', duration: 30, price: 500 },
    { category: "Men's Grooming", name: 'Beard Trim', description: 'Beard shaping and trimming', duration: 20, price: 300 },
    { category: "Men's Grooming", name: 'Shave', description: 'Traditional hot towel shave', duration: 30, price: 400 },
    { category: "Men's Grooming", name: 'Hair Color', description: 'Professional hair coloring', duration: 60, price: 1500 },
    { category: "Men's Grooming", name: 'Head Massage', description: 'Relaxing head and scalp massage', duration: 30, price: 600 },

    // Ladies Salon
    { category: 'Ladies Salon', name: 'Haircut & Blow Dry', description: 'Cut, wash, and blow dry', duration: 45, price: 800 },
    { category: 'Ladies Salon', name: 'Hair Color', description: 'Full hair coloring service', duration: 90, price: 2500 },
    { category: 'Ladies Salon', name: 'Hair Treatment', description: 'Deep conditioning and repair', duration: 60, price: 1800 },
    { category: 'Ladies Salon', name: 'Hair Styling', description: 'Event or party hair styling', duration: 45, price: 1200 },
    { category: 'Ladies Salon', name: 'Facial', description: 'Classic facial with cleansing', duration: 60, price: 1500 },

    // Spa & Massage
    { category: 'Spa & Massage', name: 'Full Body Massage', description: 'Relaxing 60-minute body massage', duration: 60, price: 3000 },
    { category: 'Spa & Massage', name: 'Aromatherapy Massage', description: 'Essential oils therapy massage', duration: 60, price: 3500 },
    { category: 'Spa & Massage', name: 'Hot Stone Therapy', description: 'Heated stones muscle therapy', duration: 75, price: 4000 },
    { category: 'Spa & Massage', name: 'Foot Reflexology', description: 'Foot pressure point massage', duration: 30, price: 1500 },

    // Nails & Beauty
    { category: 'Nails & Beauty', name: 'Manicure', description: 'Classic nail care and polish', duration: 30, price: 800 },
    { category: 'Nails & Beauty', name: 'Pedicure', description: 'Foot care and polish', duration: 45, price: 1200 },
    { category: 'Nails & Beauty', name: 'Gel Nails', description: 'Long-lasting gel polish', duration: 60, price: 1800 },
    { category: 'Nails & Beauty', name: 'Eyebrow Threading', description: 'Precise brow shaping', duration: 15, price: 300 },
  ];

  const serviceIds = {};
  for (const s of services) {
    const result = await db.prepare(
      'INSERT INTO services (category_id, name, description, duration_minutes, price, is_active, is_package) VALUES (?, ?, ?, ?, ?, 1, 0)'
    ).run(categoryIds[s.category], s.name, s.description, s.duration, s.price);
    serviceIds[s.name] = result.lastInsertRowid;
    console.log(`  ${s.name} — Rs. ${s.price} (${s.duration} min)`);
  }

  // ==========================================
  // PACKAGES — Combo deals with discount
  // ==========================================
  console.log('\nCreating packages...');
  const packages = [
    {
      category: "Men's Grooming",
      name: 'Groom Package',
      description: 'Haircut + Beard Trim + Head Massage',
      duration: 80, price: 1200, // Individual: 500+300+600 = 1400, saves Rs. 200
      includes: ['Haircut', 'Beard Trim', 'Head Massage'],
    },
    {
      category: "Men's Grooming",
      name: 'Royal Grooming',
      description: 'Complete men\'s grooming experience',
      duration: 110, price: 1500, // Individual: 500+300+400+600 = 1800, saves Rs. 300
      includes: ['Haircut', 'Beard Trim', 'Shave', 'Head Massage'],
    },
    {
      category: 'Ladies Salon',
      name: 'Bridal Package',
      description: 'Hair styling + facial + manicure',
      duration: 135, price: 3200, // Individual: 1200+1500+800 = 3500, saves Rs. 300
      includes: ['Hair Styling', 'Facial', 'Manicure'],
    },
    {
      category: 'Ladies Salon',
      name: 'Hair Makeover',
      description: 'Complete hair transformation',
      duration: 195, price: 4500, // Individual: 800+2500+1800 = 5100, saves Rs. 600
      includes: ['Haircut & Blow Dry', 'Hair Color', 'Hair Treatment'],
    },
    {
      category: 'Spa & Massage',
      name: 'Relaxation Package',
      description: 'Full body massage + reflexology',
      duration: 90, price: 4000, // Individual: 3000+1500 = 4500, saves Rs. 500
      includes: ['Full Body Massage', 'Foot Reflexology'],
    },
    {
      category: 'Nails & Beauty',
      name: 'Nail Care Combo',
      description: 'Manicure + pedicure combo',
      duration: 75, price: 1800, // Individual: 800+1200 = 2000, saves Rs. 200
      includes: ['Manicure', 'Pedicure'],
    },
  ];

  for (const pkg of packages) {
    const result = await db.prepare(
      'INSERT INTO services (category_id, name, description, duration_minutes, price, is_active, is_package) VALUES (?, ?, ?, ?, ?, 1, 1)'
    ).run(categoryIds[pkg.category], pkg.name, pkg.description, pkg.duration, pkg.price);

    // Link package to its services
    for (const svcName of pkg.includes) {
      await db.prepare(
        'INSERT INTO package_items (package_id, service_id) VALUES (?, ?)'
      ).run(result.lastInsertRowid, serviceIds[svcName]);
    }
    console.log(`  [PACKAGE] ${pkg.name} — Rs. ${pkg.price} (${pkg.includes.join(' + ')})`);
  }

  // ==========================================
  // SAMPLE CUSTOMERS
  // ==========================================
  console.log('\nCreating sample customers...');
  const customers = [
    { name: 'Nimal Perera', email: 'nimal@test.com', phone: '0771234567' },
    { name: 'Kumari Silva', email: 'kumari@test.com', phone: '0772345678' },
    { name: 'Ashan Fernando', email: 'ashan@test.com', phone: '0773456789' },
  ];

  const customerIds = {};
  const pwd = await hashPassword('customer123');
  for (const c of customers) {
    const result = await db.prepare(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')"
    ).run(c.name, c.email, c.phone, pwd);
    customerIds[c.name] = result.lastInsertRowid;
    console.log(`  ${c.name} — ${c.phone} (password: customer123)`);
  }

  // ==========================================
  // SAMPLE BOOKINGS (today + tomorrow)
  // ==========================================
  console.log('\nCreating sample bookings...');
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  // Get future slots (don't overlap with operating hours)
  const sampleBookings = [
    { customer: 'Nimal Perera', service: 'Haircut', date: ymd(tomorrow), start: '10:00', end: '10:30', status: 'confirmed' },
    { customer: 'Kumari Silva', service: 'Hair Color', date: ymd(tomorrow), start: '14:00', end: '15:30', status: 'pending' },
    { customer: 'Ashan Fernando', service: 'Beard Trim', date: ymd(tomorrow), start: '16:00', end: '16:20', status: 'confirmed' },
    { customer: 'Nimal Perera', service: 'Groom Package', date: ymd(today), start: '11:00', end: '12:20', status: 'completed' },
  ];

  for (const b of sampleBookings) {
    try {
      await db.prepare(
        'INSERT INTO bookings (user_id, service_id, booking_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(customerIds[b.customer], serviceIds[b.service] || (await db.prepare('SELECT id FROM services WHERE name = ?').get(b.service)).id, b.date, b.start, b.end, b.status);
      console.log(`  ${b.customer} | ${b.service} | ${b.date} ${b.start} [${b.status}]`);
    } catch (err) {
      console.log(`  Skipped duplicate slot: ${b.customer} ${b.date} ${b.start}`);
    }
  }

  console.log('\n========================================');
  console.log('  Demo data seeded successfully!');
  console.log('========================================');
  console.log('\nAdmin login:');
  console.log('   admin@sallon.com / admin123');
  console.log('\nSample customer logins:');
  console.log('   nimal@test.com / customer123');
  console.log('   kumari@test.com / customer123');
  console.log('   ashan@test.com / customer123');
  console.log('\nRun `npm run db:view` to see all data.\n');

  process.exit(0);
}

seedDemo().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
