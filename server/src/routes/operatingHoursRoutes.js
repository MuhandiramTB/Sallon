import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// GET /api/v1/operating-hours — public
router.get('/', (req, res) => {
  const hours = db.prepare(
    'SELECT id, day_of_week as dayOfWeek, open_time as openTime, close_time as closeTime, is_closed as isClosed FROM operating_hours ORDER BY day_of_week'
  ).all();
  res.json({ data: hours });
});

// PUT /api/v1/operating-hours — admin (bulk update all days)
router.put('/', authMiddleware, adminMiddleware, (req, res, next) => {
  try {
    const { hours } = req.body;
    if (!Array.isArray(hours)) {
      return res.status(400).json({ error: 'hours must be an array' });
    }

    const update = db.prepare(
      'UPDATE operating_hours SET open_time = ?, close_time = ?, is_closed = ? WHERE day_of_week = ?'
    );

    const updateMany = db.transaction((items) => {
      for (const item of items) {
        update.run(item.openTime, item.closeTime, item.isClosed ? 1 : 0, item.dayOfWeek);
      }
    });

    updateMany(hours);

    const updated = db.prepare(
      'SELECT id, day_of_week as dayOfWeek, open_time as openTime, close_time as closeTime, is_closed as isClosed FROM operating_hours ORDER BY day_of_week'
    ).all();

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
