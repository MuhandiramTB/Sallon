import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { getDayName } from '../../lib/formatDate.js';
import Button from '../../ui/Button.jsx';
import Spinner from '../../ui/Spinner.jsx';

export default function OperatingHoursPage() {
  const [hours, setHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api('/operating-hours')
      .then((res) => setHours(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  const updateHour = (dayOfWeek, field, value) => {
    setHours(hours.map((h) =>
      h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
    ));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await api('/operating-hours', {
        method: 'PUT',
        body: { hours },
      });
      setHours(res.data);
      setMessage('Operating hours saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Operating Hours</h2>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {message && (
        <div className={`p-3 rounded mb-4 text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Day</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Open</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Close</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Closed</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((h) => (
              <tr key={h.dayOfWeek} className={`border-t ${h.isClosed ? 'opacity-50' : ''}`}>
                <td className="p-4 font-medium">{getDayName(h.dayOfWeek)}</td>
                <td className="p-4">
                  <input
                    type="time"
                    value={h.openTime}
                    onChange={(e) => updateHour(h.dayOfWeek, 'openTime', e.target.value)}
                    disabled={h.isClosed}
                    className="border rounded px-2 py-1 min-h-[44px]"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) => updateHour(h.dayOfWeek, 'closeTime', e.target.value)}
                    disabled={h.isClosed}
                    className="border rounded px-2 py-1 min-h-[44px]"
                  />
                </td>
                <td className="p-4">
                  <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={h.isClosed}
                      onChange={(e) => updateHour(h.dayOfWeek, 'isClosed', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-gray-500">Closed</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
