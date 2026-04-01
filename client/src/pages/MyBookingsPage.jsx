import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import BookingCard from '../components/BookingCard.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { SkeletonPage } from '../ui/Skeleton.jsx';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadBookings = async () => {
    try {
      const res = await api('/bookings/my');
      setBookings(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api(`/bookings/${id}/cancel`, { method: 'PATCH' });
      loadBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <SkeletonPage cards={3} />;

  return (
    <div className="py-6 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No bookings yet"
          description="Book your first salon appointment and it will appear here."
          actionLabel="Browse Services"
          onAction={() => navigate('/services')}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}
