import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

const SELECT_SQL = `SELECT id,
  owner_name as ownerName,
  salon_name as salonName,
  logo_url as logoUrl,
  gallery_images as galleryImages,
  phone, whatsapp, email, address,
  google_maps_url as googleMapsUrl,
  facebook_url as facebookUrl,
  instagram_url as instagramUrl,
  booking_note as bookingNote
FROM salon_info WHERE id = 1`;

// gallery_images is stored as a JSON string; expose it as an array to clients.
function parseGallery(info) {
  if (!info) return info;
  let images = [];
  try {
    const parsed = JSON.parse(info.galleryImages || '[]');
    if (Array.isArray(parsed)) images = parsed.filter((s) => typeof s === 'string' && s);
  } catch {
    images = [];
  }
  return { ...info, galleryImages: images };
}

// GET /api/v1/salon-info — public
router.get('/', async (req, res, next) => {
  try {
    const info = await db.prepare(SELECT_SQL).get();
    res.json({ data: parseGallery(info) || null });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/salon-info — admin
router.put('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const {
      ownerName = '', salonName = '', logoUrl = '',
      galleryImages = [],
      phone = '', whatsapp = '', email = '', address = '',
      googleMapsUrl = '', facebookUrl = '', instagramUrl = '', bookingNote = '',
    } = req.body || {};

    // Normalise gallery to a JSON array of non-empty strings, capped at 8 images.
    const gallery = Array.isArray(galleryImages)
      ? galleryImages.filter((s) => typeof s === 'string' && s).slice(0, 8)
      : [];
    const galleryJson = JSON.stringify(gallery);

    const existing = await db.prepare('SELECT id FROM salon_info WHERE id = 1').get();

    if (existing) {
      const nowFn = db.isPostgres ? 'NOW()' : "datetime('now')";
      await db.prepare(
        `UPDATE salon_info SET
           owner_name = ?, salon_name = ?, logo_url = ?, gallery_images = ?,
           phone = ?, whatsapp = ?, email = ?, address = ?,
           google_maps_url = ?, facebook_url = ?, instagram_url = ?, booking_note = ?,
           updated_at = ${nowFn}
         WHERE id = 1`
      ).run(ownerName, salonName, logoUrl, galleryJson, phone, whatsapp, email, address, googleMapsUrl, facebookUrl, instagramUrl, bookingNote);
    } else {
      await db.prepare(
        `INSERT INTO salon_info (id, owner_name, salon_name, logo_url, gallery_images, phone, whatsapp, email, address, google_maps_url, facebook_url, instagram_url, booking_note)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(ownerName, salonName, logoUrl, galleryJson, phone, whatsapp, email, address, googleMapsUrl, facebookUrl, instagramUrl, bookingNote);
    }

    const updated = await db.prepare(SELECT_SQL).get();
    res.json({ data: parseGallery(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
