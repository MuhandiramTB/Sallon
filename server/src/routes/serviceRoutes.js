import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceSchemas.js';

const router = Router();

const SERVICE_SELECT = `
  SELECT s.id, s.category_id as categoryId, s.name, s.description,
         s.duration_minutes as durationMinutes, s.price, s.is_active as isActive,
         s.is_package as isPackage, c.name as categoryName
  FROM services s
  JOIN categories c ON s.category_id = c.id
`;

function attachPackageItems(service) {
  if (!service || !service.isPackage) return service;
  const items = db.prepare(`
    SELECT s.id, s.name, s.price, s.duration_minutes as durationMinutes
    FROM package_items pi
    JOIN services s ON pi.service_id = s.id
    WHERE pi.package_id = ?
  `).all(service.id);
  return { ...service, packageItems: items };
}

// GET /api/v1/services — public
router.get('/', (req, res) => {
  const { category_id } = req.query;
  let query = SERVICE_SELECT + ' WHERE s.is_active = 1 AND c.is_active = 1';
  const params = [];
  if (category_id) { query += ' AND s.category_id = ?'; params.push(category_id); }
  query += ' ORDER BY s.is_package ASC, c.display_order ASC, s.name ASC';

  const services = db.prepare(query).all(...params).map(attachPackageItems);
  res.json({ data: services });
});

// GET /api/v1/services/:id — public
router.get('/:id', (req, res) => {
  const service = db.prepare(SERVICE_SELECT + ' WHERE s.id = ?').get(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json({ data: attachPackageItems(service) });
});

// POST /api/v1/services — admin
router.post('/', authMiddleware, adminMiddleware, validate(createServiceSchema), (req, res) => {
  const { categoryId, name, description, durationMinutes, price, isPackage, packageServiceIds } = req.validatedBody;

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
  if (!category) return res.status(400).json({ error: 'Category not found' });

  const cleanDesc = (description && description.trim() && description.trim() !== '0') ? description.trim() : null;
  const result = db.prepare(
    'INSERT INTO services (category_id, name, description, duration_minutes, price, is_package) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(categoryId, name, cleanDesc, durationMinutes, price, isPackage ? 1 : 0);

  // Add package items if this is a package
  if (isPackage && packageServiceIds?.length) {
    const insert = db.prepare('INSERT INTO package_items (package_id, service_id) VALUES (?, ?)');
    for (const svcId of packageServiceIds) {
      insert.run(result.lastInsertRowid, svcId);
    }
  }

  const service = db.prepare(SERVICE_SELECT + ' WHERE s.id = ?').get(result.lastInsertRowid);
  res.status(201).json({ data: attachPackageItems(service) });
});

// PUT /api/v1/services/:id — admin
router.put('/:id', authMiddleware, adminMiddleware, validate(updateServiceSchema), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Service not found' });

  const { categoryId, name, description, durationMinutes, price, isActive, isPackage, packageServiceIds } = req.validatedBody;

  db.prepare(`
    UPDATE services SET
      category_id = COALESCE(?, category_id),
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      duration_minutes = COALESCE(?, duration_minutes),
      price = COALESCE(?, price),
      is_active = COALESCE(?, is_active),
      is_package = COALESCE(?, is_package)
    WHERE id = ?
  `).run(
    categoryId ?? null, name ?? null, description ?? null,
    durationMinutes ?? null, price ?? null,
    isActive !== undefined ? (isActive ? 1 : 0) : null,
    isPackage !== undefined ? (isPackage ? 1 : 0) : null, id
  );

  // Update package items if provided
  if (packageServiceIds !== undefined) {
    db.prepare('DELETE FROM package_items WHERE package_id = ?').run(id);
    if (packageServiceIds?.length) {
      const insert = db.prepare('INSERT INTO package_items (package_id, service_id) VALUES (?, ?)');
      for (const svcId of packageServiceIds) {
        insert.run(id, svcId);
      }
    }
  }

  const updated = db.prepare(SERVICE_SELECT + ' WHERE s.id = ?').get(id);
  res.json({ data: attachPackageItems(updated) });
});

// DELETE /api/v1/services/:id — admin
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Service not found' });

  // Check if service has bookings
  const bookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE service_id = ? AND status != 'cancelled'").get(id);
  if (bookings.count > 0) {
    return res.status(409).json({ error: `Cannot delete — this service has ${bookings.count} active booking(s). Deactivate it instead.` });
  }

  db.prepare('DELETE FROM package_items WHERE package_id = ?').run(id);
  db.prepare('DELETE FROM package_items WHERE service_id = ?').run(id);
  db.prepare('DELETE FROM services WHERE id = ?').run(id);
  res.json({ data: { message: 'Service deleted' } });
});

export default router;
