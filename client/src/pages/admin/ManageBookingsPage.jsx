import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { getTodayDate, formatDate, formatTime } from '../../lib/formatDate.js';
import BookingStatusBadge from '../../components/BookingStatusBadge.jsx';
import Button from '../../ui/Button.jsx';
import Spinner from '../../ui/Spinner.jsx';

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(getTodayDate());
  const [filterStatus, setFilterStatus] = useState('');
  const [isDailyView, setIsDailyView] = useState(true);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (isDailyView && filterDate) params.set('date', filterDate);
      if (filterStatus) params.set('status', filterStatus);
      const res = await api(`/admin/bookings?${params}`);
      setBookings(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, [filterDate, filterStatus, isDailyView]);

  const updateStatus = async (id, status) => {
    try {
      await api(`/admin/bookings/${id}`, { method: 'PATCH', body: { status } });
      loadBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          {isDailyView ? "Today's Schedule" : 'All Bookings'}
        </h2>
        <Button onClick={() => setIsDailyView(!isDailyView)} className="bg-gray-500 hover:bg-gray-600 text-sm">
          {isDailyView ? 'Show All' : 'Daily View'}
        </Button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        {isDailyView && (
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border rounded-lg px-3 py-2 min-h-[44px]"
          />
        )}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 min-h-[44px]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No bookings found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Time</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600 hidden sm:table-cell">Service</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-4 text-sm">
                    <div className="font-medium">{formatTime(b.startTime)}</div>
                    {!isDailyView && <div className="text-gray-400 text-xs">{formatDate(b.bookingDate)}</div>}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-sm">{b.customerName}</div>
                    <div className="text-xs text-gray-400">{b.customerPhone || b.customerEmail}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 hidden sm:table-cell">{b.serviceName}</td>
                  <td className="p-4"><BookingStatusBadge status={b.status} /></td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1 justify-end flex-wrap">
                      {b.status === 'pending' && (
                        <button onClick={() => updateStatus(b.id, 'confirmed')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 min-h-[44px]">Confirm</button>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => updateStatus(b.id, 'completed')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 min-h-[44px]">Complete</button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button onClick={() => updateStatus(b.id, 'cancelled')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 min-h-[44px]">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
