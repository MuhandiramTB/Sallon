import app from './app.js';
import { PORT } from './config.js';
import { runMigrations } from './db/migrate.js';
import { seedAdmin } from './db/seed.js';

async function start() {
  try {
    await runMigrations();
    console.log('Database migrations completed');
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

start();
