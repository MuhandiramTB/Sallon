import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { getDayName } from '../../lib/formatDate.js';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Spinner from '../../ui/Spinner.jsx';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export default function OperatingHoursPage() {
  const [hours, setHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [bulkOpen, setBulkOpen] = useState('09:00');
  const [bulkClose, setBulkClose] = useState('19:00');

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    setIsLoading(true);
    try {
      const res = await api('/operating-hours');
      // Normalize: ensure every day 0-6 has a row, deduplicate, convert isClosed to boolean
      const byDay = new Map();
      (res.data || []).forEach((h) => {
        byDay.set(Number(h.dayOfWeek), {
          dayOfWeek: Number(h.dayOfWeek),
          dayName: h.dayName || getDayName(Number(h.dayOfWeek)),
          openTime: h.openTime || '09:00',
          closeTime: h.closeTime || '19:00',
          isClosed: !!h.isClosed && h.isClosed !== 0,
        });
      });
      // Fill any missing days with defaults
      const normalized = ALL_DAYS.map((day) =>
        byDay.get(day) || {
          dayOfWeek: day,
          dayName: getDayName(day),
          openTime: '09:00',
          closeTime: '19:00',
          isClosed: day === 0, // Sunday default closed
        }
      );
      setHours(normalized);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDay = (dayOfWeek, field, value) => {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  const applyToAll = () => {
    setHours((prev) =>
      prev.map((h) => ({
        ...h,
        openTime: bulkOpen,
        closeTime: bulkClose,
      }))
    );
    setMessage('Applied to all days (click Save to persist)');
    setTimeout(() => setMessage(''), 3000);
  };

  const applyWeekdaysOnly = () => {
    setHours((prev) =>
      prev.map((h) => {
        if (h.dayOfWeek === 0 || h.dayOfWeek === 6) return h; // skip weekends
        return { ...h, openTime: bulkOpen, closeTime: bulkClose };
      })
    );
    setMessage('Applied to weekdays (Mon-Fri)');
    setTimeout(() => setMessage(''), 3000);
  };

  const closeAllWeekends = () => {
    setHours((prev) =>
      prev.map((h) => {
        if (h.dayOfWeek === 0 || h.dayOfWeek === 6) {
          return { ...h, isClosed: true };
        }
        return h;
      })
    );
    setMessage('Weekends marked as closed');
    setTimeout(() => setMessage(''), 3000);
  };

  const openAllDays = () => {
    setHours((prev) => prev.map((h) => ({ ...h, isClosed: false })));
    setMessage('All days opened');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setMessage('');
    try {
      // Send integers for isClosed to match DB schema
      const payload = hours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed ? 1 : 0,
      }));
      await api('/operating-hours', { method: 'PUT', body: { hours: payload } });
      setMessage('Saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      // Reload to verify server state
      await loadHours();
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Operating Hours</h1>
        <Button onClick={handleSave} isLoading={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl mb-5 text-sm font-medium animate-slide-up ${
            message.startsWith('Error')
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-green-500/10 border border-green-500/20 text-green-400'
          }`}
        >
          {message}
        </div>
      )}

      {/* Bulk actions card */}
      <Card className="mb-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Apply
        </h3>
        <p className="text-xs text-white/60 mb-4">Set hours once and apply to multiple days at once</p>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div>
            <label className="block text-xs text-white/60 mb-1">Open</label>
            <input
              type="time"
              value={bulkOpen}
              onChange={(e) => setBulkOpen(e.target.value)}
              className="border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Close</label>
            <input
              type="time"
              value={bulkClose}
              onChange={(e) => setBulkClose(e.target.value)}
              className="border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={applyToAll}
            className="text-xs font-medium bg-accent/20 text-accent px-3 py-2 rounded-lg hover:bg-accent/30 min-h-[40px] transition-colors"
          >
            Apply to all 7 days
          </button>
          <button
            onClick={applyWeekdaysOnly}
            className="text-xs font-medium bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 min-h-[40px] transition-colors"
          >
            Apply to weekdays (Mon-Fri)
          </button>
          <button
            onClick={openAllDays}
            className="text-xs font-medium bg-green-500/20 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 min-h-[40px] transition-colors"
          >
            Open all days
          </button>
          <button
            onClick={closeAllWeekends}
            className="text-xs font-medium bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 min-h-[40px] transition-colors"
          >
            Close weekends
          </button>
        </div>
      </Card>

      {/* Per-day settings */}
      <div className="space-y-2">
        {hours.map((h) => (
          <Card
            key={`day-${h.dayOfWeek}`}
            className={`py-4 transition-opacity ${h.isClosed ? 'opacity-60' : ''}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="min-w-[110px] flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${h.isClosed ? 'bg-red-400' : 'bg-green-400'}`} />
                <span className="font-semibold text-white">{h.dayName || getDayName(h.dayOfWeek)}</span>
              </div>

              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <input
                  type="time"
                  value={h.openTime}
                  onChange={(e) => updateDay(h.dayOfWeek, 'openTime', e.target.value)}
                  disabled={h.isClosed}
                  className="border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark] disabled:opacity-40"
                />
                <span className="text-white/40 text-sm">to</span>
                <input
                  type="time"
                  value={h.closeTime}
                  onChange={(e) => updateDay(h.dayOfWeek, 'closeTime', e.target.value)}
                  disabled={h.isClosed}
                  className="border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark] disabled:opacity-40"
                />
              </div>

              <button
                onClick={() => updateDay(h.dayOfWeek, 'isClosed', !h.isClosed)}
                className={`text-xs font-medium px-4 py-2 rounded-lg min-h-[40px] transition-colors sm:ml-auto ${
                  h.isClosed
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {h.isClosed ? 'CLOSED' : 'OPEN'}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
