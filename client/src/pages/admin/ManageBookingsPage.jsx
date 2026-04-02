import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { getTodayDate, formatDate, formatTime } from '../../lib/formatDate.js';
import BookingStatusBadge from '../../components/BookingStatusBadge.jsx';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import ConfirmModal from '../../ui/ConfirmModal.jsx';
import Toast from '../../ui/Toast.jsx';
import Spinner from '../../ui/Spinner.jsx';

const STATUS_ACTIONS = {
  confirm: { title: 'Confirm Booking?', message: 'This will confirm the appointment for the customer.', confirmLabel: 'Yes, Confirm', variant: 'warning', newStatus: 'confirmed' },
  complete: { title: 'Mark as Completed?', message: 'This will mark the appointment as completed.', confirmLabel: 'Yes, Complete', variant: 'warning', newStatus: 'completed' },
  cancel: { title: 'Cancel Booking?', message: 'This will cancel the appointment. The time slot will become available again.', confirmLabel: 'Yes, Cancel It', variant: 'danger', newStatus: 'cancelled' },
};

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(getTodayDate());
  const [filterStatus, setFilterStatus] = useState('');
  const [isDailyView, setIsDailyView] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);
  const [isActioning, setIsActioning] = useState(false);
  const [toast, setToast] = useState('');

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

  const handleAction = async () => {
    if (!actionTarget) return;
    setIsActioning(true);
    try {
      const config = STATUS_ACTIONS[actionTarget.action];
      await api(`/admin/bookings/${actionTarget.bookingId}`, { method: 'PATCH', body: { status: config.newStatus } });
      setActionTarget(null);
      loadBookings();
    } catch (err) {
      setActionTarget(null);
      setToast(err.message);
    } finally { setIsActioning(false); }
  };

  const actionConfig = actionTarget ? STATUS_ACTIONS[actionTarget.action] : {};

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">
          {isDailyView ? "Today's Schedule" : 'All Bookings'}
        </h1>
        <Button variant="secondary" onClick={() => setIsDailyView(!isDailyView)} className="text-sm">
          {isDailyView ? 'Show All' : 'Daily View'}
        </Button>
      </div>

      <Card className="flex gap-3 mb-6 flex-wrap p-4">
        {isDailyView && (
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark]" />
        )}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[44px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [&>option]:bg-[#2a2a3d] [&>option]:text-white">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((b) => (
            <Card key={b.id} className="py-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-accent">{formatTime(b.startTime)}</div>
                  <div className="text-xs text-white/60">{formatDate(b.bookingDate)}</div>
                </div>
                <BookingStatusBadge status={b.status} />
              </div>
              <div className="space-y-1.5">
                <div className="font-medium text-white">{b.customerName}</div>
                <div className="text-sm text-white/80">{b.serviceName} &middot; Rs. {b.price}</div>
                {b.customerPhone ? (
                  <a
                    href={`tel:${b.customerPhone}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(b.customerPhone);
                      const el = e.currentTarget;
                      const original = el.innerHTML;
                      el.textContent = 'Copied!';
                      setTimeout(() => { el.innerHTML = original; }, 1500);
                      window.open(`tel:${b.customerPhone}`);
                    }}
                    className="text-xs text-accent font-medium hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                    title="Tap to call / copy number"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {b.customerPhone}
                  </a>
                ) : (
                  <div className="text-xs text-white/60">{b.customerEmail}</div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-white/10">
                {b.status === 'pending' && (
                  <button onClick={() => setActionTarget({ bookingId: b.id, action: 'confirm' })}
                    className="text-xs font-medium bg-green-500/20 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 min-h-[36px] transition-colors">
                    Confirm
                  </button>
                )}
                {b.status === 'confirmed' && (
                  <button onClick={() => setActionTarget({ bookingId: b.id, action: 'complete' })}
                    className="text-xs font-medium bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 min-h-[36px] transition-colors">
                    Complete
                  </button>
                )}
                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button onClick={() => setActionTarget({ bookingId: b.id, action: 'cancel' })}
                    className="text-xs font-medium bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 min-h-[36px] transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={handleAction}
        isLoading={isActioning}
        title={actionConfig.title || ''}
        message={actionConfig.message || ''}
        confirmLabel={actionConfig.confirmLabel || 'Confirm'}
        cancelLabel="Go Back"
        variant={actionConfig.variant || 'warning'}
      />

      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
