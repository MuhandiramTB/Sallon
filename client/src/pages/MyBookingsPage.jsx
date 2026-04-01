import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import BookingCard from '../components/BookingCard.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}
