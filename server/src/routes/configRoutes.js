import { Router } from 'express';
import { SALON_NAME, SALON_LOGO_URL, PRIMARY_COLOR, SECONDARY_COLOR } from '../config.js';

const router = Router();

// GET /api/v1/config/branding — public
router.get('/branding', (req, res) => {
  res.json({
    data: {
      salonName: SALON_NAME,
      logoUrl: SALON_LOGO_URL,
      primaryColor: PRIMARY_COLOR,
      secondaryColor: SECONDARY_COLOR,
    },
  });
});

export default router;
