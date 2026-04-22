import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatDate, formatTime } from '../lib/formatDate.js';
import SlotPicker from '../components/SlotPicker.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Spinner from '../ui/Spinner.jsx';
import ContactStrip from '../components/ContactStrip.jsx';
import SendBookingWhatsApp from '../components/SendBookingWhatsApp.jsx';

export default function BookingPage() {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Admin should use Quick Booking, not customer booking page
    if (user?.role === 'admin') {
      navigate(`/admin/quick-booking?service=${serviceId}`, { replace: true });
      return;
    }
    api(`/services/${serviceId}`)
      .then((res) => setService(res.data))
      .catch(() => setError('Service not found'))
      .finally(() => setIsLoading(false));
  }, [serviceId, user, navigate]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedSlot) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await api('/bookings', {
        method: 'POST',
        body: { serviceId: Number(serviceId), date: selectedSlot.date, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime },
      });
      setSuccess(res.data);
      setSelectedSlot(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (!service) return <p className="text-center text-red-400 py-8">{error || 'Service not found'}</p>;

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 animate-scale-in">
        <Card className="text-center">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-5 animate-check-draw">
            <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-white/60 mb-5">Your appointment has been booked. Let the salon know on WhatsApp:</p>
          <div className="mb-5">
            <SendBookingWhatsApp booking={success} customer={user} />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left space-y-3 mb-5">
            <div className="flex justify-between"><span className="text-white/60 text-sm">Service</span><span className="font-medium text-white text-sm">{success.serviceName}</span></div>
            <div className="flex justify-between"><span className="text-white/60 text-sm">Date</span><span className="font-medium text-white text-sm">{formatDate(success.bookingDate)}</span></div>
            <div className="flex justify-between"><span className="text-white/60 text-sm">Time</span><span className="font-medium text-white text-sm">{formatTime(success.startTime)} - {formatTime(success.endTime)}</span></div>
            <div className="flex justify-between"><span className="text-white/60 text-sm">Price</span><span className="font-bold text-accent">Rs. {success.price}</span></div>
            <div className="flex justify-between"><span className="text-white/60 text-sm">Status</span><span className="text-amber-400 font-medium text-sm">Pending Confirmation</span></div>
          </div>
          <div className="mb-5">
            <ContactStrip />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/my-bookings')} variant="secondary" className="flex-1">My Bookings</Button>
            <Button onClick={() => navigate('/services')} variant="secondary" className="flex-1">Book Another</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      <Card className="mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{service.name}</h1>
            {service.description && <p className="text-white/60 mt-1">{service.description}</p>}
          </div>
          <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full flex-shrink-0">{service.categoryName}</span>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-2xl font-bold text-accent">Rs. {service.price}</span>
          <span className="text-sm text-white/60 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{service.durationMinutes} min</span>
        </div>
      </Card>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 text-sm font-medium animate-slide-up">{error}</div>}

      <Card><SlotPicker serviceId={Number(serviceId)} onSelectSlot={setSelectedSlot} /></Card>

      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1e1e2e]/80 backdrop-blur-xl border-t border-white/10 p-4 shadow-xl z-30 animate-slide-up sm:static sm:mt-5 sm:border-0 sm:shadow-none sm:p-0 sm:bg-transparent sm:backdrop-blur-none">
          <div className="container mx-auto max-w-2xl flex items-center justify-between gap-4">
            <div className="text-sm">
              <span className="text-white/60">{formatDate(selectedSlot.date)}</span>
              <span className="font-semibold text-white ml-2">{formatTime(selectedSlot.startTime)}</span>
            </div>
            <Button onClick={handleBook} isLoading={isSubmitting} className="min-w-[180px]">
              Confirm — Rs. {service.price}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
