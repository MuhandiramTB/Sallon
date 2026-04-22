-- ============================================
-- SallonArt — Men's Salon Seed Data
-- Run directly in Neon SQL Editor
-- Seeds: 3 categories + 14 services + 6 packages + operating hours
-- Does NOT touch users table (admin is auto-seeded by app from env vars)
-- ============================================

-- Clean existing salon data (safe to run multiple times)
DELETE FROM package_items;
DELETE FROM services;
DELETE FROM categories;

-- Reset sequences
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE services_id_seq RESTART WITH 1;

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (name, display_order, is_active) VALUES
  ('Hair', 1, 1),
  ('Beard & Shave', 2, 1),
  ('Facial & Cleanup', 3, 1);

-- ============================================
-- SERVICES (individual)
-- ============================================

-- Hair (category_id = 1)
INSERT INTO services (category_id, name, description, duration_minutes, price, is_active, is_package) VALUES
  (1, 'Haircut', 'Classic haircut with styling', 30, 500, 1, 0),
  (1, 'Kids Haircut', 'Haircut for children under 12', 20, 350, 1, 0),
  (1, 'Hair Color', 'Professional hair coloring', 60, 1500, 1, 0),
  (1, 'Hair Wash & Blow Dry', 'Shampoo wash with blow dry', 20, 300, 1, 0),
  (1, 'Head Massage', 'Relaxing head and scalp massage', 30, 600, 1, 0);

-- Beard & Shave (category_id = 2)
INSERT INTO services (category_id, name, description, duration_minutes, price, is_active, is_package) VALUES
  (2, 'Beard Trim', 'Beard shaping and trimming', 20, 300, 1, 0),
  (2, 'Beard Styling', 'Detailed beard design and styling', 30, 500, 1, 0),
  (2, 'Hot Towel Shave', 'Traditional hot towel razor shave', 30, 400, 1, 0),
  (2, 'Beard Color', 'Professional beard coloring', 45, 800, 1, 0);

-- Facial & Cleanup (category_id = 3)
INSERT INTO services (category_id, name, description, duration_minutes, price, is_active, is_package) VALUES
  (3, 'Face Cleanup', 'Basic face cleanup and exfoliation', 30, 800, 1, 0),
  (3, 'Classic Facial', 'Deep cleansing facial treatment', 60, 1500, 1, 0),
  (3, 'De-tan Facial', 'Tan removal and skin brightening', 60, 1800, 1, 0),
  (3, 'Anti-Aging Facial', 'Anti-aging treatment with serum', 75, 2500, 1, 0),
  (3, 'Eyebrow Threading', 'Precise eyebrow shaping', 15, 200, 1, 0);

-- ============================================
-- PACKAGES (combo deals with discount)
-- ============================================
INSERT INTO services (category_id, name, description, duration_minutes, price, is_active, is_package) VALUES
  (1, 'Haircut + Beard Combo', 'Haircut + Beard Trim', 50, 700, 1, 1),
  (1, 'Groom Package', 'Haircut + Beard Trim + Head Massage', 80, 1200, 1, 1),
  (1, 'Royal Grooming', 'Haircut + Beard Styling + Hot Towel Shave + Head Massage', 110, 1700, 1, 1),
  (3, 'Refresh Combo', 'Haircut + Face Cleanup', 60, 1200, 1, 1),
  (3, 'Gentleman''s Special', 'Haircut + Beard Trim + Classic Facial', 110, 2000, 1, 1),
  (3, 'Complete Makeover', 'Haircut + Hot Towel Shave + De-tan Facial + Head Massage', 150, 2800, 1, 1);

-- ============================================
-- PACKAGE ITEMS (which services are in each package)
-- ============================================
-- Service IDs:  1=Haircut, 5=Head Massage, 6=Beard Trim, 7=Beard Styling,
--               8=Hot Towel Shave, 10=Face Cleanup, 11=Classic Facial, 12=De-tan Facial
-- Package IDs: 15=Haircut+Beard, 16=Groom, 17=Royal, 18=Refresh, 19=Gentleman, 20=Complete

INSERT INTO package_items (package_id, service_id) VALUES
  -- Haircut + Beard Combo
  (15, 1), (15, 6),
  -- Groom Package
  (16, 1), (16, 6), (16, 5),
  -- Royal Grooming
  (17, 1), (17, 7), (17, 8), (17, 5),
  -- Refresh Combo
  (18, 1), (18, 10),
  -- Gentleman's Special
  (19, 1), (19, 6), (19, 11),
  -- Complete Makeover
  (20, 1), (20, 8), (20, 12), (20, 5);

-- ============================================
-- OPERATING HOURS (Mon-Sat open 9AM-7PM, Sunday closed)
-- Upsert — creates rows if missing, updates if already exist
-- Ensures day_name column exists (safe to re-run)
-- ============================================
ALTER TABLE operating_hours ADD COLUMN IF NOT EXISTS day_name TEXT;

INSERT INTO operating_hours (day_of_week, day_name, open_time, close_time, is_closed) VALUES
  (0, 'Sunday',    '09:00', '19:00', 1),   -- Sunday: CLOSED
  (1, 'Monday',    '09:00', '19:00', 0),
  (2, 'Tuesday',   '09:00', '19:00', 0),
  (3, 'Wednesday', '09:00', '19:00', 0),
  (4, 'Thursday',  '09:00', '19:00', 0),
  (5, 'Friday',    '09:00', '19:00', 0),
  (6, 'Saturday',  '09:00', '19:00', 0)
ON CONFLICT (day_of_week) DO UPDATE SET
  day_name = EXCLUDED.day_name,
  open_time = EXCLUDED.open_time,
  close_time = EXCLUDED.close_time,
  is_closed = EXCLUDED.is_closed;

-- ============================================
-- SALON INFO (contact details shown to customers)
-- ============================================
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
VALUES (1, 'For any booking changes or cancellations, please WhatsApp or call us.')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFY — see the counts
-- ============================================
SELECT 'Categories:' as label, COUNT(*)::text as count FROM categories
UNION ALL SELECT 'Services (individual):', COUNT(*)::text FROM services WHERE is_package = 0
UNION ALL SELECT 'Packages:', COUNT(*)::text FROM services WHERE is_package = 1
UNION ALL SELECT 'Package items:', COUNT(*)::text FROM package_items
UNION ALL SELECT 'Operating hours (open):', COUNT(*)::text FROM operating_hours WHERE is_closed = 0
UNION ALL SELECT 'Operating hours (closed):', COUNT(*)::text FROM operating_hours WHERE is_closed = 1;

-- Show final operating hours with day names
SELECT day_of_week, day_name, open_time, close_time, is_closed FROM operating_hours ORDER BY day_of_week;
