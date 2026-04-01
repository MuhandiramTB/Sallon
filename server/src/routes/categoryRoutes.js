import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/serviceSchemas.js';

const router = Router();

// GET /api/v1/categories — public
router.get('/', (req, res) => {
  const categories = db.prepare(
    'SELECT id, name, display_order as displayOrder, is_active as isActive FROM categories ORDER BY display_order ASC, name ASC'
  ).all();
  res.json({ data: categories });
});

// POST /api/v1/categories — admin
router.post('/', authMiddleware, adminMiddleware, validate(createCategorySchema), (req, res) => {
  const { name, displayOrder } = req.validatedBody;
  const result = db.prepare(
    'INSERT INTO categories (name, display_order) VALUES (?, ?)'
  ).run(name, displayOrder);
  const category = db.prepare(
    'SELECT id, name, display_order as displayOrder, is_active as isActive FROM categories WHERE id = ?'
  ).get(result.lastInsertRowid);
  res.status(201).json({ data: category });
});

// PUT /api/v1/categories/:id — admin
router.put('/:id', authMiddleware, adminMiddleware, validate(updateCategorySchema), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Category not found' });

  const { name, displayOrder } = req.validatedBody;
  db.prepare(
    'UPDATE categories SET name = COALESCE(?, name), display_order = COALESCE(?, display_order) WHERE id = ?'
  ).run(name ?? null, displayOrder ?? null, id);

  const updated = db.prepare(
    'SELECT id, name, display_order as displayOrder, is_active as isActive FROM categories WHERE id = ?'
  ).get(id);
  res.json({ data: updated });
});

// DELETE /api/v1/categories/:id — admin
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Category not found' });

  const services = db.prepare('SELECT COUNT(*) as count FROM services WHERE category_id = ?').get(id);
  if (services.count > 0) {
    return res.status(409).json({ error: 'Cannot delete category with existing services' });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ data: { message: 'Category deleted' } });
});

export default router;
