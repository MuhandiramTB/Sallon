// Migration SQL as JavaScript strings (for Vercel serverless — files aren't bundled otherwise)

export const PG_MIGRATIONS = [
  {
    name: '001-init.sql',
    sql: `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_package INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operating_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL UNIQUE CHECK(day_of_week BETWEEN 0 AND 6),
  open_time TEXT NOT NULL DEFAULT '09:00',
  close_time TEXT NOT NULL DEFAULT '19:00',
  is_closed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  booking_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_no_overlap
  ON bookings(booking_date, start_time)
  WHERE status != 'cancelled';
`
  },
  {
    name: '002-seed-data.sql',
    sql: `
INSERT INTO operating_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '09:00', '19:00', 1),
  (1, '09:00', '19:00', 0),
  (2, '09:00', '19:00', 0),
  (3, '09:00', '19:00', 0),
  (4, '09:00', '19:00', 0),
  (5, '09:00', '19:00', 0),
  (6, '09:00', '19:00', 0)
ON CONFLICT (day_of_week) DO NOTHING;
`
  },
  {
    name: '003-packages-and-updates.sql',
    sql: `
CREATE TABLE IF NOT EXISTS package_items (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id),
  UNIQUE(package_id, service_id)
);
`
  },
  {
    name: '004-operating-hours-day-name.sql',
    sql: `
ALTER TABLE operating_hours ADD COLUMN IF NOT EXISTS day_name TEXT;

UPDATE operating_hours SET day_name = CASE day_of_week
  WHEN 0 THEN 'Sunday'
  WHEN 1 THEN 'Monday'
  WHEN 2 THEN 'Tuesday'
  WHEN 3 THEN 'Wednesday'
  WHEN 4 THEN 'Thursday'
  WHEN 5 THEN 'Friday'
  WHEN 6 THEN 'Saturday'
END
WHERE day_name IS NULL OR day_name = '';
`
  },
  {
    name: '005-salon-info.sql',
    sql: `
CREATE TABLE IF NOT EXISTS salon_info (
  id SERIAL PRIMARY KEY,
  owner_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  google_maps_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  booking_note TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO salon_info (id, booking_note)
SELECT 1, 'For any booking changes or cancellations, please WhatsApp or call us.'
WHERE NOT EXISTS (SELECT 1 FROM salon_info WHERE id = 1);
`
  },
  {
    name: '006-salon-branding.sql',
    sql: `
ALTER TABLE salon_info ADD COLUMN IF NOT EXISTS salon_name TEXT DEFAULT '';
ALTER TABLE salon_info ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';
`
  },
];

export const SQLITE_MIGRATIONS = [
  {
    name: '001-init.sql',
    sql: `
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
  is_package INTEGER NOT NULL DEFAULT 0,
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
`
  },
  {
    name: '002-seed-data.sql',
    sql: `
INSERT OR IGNORE INTO operating_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '09:00', '19:00', 1),
  (1, '09:00', '19:00', 0),
  (2, '09:00', '19:00', 0),
  (3, '09:00', '19:00', 0),
  (4, '09:00', '19:00', 0),
  (5, '09:00', '19:00', 0),
  (6, '09:00', '19:00', 0);
`
  },
  {
    name: '003-packages-and-updates.sql',
    sql: `
CREATE TABLE IF NOT EXISTS package_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  FOREIGN KEY (package_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id),
  UNIQUE(package_id, service_id)
);
`
  },
  {
    name: '004-operating-hours-day-name.sql',
    sql: `
ALTER TABLE operating_hours ADD COLUMN day_name TEXT;

UPDATE operating_hours SET day_name = CASE day_of_week
  WHEN 0 THEN 'Sunday'
  WHEN 1 THEN 'Monday'
  WHEN 2 THEN 'Tuesday'
  WHEN 3 THEN 'Wednesday'
  WHEN 4 THEN 'Thursday'
  WHEN 5 THEN 'Friday'
  WHEN 6 THEN 'Saturday'
END;
`
  },
  {
    name: '005-salon-info.sql',
    sql: `
CREATE TABLE IF NOT EXISTS salon_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  google_maps_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  booking_note TEXT DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO salon_info (id, booking_note)
VALUES (1, 'For any booking changes or cancellations, please WhatsApp or call us.');
`
  },
  {
    name: '006-salon-branding.sql',
    sql: `
ALTER TABLE salon_info ADD COLUMN salon_name TEXT DEFAULT '';
ALTER TABLE salon_info ADD COLUMN logo_url TEXT DEFAULT '';
`
  },
];
