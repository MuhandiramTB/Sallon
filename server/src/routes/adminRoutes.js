import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { validate } from '../middleware/validate.js';
import { updateBookingStatusSchema, adminCreateBookingSchema } from '../validators/bookingSchemas.js';
import { hashPassword } from '../utils/passwordUtils.js';

const router = Router();

// GET /api/v1/admin/stats — admin database overview
router.get('/stats', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const users = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get()).count;
    const services = (await db.prepare('SELECT COUNT(*) as count FROM services WHERE is_active = 1').get()).count;
    const categories = (await db.prepare('SELECT COUNT(*) as count FROM categories WHERE is_active = 1').get()).count;
    const totalBookings = (await db.prepare('SELECT COUNT(*) as count FROM bookings').get()).count;
    const pendingBookings = (await db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get()).count;
    const confirmedBookings = (await db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'").get()).count;
    const completedBookings = (await db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'").get()).count;

    res.json({
      data: {
        customers: users,
        categories,
        services,
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/bookings — admin (with filters)
router.get('/bookings', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { date, status, category_id } = req.query;

    let query = `
      SELECT b.id, b.booking_date as bookingDate, b.start_time as startTime, b.end_time as endTime,
             b.status, b.created_at as createdAt, b.updated_at as updatedAt,
             s.name as serviceName, s.price, s.duration_minutes as durationMinutes,
             c.name as categoryName, c.id as categoryId,
             u.name as customerName, u.email as customerEmail, u.phone as customerPhone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN categories c ON s.category_id = c.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (date) { query += ' AND b.booking_date = ?'; params.push(date); }
    if (status) { query += ' AND b.status = ?'; params.push(status); }
    if (category_id) { query += ' AND c.id = ?'; params.push(category_id); }

    query += ' ORDER BY b.booking_date DESC, b.start_time ASC';

    const bookings = await db.prepare(query).all(...params);
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/bookings — admin creates booking for a customer (walk-in / phone call)
router.post('/bookings', authMiddleware, adminMiddleware, validate(adminCreateBookingSchema), async (req, res, next) => {
  try {
    const { customerName, customerPhone, serviceId, date, startTime, endTime, status } = req.validatedBody;

    // Find existing customer by phone OR email
    let customer = await db.prepare('SELECT id FROM users WHERE phone = ?').get(customerPhone);

    if (!customer) {
      // Generate unique email for walk-in customer
      const walkinEmail = `walkin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@walkin.local`;
      const passwordHash = await hashPassword(customerPhone);
      try {
        const result = await db.prepare(
          "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')"
        ).run(customerName, walkinEmail, customerPhone, passwordHash);
        customer = { id: result.lastInsertRowid };
      } catch (insertErr) {
        // Phone might have been inserted by another request — retry lookup
        customer = await db.prepare('SELECT id FROM users WHERE phone = ?').get(customerPhone);
        if (!customer) {
          return res.status(500).json({ error: 'Failed to create customer record' });
        }
      }
    }

    // Check service exists
    const service = await db.prepare('SELECT * FROM services WHERE id = ? AND is_active = 1').get(serviceId);
    if (!service) return res.status(400).json({ error: 'Service not found or inactive' });

    // Check for overlap
    const overlap = await db.prepare(`
      SELECT id FROM bookings
      WHERE booking_date = ? AND status != 'cancelled'
        AND start_time < ? AND end_time > ?
    `).get(date, endTime, startTime);
    if (overlap) return res.status(409).json({ error: 'This slot is already booked' });

    const result = await db.prepare(
      'INSERT INTO bookings (user_id, service_id, booking_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(customer.id, serviceId, date, startTime, endTime, status || 'confirmed');

    const booking = await db.prepare(`
      SELECT b.id, b.booking_date as bookingDate, b.start_time as startTime, b.end_time as endTime,
             b.status, s.name as serviceName, s.price,
             u.name as customerName, u.phone as customerPhone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ data: booking });
  } catch (err) {
    console.error('Admin booking error:', err);
    next(err);
  }
});

// PATCH /api/v1/admin/bookings/:id — admin (update status)
router.patch('/bookings/:id', authMiddleware, adminMiddleware, validate(updateBookingStatusSchema), async (req, res, next) => {
  try {
    const booking = await db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const { status } = req.validatedBody;
    const nowFn = db.isPostgres ? 'NOW()' : "datetime('now')";
    await db.prepare(`UPDATE bookings SET status = ?, updated_at = ${nowFn} WHERE id = ?`).run(status, req.params.id);

    const updated = await db.prepare(`
      SELECT b.id, b.booking_date as bookingDate, b.start_time as startTime, b.end_time as endTime,
             b.status, b.created_at as createdAt, b.updated_at as updatedAt,
             s.name as serviceName, s.price,
             u.name as customerName, u.email as customerEmail, u.phone as customerPhone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `).get(req.params.id);

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/users — list all customers with booking counts
router.get('/users', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const users = await db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at as createdAt,
             (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) as bookingCount,
             (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id AND b.status = 'completed') as completedCount
      FROM users u
      WHERE u.role = 'customer'
      ORDER BY u.created_at DESC
    `).all();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/users/:id — delete a customer (cascades bookings)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Cannot delete admin account' });

    // Delete bookings first (FK safety, especially on PG without ON DELETE CASCADE)
    await db.prepare('DELETE FROM bookings WHERE user_id = ?').run(req.params.id);
    await db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

    res.json({ data: { message: 'User deleted' } });
  } catch (err) {
    next(err);
  }
});

export default router;
