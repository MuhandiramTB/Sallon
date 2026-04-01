import db from '../db/database.js';

/**
 * Generate available time slots for a given service and date.
 * Excludes already-booked slots and past times for today.
 */
export function getAvailableSlots(serviceId, date) {
  // Get service duration
  const service = db.prepare('SELECT duration_minutes FROM services WHERE id = ? AND is_active = 1').get(serviceId);
  if (!service) return { error: 'Service not found', slots: [] };

  // Get day of week (0=Sunday, 6=Saturday)
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();

  // Get operating hours for that day
  const hours = db.prepare('SELECT open_time, close_time, is_closed FROM operating_hours WHERE day_of_week = ?').get(dayOfWeek);
  if (!hours || hours.is_closed) {
    return { error: null, slots: [], closed: true };
  }

  const duration = service.duration_minutes;
  const openMinutes = timeToMinutes(hours.open_time);
  const closeMinutes = timeToMinutes(hours.close_time);

  // Generate all possible slots
  const allSlots = [];
  for (let start = openMinutes; start + duration <= closeMinutes; start += duration) {
    allSlots.push({
      startTime: minutesToTime(start),
      endTime: minutesToTime(start + duration),
    });
  }

  // Get booked slots for this date (non-cancelled)
  const booked = db.prepare(
    "SELECT start_time, end_time FROM bookings WHERE booking_date = ? AND status != 'cancelled'"
  ).all(date);

  // Filter out slots that overlap with booked times
  const available = allSlots.filter((slot) => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    return !booked.some((b) => {
      const bookedStart = timeToMinutes(b.start_time);
      const bookedEnd = timeToMinutes(b.end_time);
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });
  });

  // If date is today, filter out past slots
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (date === today) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return {
      error: null,
      slots: available.filter((s) => timeToMinutes(s.startTime) > currentMinutes),
      closed: false,
    };
  }

  return { error: null, slots: available, closed: false };
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}
