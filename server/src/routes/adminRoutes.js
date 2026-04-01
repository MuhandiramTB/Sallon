import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { validate } from '../middleware/validate.js';
import { updateBookingStatusSchema, adminCreateBookingSchema } from '../validators/bookingSchemas.js';
import { hashPassword } from '../utils/passwordUtils.js';

const router = Router();

// GET /api/v1/admin/bookings — admin (with filters)
router.get('/bookings', authMiddleware, adminMiddleware, (req, res) => {
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

  query += ' ORDER BY b.booking_date ASC, b.start_time ASC';

  const bookings = db.prepare(query).all(...params);
  res.json({ data: bookings });
});

// POST /api/v1/admin/bookings — admin creates booking for a customer (walk-in / phone call)
router.post('/bookings', authMiddleware, adminMiddleware, validate(adminCreateBookingSchema), async (req, res, next) => {
  try {
    const { customerName, customerPhone, serviceId, date, startTime, endTime, status } = req.validatedBody;

    // Find or create customer by phone number
    let customer = db.prepare('SELECT id FROM users WHERE phone = ?').get(customerPhone);
    if (!customer) {
      const passwordHash = await hashPassword(customerPhone); // temp password = phone
      const result = db.prepare(
        "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')"
      ).run(customerName, `${customerPhone}@walkin.local`, customerPhone, passwordHash);
      customer = { id: result.lastInsertRowid };
    }

    // Check service exists
    const service = db.prepare('SELECT * FROM services WHERE id = ? AND is_active = 1').get(serviceId);
    if (!service) return res.status(400).json({ error: 'Service not found or inactive' });

    // Check for overlap
    const overlap = db.prepare(`
      SELECT id FROM bookings
      WHERE booking_date = ? AND status != 'cancelled'
        AND start_time < ? AND end_time > ?
    `).get(date, endTime, startTime);
    if (overlap) return res.status(409).json({ error: 'This slot is already booked' });

    const result = db.prepare(
      'INSERT INTO bookings (user_id, service_id, booking_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(customer.id, serviceId, date, startTime, endTime, status || 'confirmed');

    const booking = db.prepare(`
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
    next(err);
  }
});

// PATCH /api/v1/admin/bookings/:id — admin (update status)
router.patch('/bookings/:id', authMiddleware, adminMiddleware, validate(updateBookingStatusSchema), (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const { status } = req.validatedBody;
  db.prepare("UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);

  const updated = db.prepare(`
    SELECT b.id, b.booking_date as bookingDate, b.start_time as startTime, b.end_time as endTime,
           b.status, b.created_at as createdAt, b.updated_at as updatedAt,
           s.name as serviceName, s.price,
           u.name as customerName, u.email as customerEmail
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `).get(req.params.id);

  res.json({ data: updated });
});

export default router;
