import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatTime, getNextDays } from '../../lib/formatDate.js';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Spinner from '../../ui/Spinner.jsx';

export default function AdminBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedService = searchParams.get('service') || '';
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({ customerName: '', customerPhone: '' });
  const [selectedServiceId, setSelectedServiceId] = useState(preSelectedService);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const dates = getNextDays(14);

  useEffect(() => {
    api('/services').then((res) => setServices(res.data)).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedServiceId || !selectedDate) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    api(`/slots?service_id=${selectedServiceId}&date=${selectedDate}`)
      .then((res) => setSlots(res.data.slots || []))
      .finally(() => setSlotsLoading(false));
  }, [selectedServiceId, selectedDate]);

  const selectedService = services.find((s) => s.id === Number(selectedServiceId));

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone || !selectedServiceId || !selectedSlot) {
      setError('Please fill all fields and select a time slot');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await api('/admin/bookings', {
        method: 'POST',
        body: {
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          serviceId: Number(selectedServiceId),
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          status: 'confirmed',
        },
      });
      setSuccess(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner />;

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 animate-scale-in">
        <Card className="text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Booking Created!</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 mb-5 text-sm">
            <div className="flex justify-between"><span className="text-white/70">Customer</span><span className="font-medium text-white">{success.customerName}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Phone</span><span className="font-medium text-accent">{success.customerPhone}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Service</span><span className="font-medium text-white">{success.serviceName}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Status</span><span className="font-medium text-green-400">Confirmed</span></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { setSuccess(null); setForm({ customerName: '', customerPhone: '' }); setSelectedServiceId(''); setSelectedDate(null); setSelectedSlot(null); }} className="flex-1">
              Book Another
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/bookings')} className="flex-1">
              View Bookings
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Quick Booking</h1>
      <p className="text-white/70 mb-6">Create a booking for a walk-in or phone customer.</p>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 text-sm font-medium animate-slide-up">{error}</div>}

      <Card className="mb-5">
        <h2 className="font-semibold text-white mb-4">Customer Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Input
            label="Customer Name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="Enter customer name"
            required
          />
          <Input
            label="Mobile Number"
            type="tel"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            placeholder="07X XXX XXXX"
            required
          />
        </div>
      </Card>

      <Card className="mb-5">
        <h2 className="font-semibold text-white mb-4">Select Service</h2>
        <Select
          label="Service"
          value={selectedServiceId}
          onChange={(e) => { setSelectedServiceId(e.target.value); setSelectedDate(null); setSelectedSlot(null); }}
          required
        >
          <option value="">Choose a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — Rs. {s.price} ({s.durationMinutes} min) {s.isPackage ? '📦' : ''}
            </option>
          ))}
        </Select>
      </Card>

      {selectedServiceId && (
        <Card className="mb-5 animate-slide-up">
          <h2 className="font-semibold text-white mb-4">Select Date & Time</h2>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
            {dates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] min-w-[80px] text-center ${
                  selectedDate === d ? 'bg-gradient-to-b from-accent to-amber-700 text-white shadow-md' : 'bg-white/5 text-white/80 border border-white/10 hover:border-accent/30'
                }`}
              >
                <div className="text-xs opacity-70">{new Date(d + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' })}</div>
                <div className="font-bold">{new Date(d + 'T00:00:00').getDate()}</div>
                <div className="text-xs opacity-70">{new Date(d + 'T00:00:00').toLocaleDateString('en', { month: 'short' })}</div>
              </button>
            ))}
          </div>

          {selectedDate && (
            <div className="animate-slide-up">
              {slotsLoading ? (
                <div className="grid grid-cols-4 gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[44px] bg-white/5 rounded-lg animate-pulse-soft" />)}</div>
              ) : slots.length === 0 ? (
                <p className="text-white/70 text-center py-4">No available slots</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                        selectedSlot?.startTime === slot.startTime
                          ? 'bg-gradient-to-b from-accent to-amber-700 text-white shadow-md'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                      }`}
                    >
                      {formatTime(slot.startTime)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {selectedSlot && form.customerName && form.customerPhone && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1e1e2e]/80 backdrop-blur-xl border-t border-white/10 p-4 shadow-xl z-30 animate-slide-up sm:static sm:border-0 sm:shadow-none sm:p-0 sm:bg-transparent sm:backdrop-blur-none">
          <div className="container mx-auto max-w-2xl">
            <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full">
              Confirm Booking for {form.customerName} — Rs. {selectedService?.price}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
