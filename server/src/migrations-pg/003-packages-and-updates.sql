CREATE TABLE IF NOT EXISTS package_items (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id),
  UNIQUE(package_id, service_id)
);
