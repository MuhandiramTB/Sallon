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
