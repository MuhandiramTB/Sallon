import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { getDayName } from '../../lib/formatDate.js';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Spinner from '../../ui/Spinner.jsx';

export default function OperatingHoursPage() {
  const [hours, setHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api('/operating-hours').then((res) => setHours(res.data)).finally(() => setIsLoading(false));
  }, []);

  const updateHour = (dayOfWeek, field, value) => {
    setHours(hours.map((h) => h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await api('/operating-hours', { method: 'PUT', body: { hours } });
      setHours(res.data);
      setMessage('Saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error: ' + err.message); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Operating Hours</h1>
        <Button onClick={handleSave} isLoading={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl mb-5 text-sm font-medium animate-slide-up ${message.startsWith('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {hours.map((h) => (
          <Card key={h.dayOfWeek} className={`flex flex-col sm:flex-row sm:items-center gap-3 py-4 transition-opacity ${h.isClosed ? 'opacity-50' : ''}`}>
            <div className="font-semibold text-white min-w-[100px]">{getDayName(h.dayOfWeek)}</div>
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <input
                type="time" value={h.openTime}
                onChange={(e) => updateHour(h.dayOfWeek, 'openTime', e.target.value)}
                disabled={h.isClosed}
                className="border border-white/10 bg-white/5 text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark]"
              />
              <span className="text-white/60">to</span>
              <input
                type="time" value={h.closeTime}
                onChange={(e) => updateHour(h.dayOfWeek, 'closeTime', e.target.value)}
                disabled={h.isClosed}
                className="border border-white/10 bg-white/5 text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark]"
              />
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px] ml-auto">
                <input
                  type="checkbox" checked={h.isClosed}
                  onChange={(e) => updateHour(h.dayOfWeek, 'isClosed', e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 text-accent focus:ring-accent/50"
                />
                <span className="text-sm text-white/60 font-medium">Closed</span>
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
