import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { CORS_ORIGIN } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import operatingHoursRoutes from './routes/operatingHoursRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import configRoutes from './routes/configRoutes.js';
import salonInfoRoutes from './routes/salonInfoRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy (required behind Render/Vercel/Railway)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors(isProduction ? {} : { origin: CORS_ORIGIN }));
// 8 MB limit accommodates base64-encoded logo + homepage gallery uploads
// (up to 8 gallery images at ~200 KB each → ~1.6 MB base64, plus headroom).
app.use(express.json({ limit: '8mb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 10 : 1000, // Strict in prod, lenient in dev/test
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isProduction ? 100 : 10000, // Strict in prod, lenient in dev/test
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limits
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1', apiLimiter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ data: { status: 'ok', uptime: process.uptime() } });
});

// Debug endpoint: check DB state (admin-safe — just counts)
app.get('/api/v1/debug/db-state', async (req, res, next) => {
  try {
    const { default: db } = await import('./db/database.js');
    const users = await db.prepare('SELECT COUNT(*) as c FROM users').get();
    const categories = await db.prepare('SELECT COUNT(*) as c FROM categories').get();
    const services = await db.prepare('SELECT COUNT(*) as c FROM services').get();
    const bookings = await db.prepare('SELECT COUNT(*) as c FROM bookings').get();
    res.json({
      data: {
        isPostgres: db.isPostgres,
        users: users.c,
        categories: categories.c,
        services: services.c,
        bookings: bookings.c,
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          seedDemo: process.env.SEED_DEMO,
          nodeEnv: process.env.NODE_ENV,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Manual seed trigger — requires a secret token to prevent abuse
app.post('/api/v1/debug/force-seed', async (req, res, next) => {
  try {
    const secret = req.headers['x-seed-secret'];
    if (secret !== process.env.JWT_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { seedDemoData } = await import('./db/seed-demo-fn.js');
    const { seedAdmin } = await import('./db/seed.js');
    await seedAdmin();
    await seedDemoData();
    res.json({ data: { message: 'Seed complete' } });
  } catch (err) {
    next(err);
  }
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/operating-hours', operatingHoursRoutes);
app.use('/api/v1/slots', slotRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/config', configRoutes);
app.use('/api/v1/salon-info', salonInfoRoutes);

// On Vercel, frontend is served by Vercel CDN — skip static serving
// On traditional hosts (Render/local), serve built React app
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
if (!isServerless) {
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
