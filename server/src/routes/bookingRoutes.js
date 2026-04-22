import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createBookingSchema } from '../validators/bookingSchemas.js';

const router = Router();

// POST /api/v1/bookings — authenticated customer
router.post('/', authMiddleware, validate(createBookingSchema), async (req, res, next) => {
  try {
    const { serviceId, date, startTime, endTime } = req.validatedBody;
    const userId = req.user.id;

    // Verify service exists and is active
    const service = await db.prepare('SELECT * FROM services WHERE id = ? AND is_active = 1').get(serviceId);
    if (!service) return res.status(400).json({ error: 'Service not found or inactive' });

    // Check for overlapping bookings (non-cancelled)
    const overlap = await db.prepare(`
      SELECT id FROM bookings
      WHERE booking_date = ? AND status != 'cancelled'
        AND start_time < ? AND end_time > ?
    `).get(date, endTime, startTime);

    if (overlap) {
      return res.status(409).json({ error: 'This slot was just taken. Please select another time.' });
    }

    const result = await db.prepare(
      'INSERT INTO bookings (user_id, service_id, booking_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, serviceId, date, startTime, endTime, 'pending');

    const booking = await db.prepare(`
      SELECT b.id, b.booking_date as bookingDate, b.start_time as startTime, b.end_time as endTime,
             b.status, b.created_at as createdAt,
             s.name as serviceName, s.price, s.duration_minutes as durationMinutes,
             c.name as categoryName
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN categories c ON s.category_id = c.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ data: booking });
  } catch (err) {
    // Handle unique constraint violation (concurrent booking)
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'This slot was just taken. Please select another time.' });
    }
    next(err);
  }
});

// GET /api/v1/bookings/my — authenticated customer
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const bookings = await db.prepare(`
      SELECT b.id, b.booking_date as bookingDate, b.start_time as startTime, b.end_time as endTime,
             b.status, b.created_at as createdAt, b.updated_at as updatedAt,
             s.name as serviceName, s.price, s.duration_minutes as durationMinutes,
             c.name as categoryName
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN categories c ON s.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC, b.start_time DESC
    `).all(req.user.id);

    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/bookings/:id/cancel — authenticated customer (own pending bookings only)
router.patch('/:id/cancel', authMiddleware, async (req, res, next) => {
  try {
    const booking = await db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ error: 'Only pending bookings can be cancelled' });

    const nowFn = db.isPostgres ? 'NOW()' : "datetime('now')";
    await db.prepare(`UPDATE bookings SET status = 'cancelled', updated_at = ${nowFn} WHERE id = ?`).run(req.params.id);
    res.json({ data: { message: 'Booking cancelled' } });
  } catch (err) {
    next(err);
  }
});

export default router;
