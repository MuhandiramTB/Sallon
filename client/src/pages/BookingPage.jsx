import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatDate, formatTime } from '../lib/formatDate.js';
import SlotPicker from '../components/SlotPicker.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Spinner from '../ui/Spinner.jsx';

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
    api(`/services/${serviceId}`)
      .then((res) => setService(res.data))
      .catch(() => setError('Service not found'))
      .finally(() => setIsLoading(false));
  }, [serviceId]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setError('');
    try {
      const res = await api('/bookings', {
        method: 'POST',
        body: {
          serviceId: Number(serviceId),
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
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
  if (!service) return <p className="text-center text-red-500 py-8">{error || 'Service not found'}</p>;

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="text-center">
          <div className="text-green-500 text-5xl mb-4">&#10003;</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your appointment has been booked.</p>
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
            <p><span className="font-medium">Service:</span> {success.serviceName}</p>
            <p><span className="font-medium">Date:</span> {formatDate(success.bookingDate)}</p>
            <p><span className="font-medium">Time:</span> {formatTime(success.startTime)} - {formatTime(success.endTime)}</p>
            <p><span className="font-medium">Price:</span> Rs. {success.price}</p>
            <p><span className="font-medium">Status:</span> <span className="text-amber-600 font-medium">Pending</span></p>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={() => navigate('/my-bookings')} className="flex-1">My Bookings</Button>
            <Button onClick={() => navigate('/services')} className="flex-1 bg-gray-500 hover:bg-gray-600">Book Another</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{service.name}</h2>
        {service.description && <p className="text-gray-500 mt-1">{service.description}</p>}
        <div className="flex gap-4 mt-3 text-sm text-gray-600">
          <span>{service.durationMinutes} min</span>
          <span className="font-semibold text-indigo-600">Rs. {service.price}</span>
          <span className="text-gray-400">{service.categoryName}</span>
        </div>
      </Card>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

      <Card>
        <SlotPicker serviceId={Number(serviceId)} onSelectSlot={setSelectedSlot} />

        {selectedSlot && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-gray-700 mb-3">
              <span className="font-medium">Selected:</span> {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.startTime)}
            </p>
            <Button onClick={handleBook} disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Booking...' : `Confirm Booking — Rs. ${service.price}`}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
