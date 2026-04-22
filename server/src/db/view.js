// Database viewer — works with both SQLite (local) and PostgreSQL (Neon)
// Local SQLite:    npm run db:view
// Neon PostgreSQL: DATABASE_URL=postgresql://... npm run db:view
import db from './database.js';

async function viewDatabase() {
  console.log('\n========================================');
  console.log('  SallonArt Database Viewer');
  console.log(db.isPostgres ? '  (PostgreSQL / Neon)' : '  (SQLite / Local)');
  console.log('========================================\n');

  const users = await db.prepare('SELECT id, name, email, phone, role FROM users ORDER BY id').all();
  console.log(`USERS (${users.length}):`);
  if (users.length === 0) console.log('   (empty)');
  users.forEach((u) => {
    console.log(`   #${u.id} [${u.role}] ${u.name} | ${u.email} | ${u.phone || 'no phone'}`);
  });

  const categories = await db.prepare('SELECT * FROM categories ORDER BY display_order').all();
  console.log(`\nCATEGORIES (${categories.length}):`);
  if (categories.length === 0) console.log('   (empty)');
  categories.forEach((c) => {
    const active = c.is_active == 1 || c.is_active === true;
    console.log(`   #${c.id} ${c.name} (order: ${c.display_order}) ${active ? '[active]' : '[inactive]'}`);
  });

  const services = await db.prepare(`
    SELECT s.id, s.name, s.price, s.duration_minutes, s.is_active, s.is_package, c.name as category
    FROM services s JOIN categories c ON s.category_id = c.id ORDER BY s.id
  `).all();
  console.log(`\nSERVICES (${services.length}):`);
  if (services.length === 0) console.log('   (empty)');
  services.forEach((s) => {
    const isPkg = s.is_package == 1 || s.is_package === true;
    const active = s.is_active == 1 || s.is_active === true;
    const badge = isPkg ? '[PACKAGE]' : '[service]';
    console.log(`   #${s.id} ${badge} ${s.name} | Rs. ${s.price} | ${s.duration_minutes}min | ${s.category} (${active ? 'active' : 'inactive'})`);
  });

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = await db.prepare('SELECT * FROM operating_hours ORDER BY day_of_week').all();
  console.log(`\nOPERATING HOURS:`);
  hours.forEach((h) => {
    const closed = h.is_closed == 1 || h.is_closed === true;
    const status = closed ? 'CLOSED' : `${h.open_time} - ${h.close_time}`;
    console.log(`   ${DAY_NAMES[h.day_of_week]}: ${status}`);
  });

  const bookings = await db.prepare(`
    SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status,
           u.name as customer, u.phone, s.name as service, s.price
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN services s ON b.service_id = s.id
    ORDER BY b.booking_date DESC, b.start_time
  `).all();
  console.log(`\nBOOKINGS (${bookings.length}):`);
  if (bookings.length === 0) console.log('   (empty)');
  bookings.forEach((b) => {
    console.log(`   #${b.id} [${b.status.toUpperCase()}] ${b.booking_date} ${b.start_time}-${b.end_time} | ${b.customer} (${b.phone || 'n/a'}) | ${b.service} Rs.${b.price}`);
  });

  const customerCount = (await db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get()).c;
  const activeBookings = (await db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status != 'cancelled'").get()).c;
  const totalRevenue = (await db.prepare(`
    SELECT COALESCE(SUM(s.price), 0) as total
    FROM bookings b JOIN services s ON b.service_id = s.id
    WHERE b.status = 'completed'
  `).get()).total;

  console.log('\n----------------------------------------');
  console.log('STATS:');
  console.log(`   Total customers:   ${customerCount}`);
  console.log(`   Active bookings:   ${activeBookings}`);
  console.log(`   Total revenue:     Rs. ${totalRevenue}`);
  console.log('----------------------------------------\n');

  process.exit(0);
}

viewDatabase().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
