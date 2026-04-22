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
import { openWhatsApp, waTemplates } from '../../lib/whatsapp.js';

const STATUS_ACTIONS = {
  confirm: { title: 'Confirm & Notify?', message: 'This will confirm the booking and open WhatsApp so you can send the confirmation to the customer.', confirmLabel: 'Yes, Confirm & Notify', variant: 'warning', newStatus: 'confirmed' },
  complete: { title: 'Mark as Completed?', message: 'This will mark the appointment as completed and open WhatsApp so you can send a thank-you message.', confirmLabel: 'Yes, Complete', variant: 'warning', newStatus: 'completed' },
  cancel: { title: 'Cancel & Notify?', message: 'This will cancel the booking and open WhatsApp so you can notify the customer.', confirmLabel: 'Yes, Cancel & Notify', variant: 'danger', newStatus: 'cancelled' },
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
  const [salonName, setSalonName] = useState('our salon');

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
  useEffect(() => {
    api('/config/branding').then((res) => setSalonName(res.data?.salonName || 'our salon')).catch(() => {});
  }, []);

  const sendWhatsApp = (b, kind) => {
    if (!b.customerPhone) {
      setToast('Customer has no phone number saved.');
      return;
    }
    const message = waTemplates[kind]({ ...b, salonName, appUrl: window.location.origin });
    const ok = openWhatsApp(b.customerPhone, message);
    if (!ok) setToast('Could not open WhatsApp. Check the customer phone number format.');
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setIsActioning(true);
    try {
      const config = STATUS_ACTIONS[actionTarget.action];
      await api(`/admin/bookings/${actionTarget.bookingId}`, { method: 'PATCH', body: { status: config.newStatus } });
      const booking = actionTarget.booking;
      const notifyKind = actionTarget.action === 'confirm' ? 'confirm'
        : actionTarget.action === 'cancel' ? 'cancel'
        : actionTarget.action === 'complete' ? 'complete' : null;
      setActionTarget(null);
      loadBookings();
      // After status change, offer WhatsApp notification
      if (notifyKind && booking?.customerPhone) {
        const message = waTemplates[notifyKind]({ ...booking, salonName, appUrl: window.location.origin });
        openWhatsApp(booking.customerPhone, message);
      }
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
                  <button onClick={() => setActionTarget({ bookingId: b.id, action: 'confirm', booking: b })}
                    className="text-xs font-medium bg-green-500/20 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 min-h-[36px] transition-colors"
                    title="Confirm booking + open WhatsApp to notify">
                    ✅ Confirm
                  </button>
                )}
                {b.status === 'confirmed' && (
                  <button onClick={() => setActionTarget({ bookingId: b.id, action: 'complete', booking: b })}
                    className="text-xs font-medium bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 min-h-[36px] transition-colors">
                    Complete
                  </button>
                )}
                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button onClick={() => setActionTarget({ bookingId: b.id, action: 'cancel', booking: b })}
                    className="text-xs font-medium bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 min-h-[36px] transition-colors">
                    Cancel
                  </button>
                )}
                {b.customerPhone && (
                  <button
                    onClick={() => sendWhatsApp(b, b.status === 'pending' ? 'confirm' : b.status === 'completed' ? 'complete' : 'reminder')}
                    className="text-xs font-medium bg-green-600/20 text-green-400 px-3 py-2 rounded-lg hover:bg-green-600/30 min-h-[36px] transition-colors ml-auto flex items-center gap-1"
                    title="Send WhatsApp message to customer">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                    WhatsApp
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
