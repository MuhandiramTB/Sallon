import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { getTodayDate, formatDate, formatTime } from '../../lib/formatDate.js';
import BookingStatusBadge from '../../components/BookingStatusBadge.jsx';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import Spinner from '../../ui/Spinner.jsx';

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(getTodayDate());
  const [filterStatus, setFilterStatus] = useState('');
  const [isDailyView, setIsDailyView] = useState(false);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (isDailyView && filterDate) params.set('date', filterDate);
      if (filterStatus) params.set('status', filterStatus);
      const res = await api(`/admin/bookings?${params}`);
      setBookings(res.data);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { loadBookings(); }, [filterDate, filterStatus, isDailyView]);

  const updateStatus = async (id, status) => {
    try { await api(`/admin/bookings/${id}`, { method: 'PATCH', body: { status } }); loadBookings(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-text-primary">
          {isDailyView ? "Today's Schedule" : 'All Bookings'}
        </h1>
        <Button variant="secondary" onClick={() => setIsDailyView(!isDailyView)} className="text-sm">
          {isDailyView ? 'Show All' : 'Daily View'}
        </Button>
      </div>

      <Card className="flex gap-3 mb-6 flex-wrap p-4">
        {isDailyView && (
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary" />
        )}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Card>

      {isLoading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <EmptyState icon="📅" title="No bookings found" description="No bookings match your current filters." />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-[80px]">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{formatTime(b.startTime)}</div>
                    {!isDailyView && <div className="text-xs text-text-muted">{formatDate(b.bookingDate)}</div>}
                  </div>
                </div>
                <div className="w-px h-10 bg-border hidden sm:block" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{b.customerName}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <div className="text-sm text-text-secondary">{b.serviceName} &middot; Rs. {b.price}</div>
                  {b.customerPhone ? (
                    <a
                      href={`tel:${b.customerPhone}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(b.customerPhone);
                        const el = e.currentTarget;
                        el.textContent = 'Copied!';
                        setTimeout(() => { el.textContent = b.customerPhone; }, 1500);
                        window.open(`tel:${b.customerPhone}`);
                      }}
                      className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1"
                      title="Tap to call / copy number"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {b.customerPhone}
                    </a>
                  ) : (
                    <div className="text-xs text-text-muted">{b.customerEmail}</div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {b.status === 'pending' && (
                    <button onClick={() => updateStatus(b.id, 'confirmed')}
                      className="text-xs font-medium bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 min-h-[40px] transition-colors">
                      Confirm
                    </button>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b.id, 'completed')}
                      className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 min-h-[40px] transition-colors">
                      Complete
                    </button>
                  )}
                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                    <button onClick={() => updateStatus(b.id, 'cancelled')}
                      className="text-xs font-medium bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 min-h-[40px] transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
