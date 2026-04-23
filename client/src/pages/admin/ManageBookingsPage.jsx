import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  confirm: { title: 'Confirm Booking?', message: 'This will confirm the appointment for the customer.', confirmLabel: 'Yes, Confirm', variant: 'warning', newStatus: 'confirmed' },
  complete: { title: 'Mark as Completed?', message: 'This will mark the appointment as completed.', confirmLabel: 'Yes, Complete', variant: 'warning', newStatus: 'completed' },
  cancel: { title: 'Cancel Booking?', message: 'This will cancel the appointment. The time slot will become available again.', confirmLabel: 'Yes, Cancel', variant: 'danger', newStatus: 'cancelled' },
};

export default function ManageBookingsPage() {
  const [searchParams] = useSearchParams();
  const urlStatus = searchParams.get('status') || '';
  const urlDate = searchParams.get('date') || '';

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(urlDate === 'today' ? getTodayDate() : (urlDate || getTodayDate()));
  const [filterStatus, setFilterStatus] = useState(urlStatus);
  // Default to Daily View (shows today's bookings) — admin usually cares about today first.
  // Override only when URL explicitly has no date and status filter is set (e.g. /admin/bookings?status=completed).
  const [isDailyView, setIsDailyView] = useState(urlStatus && !urlDate ? false : true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);
  const [isActioning, setIsActioning] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const [salonName, setSalonName] = useState('our salon');
  // Track which bookings had their confirmation WhatsApp sent (persists in localStorage)
  const [confirmSent, setConfirmSent] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('wa_confirm_sent') || '[]')); }
    catch { return new Set(); }
  });
  const markConfirmSent = (id) => {
    const next = new Set(confirmSent);
    next.add(id);
    setConfirmSent(next);
    localStorage.setItem('wa_confirm_sent', JSON.stringify([...next]));
  };

  const showError = (msg) => setToast({ message: msg, type: 'error' });
  const showSuccess = (msg) => setToast({ message: msg, type: 'success' });

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
      showError('Customer has no phone number saved.');
      return;
    }
    const message = waTemplates[kind]({ ...b, salonName, appUrl: window.location.origin });
    const ok = openWhatsApp(b.customerPhone, message);
    if (!ok) {
      showError('Could not open WhatsApp. Check the customer phone number format.');
      return;
    }
    if (kind === 'confirm') markConfirmSent(b.id);
  };

  // One-click: confirm the booking AND open WhatsApp with the confirmation message.
  // IMPORTANT: Open WhatsApp SYNCHRONOUSLY inside the click handler — browsers block window.open()
  // after an async await (popup blocker). We fire the API call in parallel, not before the open.
  const confirmAndNotify = (b) => {
    // 1. Open WhatsApp immediately (sync, within user click) so popup blockers allow it
    if (b.customerPhone) {
      const message = waTemplates.confirm({ ...b, salonName, appUrl: window.location.origin });
      const ok = openWhatsApp(b.customerPhone, message);
      if (ok) markConfirmSent(b.id);
    }
    // 2. Update status in background
    api(`/admin/bookings/${b.id}`, { method: 'PATCH', body: { status: 'confirmed' } })
      .then(() => {
        showSuccess('Booking confirmed');
        loadBookings();
      })
      .catch((err) => showError(err.message));
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setIsActioning(true);
    try {
      const config = STATUS_ACTIONS[actionTarget.action];
      await api(`/admin/bookings/${actionTarget.bookingId}`, { method: 'PATCH', body: { status: config.newStatus } });
      setActionTarget(null);
      loadBookings();
      // Show success toast — admin uses WhatsApp button separately
      const successMsg = actionTarget.action === 'confirm' ? 'Booking confirmed'
        : actionTarget.action === 'complete' ? 'Booking marked as completed'
        : actionTarget.action === 'cancel' ? 'Booking cancelled' : 'Updated';
      showSuccess(successMsg);
    } catch (err) {
      setActionTarget(null);
      showError(err.message);
    } finally { setIsActioning(false); }
  };

  const actionConfig = actionTarget ? STATUS_ACTIONS[actionTarget.action] : {};

  // Distinct service names for the service filter dropdown
  const serviceNames = [...new Set(bookings.map((b) => b.serviceName).filter(Boolean))].sort();

  const filteredBookings = bookings.filter((b) => {
    if (serviceFilter && b.serviceName !== serviceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${b.customerName || ''} ${b.customerPhone || ''} ${b.customerEmail || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dtA = `${a.bookingDate} ${a.startTime}`;
    const dtB = `${b.bookingDate} ${b.startTime}`;
    switch (sortBy) {
      case 'date-asc': return dtA.localeCompare(dtB);
      case 'date-desc': return dtB.localeCompare(dtA);
      case 'name-asc': return (a.customerName || '').localeCompare(b.customerName || '');
      case 'price-desc': return (b.price || 0) - (a.price || 0);
      case 'price-asc': return (a.price || 0) - (b.price || 0);
      default: return 0;
    }
  });

  const hasActiveFilters = search || serviceFilter || sortBy !== 'date-desc';
  const clearFilters = () => { setSearch(''); setServiceFilter(''); setSortBy('date-desc'); };

  return (
    <div className="py-6 animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-3">
          {isDailyView ? "Today's Schedule" : 'All Bookings'}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-none min-w-0 border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-2 sm:px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [&>option]:bg-[#2a2a3d] [&>option]:text-white">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => setIsDailyView(!isDailyView)}
            className="border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg px-3 py-2 min-h-[40px] text-sm font-medium transition-colors flex items-center gap-1.5 flex-shrink-0"
            title={isDailyView ? 'Show all bookings' : 'Show today only'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="hidden sm:inline">{isDailyView ? 'Show All' : 'Daily View'}</span>
            <span className="sm:hidden">{isDailyView ? 'All' : 'Daily'}</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`border rounded-lg px-3 py-2 min-h-[40px] text-sm font-medium transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              hasActiveFilters
                ? 'bg-accent/20 text-accent border-accent/30'
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
            }`}
            title="Search, service filter, sort"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <span className="hidden sm:inline">Filter & Sort</span>
            <span className="sm:hidden">Filter</span>
            {hasActiveFilters && <span className="text-accent">•</span>}
          </button>
        </div>
        {isDailyView && (
          <div className="mt-2">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
              className="w-full sm:w-auto border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark]" />
          </div>
        )}
      </div>

      {showFilters && (
        <Card className="mb-5 animate-slide-up !p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-white/60 mb-1.5">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or mobile number"
                className="w-full border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5">Service</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [&>option]:bg-[#2a2a3d] [&>option]:text-white"
              >
                <option value="">All Services</option>
                {serviceNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-white/10 bg-[#2a2a3d] text-white rounded-lg px-3 py-2 min-h-[40px] text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent [&>option]:bg-[#2a2a3d] [&>option]:text-white"
              >
                <option value="date-desc">Date (newest first)</option>
                <option value="date-asc">Date (oldest first)</option>
                <option value="name-asc">Customer name (A-Z)</option>
                <option value="price-desc">Price (high to low)</option>
                <option value="price-asc">Price (low to high)</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-white/60">
                Showing {sortedBookings.length} of {bookings.length}
              </span>
              <button onClick={clearFilters} className="text-xs text-accent hover:underline">
                Clear filters
              </button>
            </div>
          )}
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : sortedBookings.length === 0 ? (
        <EmptyState icon="📅" title="No bookings found" description="No bookings match your current filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBookings.map((b) => (
            <Card key={b.id} className="!p-4">
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
              {(b.status === 'pending' || b.status === 'confirmed') && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  {/* Complete icon — only for confirmed */}
                  {b.status === 'confirmed' && (
                    <button onClick={() => setActionTarget({ bookingId: b.id, action: 'complete', booking: b })}
                      className="w-10 h-10 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex-shrink-0"
                      title="Mark as completed">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12l3 3L18 5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 12l3 3 7-7" /></svg>
                    </button>
                  )}

                  {/* Primary action:
                        Pending + has phone  → Send Confirm (auto-confirms on click)
                        Pending + no phone   → Confirm (text only, no WA)
                        Confirmed + has phone → Send Reminder
                        Confirmed + no phone  → (no button) */}
                  {b.status === 'pending' && b.customerPhone && (
                    <button
                      onClick={() => confirmAndNotify(b)}
                      className="flex-1 min-w-0 text-xs font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 px-3 py-2 rounded-lg min-h-[36px] transition-colors flex items-center justify-center gap-1.5"
                      title="Confirm booking and send WhatsApp message"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                      <span className="truncate">Send Confirm</span>
                    </button>
                  )}
                  {b.status === 'pending' && !b.customerPhone && (
                    <button
                      onClick={() => setActionTarget({ bookingId: b.id, action: 'confirm', booking: b })}
                      className="flex-1 min-w-0 text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-2 rounded-lg min-h-[36px] transition-colors flex items-center justify-center gap-1.5"
                      title="Confirm booking (no phone to notify)"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Confirm
                    </button>
                  )}
                  {b.status === 'confirmed' && b.customerPhone && (
                    <button
                      onClick={() => sendWhatsApp(b, 'reminder')}
                      className="flex-1 min-w-0 text-xs font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-3 py-2 rounded-lg min-h-[36px] transition-colors flex items-center justify-center gap-1.5"
                      title="Send reminder to customer on WhatsApp"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                      <span className="truncate">Send Reminder</span>
                    </button>
                  )}

                  <button onClick={() => setActionTarget({ bookingId: b.id, action: 'cancel', booking: b })}
                    className="w-10 h-10 flex items-center justify-center bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex-shrink-0 ml-auto"
                    title="Cancel booking">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
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

      {toast && <Toast message={toast.message} type={toast.type || 'error'} onClose={() => setToast(null)} />}
    </div>
  );
}
