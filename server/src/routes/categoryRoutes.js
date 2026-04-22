import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/serviceSchemas.js';

const router = Router();

// GET /api/v1/categories — public
router.get('/', async (req, res, next) => {
  try {
    const categories = await db.prepare(
      'SELECT id, name, display_order as displayOrder, is_active as isActive FROM categories ORDER BY display_order ASC, name ASC'
    ).all();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories — admin
router.post('/', authMiddleware, adminMiddleware, validate(createCategorySchema), async (req, res, next) => {
  try {
    const { name, displayOrder } = req.validatedBody;
    const result = await db.prepare(
      'INSERT INTO categories (name, display_order) VALUES (?, ?)'
    ).run(name, displayOrder);
    const category = await db.prepare(
      'SELECT id, name, display_order as displayOrder, is_active as isActive FROM categories WHERE id = ?'
    ).get(result.lastInsertRowid);
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/categories/:id — admin
router.put('/:id', authMiddleware, adminMiddleware, validate(updateCategorySchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const { name, displayOrder } = req.validatedBody;
    await db.prepare(
      'UPDATE categories SET name = COALESCE(?, name), display_order = COALESCE(?, display_order) WHERE id = ?'
    ).run(name ?? null, displayOrder ?? null, id);

    const updated = await db.prepare(
      'SELECT id, name, display_order as displayOrder, is_active as isActive FROM categories WHERE id = ?'
    ).get(id);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/categories/:id — admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const services = await db.prepare('SELECT COUNT(*) as count FROM services WHERE category_id = ?').get(id);
    if (services.count > 0) {
      return res.status(409).json({ error: 'Cannot delete category with existing services' });
    }

    await db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ data: { message: 'Category deleted' } });
  } catch (err) {
    next(err);
  }
});

export default router;
