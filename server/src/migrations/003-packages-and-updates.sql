-- Add package support to services
ALTER TABLE services ADD COLUMN is_package INTEGER NOT NULL DEFAULT 0;

-- Package items junction table
CREATE TABLE IF NOT EXISTS package_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  FOREIGN KEY (package_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id),
  UNIQUE(package_id, service_id)
);
