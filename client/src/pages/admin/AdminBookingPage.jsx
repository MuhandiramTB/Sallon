import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatTime, getNextDays } from '../../lib/formatDate.js';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Spinner from '../../ui/Spinner.jsx';
import { openWhatsApp, waTemplates, buildWhatsAppLink } from '../../lib/whatsapp.js';

export default function AdminBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedService = searchParams.get('service') || '';
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [salonName, setSalonName] = useState('our salon');

  const [form, setForm] = useState({ customerName: '', customerPhone: '' });
  const [selectedServiceId, setSelectedServiceId] = useState(preSelectedService);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const dates = getNextDays(14);

  useEffect(() => {
    api('/services').then((res) => setServices(res.data)).finally(() => setIsLoading(false));
    api('/config/branding').then((res) => setSalonName(res.data?.salonName || 'our salon')).catch(() => {});
  }, []);

  const sendReminder = () => {
    if (!success?.customerPhone) return;
    const message = waTemplates.reminder({
      customerName: success.customerName,
      serviceName: success.serviceName,
      bookingDate: success.bookingDate,
      startTime: success.startTime,
      salonName,
      appUrl: window.location.origin,
    });
    openWhatsApp(success.customerPhone, message);
  };

  const canSendReminder = !!(success?.customerPhone && buildWhatsAppLink(success.customerPhone, 'test'));

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
          <h2 className="text-xl font-bold text-white mb-2">Booking Created & Confirmed!</h2>
          <p className="text-white/60 text-sm mb-4">Walk-in bookings are auto-confirmed. Send the customer a reminder on WhatsApp:</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 mb-5 text-sm">
            <div className="flex justify-between"><span className="text-white/70">Customer</span><span className="font-medium text-white">{success.customerName}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Phone</span><span className="font-medium text-accent">{success.customerPhone}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Service</span><span className="font-medium text-white">{success.serviceName}</span></div>
            <div className="flex justify-between"><span className="text-white/70">Status</span><span className="font-medium text-green-400">Confirmed</span></div>
          </div>
          {canSendReminder && (
            <button
              onClick={sendReminder}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-[#20b858] transition-colors min-h-[48px] shadow-lg shadow-green-500/20 active:scale-[0.98] mb-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
              Send Reminder on WhatsApp
            </button>
          )}
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
