import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceSchemas.js';

const router = Router();

const SERVICE_SELECT = `
  SELECT s.id, s.category_id as categoryId, s.name, s.description,
         s.image_url as imageUrl,
         s.duration_minutes as durationMinutes, s.price, s.is_active as isActive,
         s.is_package as isPackage, c.name as categoryName
  FROM services s
  JOIN categories c ON s.category_id = c.id
`;

async function attachPackageItems(service) {
  if (!service || !service.isPackage) return service;
  const items = await db.prepare(`
    SELECT s.id, s.name, s.price, s.duration_minutes as durationMinutes
    FROM package_items pi
    JOIN services s ON pi.service_id = s.id
    WHERE pi.package_id = ?
  `).all(service.id);
  return { ...service, packageItems: items };
}

// GET /api/v1/services — public
router.get('/', async (req, res, next) => {
  try {
    const { category_id } = req.query;
    let query = SERVICE_SELECT + ' WHERE s.is_active = 1 AND c.is_active = 1';
    const params = [];
    if (category_id) { query += ' AND s.category_id = ?'; params.push(category_id); }
    query += ' ORDER BY s.is_package ASC, c.display_order ASC, s.name ASC';

    const rows = await db.prepare(query).all(...params);
    const services = await Promise.all(rows.map(attachPackageItems));
    res.json({ data: services });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/services/admin/all — admin: returns ALL services incl. inactive
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const query = SERVICE_SELECT + ' ORDER BY s.is_package ASC, c.display_order ASC, s.name ASC';
    const rows = await db.prepare(query).all();
    const services = await Promise.all(rows.map(attachPackageItems));
    res.json({ data: services });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/services/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const service = await db.prepare(SERVICE_SELECT + ' WHERE s.id = ?').get(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ data: await attachPackageItems(service) });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/services — admin
router.post('/', authMiddleware, adminMiddleware, validate(createServiceSchema), async (req, res, next) => {
  try {
    const { categoryId, name, description, imageUrl, durationMinutes, price, isPackage, packageServiceIds } = req.validatedBody;

    const category = await db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
    if (!category) return res.status(400).json({ error: 'Category not found' });

    const cleanDesc = (description && description.trim() && description.trim() !== '0') ? description.trim() : null;
    const result = await db.prepare(
      'INSERT INTO services (category_id, name, description, image_url, duration_minutes, price, is_package) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(categoryId, name, cleanDesc, imageUrl || '', durationMinutes, price, isPackage ? 1 : 0);

    // Add package items if this is a package
    if (isPackage && packageServiceIds?.length) {
      const insert = db.prepare('INSERT INTO package_items (package_id, service_id) VALUES (?, ?)');
      for (const svcId of packageServiceIds) {
        await insert.run(result.lastInsertRowid, svcId);
      }
    }

    const service = await db.prepare(SERVICE_SELECT + ' WHERE s.id = ?').get(result.lastInsertRowid);
    res.status(201).json({ data: await attachPackageItems(service) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/services/:id — admin
router.put('/:id', authMiddleware, adminMiddleware, validate(updateServiceSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Service not found' });

    const { categoryId, name, description, imageUrl, durationMinutes, price, isActive, isPackage, packageServiceIds } = req.validatedBody;

    await db.prepare(`
      UPDATE services SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        duration_minutes = COALESCE(?, duration_minutes),
        price = COALESCE(?, price),
        is_active = COALESCE(?, is_active),
        is_package = COALESCE(?, is_package)
      WHERE id = ?
    `).run(
      categoryId ?? null, name ?? null, description ?? null,
      imageUrl ?? null,
      durationMinutes ?? null, price ?? null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      isPackage !== undefined ? (isPackage ? 1 : 0) : null, id
    );

    // Update package items if provided
    if (packageServiceIds !== undefined) {
      await db.prepare('DELETE FROM package_items WHERE package_id = ?').run(id);
      if (packageServiceIds?.length) {
        const insert = db.prepare('INSERT INTO package_items (package_id, service_id) VALUES (?, ?)');
        for (const svcId of packageServiceIds) {
          await insert.run(id, svcId);
        }
      }
    }

    const updated = await db.prepare(SERVICE_SELECT + ' WHERE s.id = ?').get(id);
    res.json({ data: await attachPackageItems(updated) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/services/:id — admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Service not found' });

    // Check if service has bookings
    const bookings = await db.prepare("SELECT COUNT(*) as count FROM bookings WHERE service_id = ? AND status != 'cancelled'").get(id);
    if (bookings.count > 0) {
      return res.status(409).json({ error: `Cannot delete — this service has ${bookings.count} active booking(s). Deactivate it instead.` });
    }

    await db.prepare('DELETE FROM package_items WHERE package_id = ?').run(id);
    await db.prepare('DELETE FROM package_items WHERE service_id = ?').run(id);
    await db.prepare('DELETE FROM services WHERE id = ?').run(id);
    res.json({ data: { message: 'Service deleted' } });
  } catch (err) {
    next(err);
  }
});

export default router;
