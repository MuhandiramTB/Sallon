// Serverless-ready app initializer for Vercel
// Caches migrations/seed across warm invocations
import app from './app.js';
import { runMigrations } from './db/migrate.js';
import { seedAdmin } from './db/seed.js';
import db from './db/database.js';

let initialized = false;
let initPromise = null;

async function initialize() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await runMigrations();
    console.log('Migrations applied');
    await seedAdmin();

    if (process.env.SEED_DEMO === 'true') {
      const existing = await db.prepare('SELECT COUNT(*) as c FROM categories').get();
      if (existing.c === 0) {
        const { seedDemoData } = await import('./db/seed-demo-fn.js');
        await seedDemoData();
      }
    }

    initialized = true;
  })();

  return initPromise;
}

export default async function handler(req, res) {
  try {
    await initialize();
  } catch (err) {
    console.error('Init failed:', err);
    return res.status(500).json({ error: 'Server initialization failed' });
  }
  return app(req, res);
}
