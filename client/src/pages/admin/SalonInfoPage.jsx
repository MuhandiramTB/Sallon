import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Card from '../../ui/Card.jsx';
import Spinner from '../../ui/Spinner.jsx';

const INITIAL = {
  ownerName: '', phone: '', whatsapp: '', email: '', address: '',
  googleMapsUrl: '', facebookUrl: '', instagramUrl: '', bookingNote: '',
};

const CC = '+94';

// Strip the "+94" prefix (and any spaces after it) for display.
const stripCC = (val = '') => {
  const s = String(val).trim();
  if (s.startsWith(CC)) return s.slice(CC.length).replace(/^\s+/, '');
  if (s.startsWith('94')) return s.slice(2).replace(/^\s+/, '');
  return s;
};

// Re-attach "+94 " for storage. Empty input → empty string (no "+94" alone).
const addCC = (val = '') => {
  const s = String(val).trim();
  if (!s) return '';
  // Allow user to paste a full international number (keep as-is)
  if (s.startsWith('+')) return s;
  return `${CC} ${s}`;
};

/** Phone input with a fixed "+94" prefix. Stores value as "+94 77 123 4567". */
function PhoneInput({ label, value, onChange, placeholder }) {
  const local = stripCC(value);
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      <div className="flex">
        <span className="inline-flex items-center px-3.5 bg-white/10 border border-white/10 border-r-0 rounded-l-lg text-white/80 font-mono text-sm select-none">
          {CC}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={local}
          onChange={(e) => {
            const clean = e.target.value.replace(/[^0-9\s]/g, '');
            onChange(addCC(clean));
          }}
          placeholder={placeholder}
          className="flex-1 w-full px-4 py-2.5 border border-white/10 rounded-r-lg text-[15px] min-h-[44px] bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent hover:border-white/20"
        />
      </div>
    </div>
  );
}

export default function SalonInfoPage() {
  const [form, setForm] = useState(INITIAL);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api('/salon-info');
      if (res.data) setForm({ ...INITIAL, ...res.data });
    } finally { setIsLoading(false); }
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const handlePhoneChange = (field) => (newValue) => setForm({ ...form, [field]: newValue });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      await api('/salon-info', { method: 'PUT', body: form });
      setMessage('Saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="py-6 animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Salon Info</h1>
        <p className="text-sm text-white/60 mt-1">
          Contact details customers see on the Contact page and after booking.
        </p>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl mb-5 text-sm font-medium animate-slide-up ${
          message.startsWith('Error')
            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
            : 'bg-green-500/10 border border-green-500/20 text-green-400'
        }`}>{message}</div>
      )}

      <form onSubmit={handleSave}>
        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-4">Primary Contact</h3>
          <Input label="Owner / Salon Name" value={form.ownerName} onChange={handleChange('ownerName')} placeholder="e.g. Kamal Perera" />
          <PhoneInput label="Phone (for calls)" value={form.phone} onChange={handlePhoneChange('phone')} placeholder="77 123 4567" />
          <PhoneInput label="WhatsApp Number" value={form.whatsapp} onChange={handlePhoneChange('whatsapp')} placeholder="77 123 4567" />
          <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} placeholder="info@sallonart.lk" />
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-4">Location</h3>
          <Input label="Address" value={form.address} onChange={handleChange('address')} placeholder="123 Main Street, Colombo 05" />
          <Input label="Google Maps Link (optional)" value={form.googleMapsUrl} onChange={handleChange('googleMapsUrl')} placeholder="https://maps.google.com/..." />
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-4">Social (optional)</h3>
          <Input label="Facebook URL" value={form.facebookUrl} onChange={handleChange('facebookUrl')} placeholder="https://facebook.com/yourpage" />
          <Input label="Instagram URL" value={form.instagramUrl} onChange={handleChange('instagramUrl')} placeholder="https://instagram.com/yourpage" />
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-2">Booking Note</h3>
          <p className="text-xs text-white/60 mb-3">
            Short message shown to customers after they book (e.g. cancellation policy).
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1.5">Message</label>
            <textarea
              value={form.bookingNote}
              onChange={handleChange('bookingNote')}
              rows={3}
              placeholder="e.g. For cancellations or rescheduling, please WhatsApp us at least 2 hours before your appointment."
              className="w-full px-4 py-2.5 border border-white/10 rounded-lg text-[15px] bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent hover:border-white/20"
            />
          </div>
        </Card>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
