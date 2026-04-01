import app from './app.js';
import { PORT } from './config.js';
import { runMigrations } from './db/migrate.js';
import { seedAdmin } from './db/seed.js';

runMigrations();
console.log('Database migrations completed');

seedAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
