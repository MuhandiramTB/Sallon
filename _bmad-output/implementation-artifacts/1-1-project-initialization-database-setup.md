# Story 1.1: Project Initialization & Database Setup

## Status: ready-for-dev

## Story

As a **developer**,
I want the monorepo scaffolded with database migrations,
So that all future stories have a working foundation to build on.

## Acceptance Criteria

**Given** the project is cloned and `npm install` is run
**When** `npm run dev` is executed
**Then** the Vite dev server starts on port 5173 and Express starts on port 3000
**And** SQLite database is created at `server/data/sallon.db` with WAL mode enabled
**And** all 5 tables (users, categories, services, operating_hours, bookings) are created via migration
**And** `.env.example` contains all required environment variables
**And** Vite proxies `/api/*` requests to Express in development

## Developer Implementation Guide

### Project Structure to Create

```
sallon/
├── package.json                    # Root: scripts for dev/build/start
├── .env                            # JWT_SECRET, PORT, ADMIN_EMAIL, ADMIN_PASSWORD, SALON_NAME, etc.
├── .env.example                    # Template with all vars documented
├── .gitignore                      # node_modules, .env, server/data/*.db
│
├── client/
│   ├── package.json                # react, react-dom, react-router-dom
│   ├── vite.config.js              # Tailwind plugin + proxy to Express
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Placeholder with React Router shell
│       └── index.css               # @import "tailwindcss"
│
├── server/
│   ├── package.json                # express, better-sqlite3, cors, dotenv, bcrypt, jsonwebtoken, zod
│   └── src/
│       ├── index.js                # Entry: load config, run migrations, start Express
│       ├── app.js                  # Express app: CORS, JSON parser, route mounting, static serving, error handler
│       ├── config.js               # dotenv loader, export { PORT, JWT_SECRET, DB_PATH, ... }
│       ├── db/
│       │   ├── database.js         # better-sqlite3 singleton, WAL mode, returns db instance
│       │   └── migrate.js          # Read & execute migration files in order
│       ├── migrations/
│       │   ├── 001-init.sql        # CREATE TABLE for all 5 tables
│       │   └── 002-seed-data.sql   # INSERT default operating hours (Mon-Sat 9-19, Sun closed)
│       ├── middleware/
│       │   └── errorHandler.js     # Centralized: catch errors, return { error } with status code
│       ├── routes/                  # Empty folder — routes added in later stories
│       ├── validators/             # Empty folder
│       └── utils/                  # Empty folder
│
└── server/data/
    └── .gitkeep                    # Ensure folder exists, DB file gitignored
```

### Database Schema (001-init.sql)

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS operating_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week INTEGER NOT NULL UNIQUE CHECK(day_of_week BETWEEN 0 AND 6),
  open_time TEXT NOT NULL DEFAULT '09:00',
  close_time TEXT NOT NULL DEFAULT '19:00',
  is_closed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  booking_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_no_overlap
  ON bookings(booking_date, start_time)
  WHERE status != 'cancelled';
```

### Seed Data (002-seed-data.sql)

```sql
-- Default operating hours: Mon-Sat 9AM-7PM, Sunday closed
-- day_of_week: 0=Sunday, 1=Monday, ... 6=Saturday
INSERT OR IGNORE INTO operating_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '09:00', '19:00', 1),
  (1, '09:00', '19:00', 0),
  (2, '09:00', '19:00', 0),
  (3, '09:00', '19:00', 0),
  (4, '09:00', '19:00', 0),
  (5, '09:00', '19:00', 0),
  (6, '09:00', '19:00', 0);
```

### Key Implementation Details

#### Root package.json Scripts

```json
{
  "name": "sallon",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build",
    "start": "cd server && node src/index.js",
    "install:all": "npm install && cd client && npm install && cd ../server && npm install"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

#### server/src/db/database.js

```javascript
import Database from 'better-sqlite3';
import { DB_PATH } from '../config.js';

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
```

#### server/src/db/migrate.js

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'migrations');

export function runMigrations() {
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
  }
}
```

#### server/src/config.js

```javascript
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'sallon.db');
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const SALON_NAME = process.env.SALON_NAME || 'Sallon';
export const SALON_LOGO_URL = process.env.SALON_LOGO_URL || '';
export const PRIMARY_COLOR = process.env.PRIMARY_COLOR || '#6366f1';
export const SECONDARY_COLOR = process.env.SECONDARY_COLOR || '#8b5cf6';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
```

#### server/src/app.js

```javascript
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { CORS_ORIGIN } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ data: { status: 'ok' } });
});

// Routes will be mounted here in future stories
// app.use('/api/v1/auth', authRoutes);

// Serve static files in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

export default app;
```

#### server/src/index.js

```javascript
import app from './app.js';
import { PORT } from './config.js';
import { runMigrations } from './db/migrate.js';

runMigrations();
console.log('Database migrations completed');

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

#### client/vite.config.js

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

#### client/src/index.css

```css
@import "tailwindcss";
```

#### client/src/App.jsx

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-indigo-600 text-white p-4">
          <h1 className="text-xl font-bold">Sallon</h1>
        </header>
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<div className="text-center py-20"><h2 className="text-2xl font-semibold text-gray-700">Welcome to Sallon</h2><p className="text-gray-500 mt-2">Booking system coming soon...</p></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

#### .env.example

```bash
# Server
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=server/data/sallon.db
CORS_ORIGIN=http://localhost:5173

# Admin Seed
ADMIN_EMAIL=admin@sallon.com
ADMIN_PASSWORD=admin123

# Branding (White-Label)
SALON_NAME=Sallon
SALON_LOGO_URL=
PRIMARY_COLOR=#6366f1
SECONDARY_COLOR=#8b5cf6
```

#### .gitignore

```
node_modules/
.env
server/data/*.db
server/data/*.db-wal
server/data/*.db-shm
client/dist/
```

### Architecture Compliance

- **Naming:** snake_case DB columns, camelCase JS, PascalCase React components
- **API Pattern:** `/api/v1/*` prefix, `{ data }` / `{ error }` response format
- **DB:** better-sqlite3 with WAL mode and foreign keys ON
- **Modules:** ES modules (`import`/`export`) throughout — set `"type": "module"` in both package.json files
- **Error handler:** Centralized middleware returning `{ error: message }` with appropriate HTTP status

### Dependencies to Install

**Root:** `concurrently`
**Client:** `react`, `react-dom`, `react-router-dom`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `vite`
**Server:** `express`, `cors`, `dotenv`, `better-sqlite3`, `bcrypt`, `jsonwebtoken`, `zod`

### What NOT to Do

- Do NOT create routes, validators, or utils beyond errorHandler — those come in later stories
- Do NOT install axios — we use native `fetch` wrapper (Story 1.2+)
- Do NOT add any auth middleware yet — that's Story 1.3+
- Do NOT seed admin user — that's Story 1.4
- Do NOT use CommonJS (`require`) — use ES modules only
- Do NOT create test files — tests are Phase 2

### Verification

After implementation, verify:
1. `npm run install:all` completes without errors
2. `npm run dev` starts both servers
3. `http://localhost:5173` shows the React placeholder page
4. `http://localhost:3000/api/v1/health` returns `{ "data": { "status": "ok" } }`
5. `server/data/sallon.db` exists with all 5 tables
6. Operating hours are seeded (7 rows in operating_hours table)
