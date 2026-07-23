import { Router } from 'express';
import { SALON_NAME, SALON_LOGO_URL, PRIMARY_COLOR, SECONDARY_COLOR } from '../config.js';
import db from '../db/database.js';

const router = Router();

// GET /api/v1/config/branding — public
// Prefers DB-stored values (edited by admin via Salon Info page), falls back to env vars.
router.get('/branding', async (req, res) => {
  let salonName = SALON_NAME;
  let logoUrl = SALON_LOGO_URL;
  let galleryImages = [];
  try {
    const row = await db.prepare(
      'SELECT salon_name as salonName, logo_url as logoUrl, gallery_images as galleryImages FROM salon_info WHERE id = 1'
    ).get();
    if (row?.salonName) salonName = row.salonName;
    if (row?.logoUrl) logoUrl = row.logoUrl;
    try {
      const parsed = JSON.parse(row?.galleryImages || '[]');
      if (Array.isArray(parsed)) galleryImages = parsed.filter((s) => typeof s === 'string' && s);
    } catch {
      galleryImages = [];
    }
  } catch {
    // salon_info not yet migrated — fall back to env values
  }
  res.json({
    data: {
      salonName,
      logoUrl,
      galleryImages,
      primaryColor: PRIMARY_COLOR,
      secondaryColor: SECONDARY_COLOR,
    },
  });
});

export default router;
