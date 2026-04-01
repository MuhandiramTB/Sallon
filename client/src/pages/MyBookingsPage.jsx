import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import BookingCard from '../components/BookingCard.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import { SkeletonPage } from '../ui/Skeleton.jsx';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
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
      alert(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <SkeletonPage cards={3} />;

  return (
    <div className="py-6 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <EmptyState icon="📅" title="No bookings yet" description="Book your first salon appointment and it will appear here." actionLabel="Browse Services" onAction={() => navigate('/services')} />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} onCancel={(id) => setCancelTarget(b)} />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        isLoading={isCancelling}
        title="Cancel Booking?"
        message={cancelTarget ? `Are you sure you want to cancel your ${cancelTarget.serviceName} appointment? This action cannot be undone.` : ''}
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        variant="danger"
      />
    </div>
  );
}
