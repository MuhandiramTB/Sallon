import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { formatDate, formatTime } from '../lib/formatDate.js';
import BookingStatusBadge from '../components/BookingStatusBadge.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import Button from '../ui/Button.jsx';
import Toast from '../ui/Toast.jsx';
import { SkeletonPage } from '../ui/Skeleton.jsx';
import ContactStrip from '../components/ContactStrip.jsx';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const loadBookings = async () => {
    try { const res = await api('/bookings/my'); setBookings(res.data); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await api(`/bookings/${cancelTarget.id}/cancel`, { method: 'PATCH' });
      setCancelTarget(null);
      loadBookings();
    } catch (err) {
      setCancelTarget(null);
      setToast(err.message);
    } finally { setIsCancelling(false); }
  };

  const upcoming = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  if (isLoading) return <SkeletonPage cards={3} />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Bookings</h1>
        <Button onClick={() => navigate('/services')} className="text-sm">Book New</Button>
      </div>

      {bookings.length === 0 ? (
        <EmptyState icon="📅" title="No bookings yet" description="Book your first appointment." actionLabel="Browse Services" onAction={() => navigate('/services')} />
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-accent uppercase tracking-widest mb-4">Upcoming</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {upcoming.map((b) => (
                  <div key={b.id} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 animate-slide-up hover:border-accent/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <BookingStatusBadge status={b.status} />
                      <span className="text-xs text-white/30">#{b.id}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{b.serviceName}</h3>
                    <p className="text-sm text-accent mb-3">{b.categoryName}</p>
                    <div className="bg-white/5 rounded-xl p-3 space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {formatDate(b.bookingDate)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {formatTime(b.startTime)} - {formatTime(b.endTime)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                        <span className="font-semibold text-accent">Rs. {b.price}</span>
                      </div>
                    </div>
                    {b.status === 'pending' && (
                      <Button variant="danger" onClick={() => setCancelTarget(b)} className="w-full text-sm">
                        Cancel Booking
                      </Button>
                    )}
                    {b.status === 'confirmed' && (
                      <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                        <div className="flex gap-2 text-xs text-white/70 mb-2">
                          <svg className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>Time cannot be changed after confirmation. For any issues, contact us:</span>
                        </div>
                        <ContactStrip compact />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {past.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Past</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((b) => (
                  <div key={b.id} className="bg-white/3 border border-white/5 rounded-2xl p-5 opacity-60 animate-slide-up">
                    <div className="flex items-center justify-between mb-3">
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{b.serviceName}</h3>
                    <p className="text-sm text-white/60">{formatDate(b.bookingDate)} &middot; {formatTime(b.startTime)}</p>
                    <p className="text-sm text-white/60 mt-1">Rs. {b.price}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        isLoading={isCancelling}
        title="Cancel Booking?"
        message={cancelTarget ? `Cancel your ${cancelTarget.serviceName} appointment on ${formatDate(cancelTarget.bookingDate)}?` : ''}
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep It"
        variant="danger"
      />
      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
