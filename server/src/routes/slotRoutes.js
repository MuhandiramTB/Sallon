import { Router } from 'express';
import { getAvailableSlots } from '../utils/slotGenerator.js';

const router = Router();

// GET /api/v1/slots?service_id=1&date=2026-04-05
router.get('/', (req, res) => {
  const { service_id, date } = req.query;

  if (!service_id || !date) {
    return res.status(400).json({ error: 'service_id and date are required' });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
  }

  const result = getAvailableSlots(Number(service_id), date);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  if (result.closed) {
    return res.json({ data: { slots: [], message: 'Salon is closed on this day' } });
  }

  res.json({ data: { slots: result.slots } });
});

export default router;
