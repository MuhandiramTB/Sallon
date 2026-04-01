import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceSchemas.js';

const router = Router();

// GET /api/v1/services — public (only active for customers)
router.get('/', (req, res) => {
  const { category_id } = req.query;
  let query = `
    SELECT s.id, s.category_id as categoryId, s.name, s.description,
           s.duration_minutes as durationMinutes, s.price, s.is_active as isActive,
           c.name as categoryName
    FROM services s
    JOIN categories c ON s.category_id = c.id
    WHERE s.is_active = 1 AND c.is_active = 1
  `;
  const params = [];
  if (category_id) {
    query += ' AND s.category_id = ?';
    params.push(category_id);
  }
  query += ' ORDER BY c.display_order ASC, s.name ASC';

  const services = db.prepare(query).all(...params);
  res.json({ data: services });
});

// GET /api/v1/services/:id — public
router.get('/:id', (req, res) => {
  const service = db.prepare(`
    SELECT s.id, s.category_id as categoryId, s.name, s.description,
           s.duration_minutes as durationMinutes, s.price, s.is_active as isActive,
           c.name as categoryName
    FROM services s
    JOIN categories c ON s.category_id = c.id
    WHERE s.id = ?
  `).get(req.params.id);

  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json({ data: service });
});

// POST /api/v1/services — admin
router.post('/', authMiddleware, adminMiddleware, validate(createServiceSchema), (req, res) => {
  const { categoryId, name, description, durationMinutes, price } = req.validatedBody;

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
  if (!category) return res.status(400).json({ error: 'Category not found' });

  const result = db.prepare(
    'INSERT INTO services (category_id, name, description, duration_minutes, price) VALUES (?, ?, ?, ?, ?)'
  ).run(categoryId, name, description || null, durationMinutes, price);

  const service = db.prepare(`
    SELECT s.id, s.category_id as categoryId, s.name, s.description,
           s.duration_minutes as durationMinutes, s.price, s.is_active as isActive,
           c.name as categoryName
    FROM services s JOIN categories c ON s.category_id = c.id WHERE s.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ data: service });
});

// PUT /api/v1/services/:id — admin
router.put('/:id', authMiddleware, adminMiddleware, validate(updateServiceSchema), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Service not found' });

  const { categoryId, name, description, durationMinutes, price, isActive } = req.validatedBody;

  db.prepare(`
    UPDATE services SET
      category_id = COALESCE(?, category_id),
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      duration_minutes = COALESCE(?, duration_minutes),
      price = COALESCE(?, price),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(
    categoryId ?? null, name ?? null, description ?? null,
    durationMinutes ?? null, price ?? null,
    isActive !== undefined ? (isActive ? 1 : 0) : null, id
  );

  const updated = db.prepare(`
    SELECT s.id, s.category_id as categoryId, s.name, s.description,
           s.duration_minutes as durationMinutes, s.price, s.is_active as isActive,
           c.name as categoryName
    FROM services s JOIN categories c ON s.category_id = c.id WHERE s.id = ?
  `).get(id);

  res.json({ data: updated });
});

// DELETE /api/v1/services/:id — admin
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Service not found' });

  db.prepare('DELETE FROM services WHERE id = ?').run(id);
  res.json({ data: { message: 'Service deleted' } });
});

export default router;
