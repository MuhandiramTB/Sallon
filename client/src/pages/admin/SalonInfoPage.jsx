import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useBranding } from '../../context/BrandingContext.jsx';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Card from '../../ui/Card.jsx';
import Spinner from '../../ui/Spinner.jsx';

const INITIAL = {
  ownerName: '', salonName: '', logoUrl: '', galleryImages: [],
  phone: '', whatsapp: '', email: '', address: '',
  googleMapsUrl: '', facebookUrl: '', instagramUrl: '', bookingNote: '',
};

const CC = '+94';

// Strip the "+94" prefix (and any spaces / leading 0) for display.
const stripCC = (val = '') => {
  let s = String(val).trim();
  if (s.startsWith(CC)) s = s.slice(CC.length);
  else if (s.startsWith('94')) s = s.slice(2);
  s = s.replace(/^\s+/, '');
  // Drop leading 0 which is the local-format prefix users often include by mistake
  if (s.startsWith('0')) s = s.slice(1);
  return s;
};

// Re-attach "+94 " for storage. Empty input → empty string.
// Strip leading 0 from local part (SL local 077... → international 77...).
const addCC = (val = '') => {
  let s = String(val).trim();
  if (!s) return '';
  if (s.startsWith('+')) return s;
  if (s.startsWith('0')) s = s.slice(1); // 0771234567 → 771234567
  return `${CC} ${s}`;
};

// Digits only — what wa.me expects.
const toWaLink = (val = '') => {
  const digits = String(val).replace(/[^0-9]/g, '');
  return digits ? `https://wa.me/${digits}` : '';
};

/** Logo upload: accepts an image file, converts to base64 data URL, enforces size limit. */
function LogoUpload({ value, onChange }) {
  const [error, setError] = useState('');
  const MAX_BYTES = 200 * 1024; // 200 KB

  const handleFile = (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please pick an image file (PNG, JPG, SVG).');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Image is too large (${Math.round(file.size / 1024)} KB). Max 200 KB — please compress first.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result); // data:image/...;base64,...
    reader.onerror = () => setError('Could not read the file.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white/70 mb-1.5">Logo</label>

      {value && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-white/5 border border-white/10 rounded-lg">
          <img
            src={value}
            alt="logo preview"
            className="w-16 h-16 rounded-full object-cover bg-white/10 border-2 border-accent/40 flex-shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/80 font-medium">Current logo</p>
            <p className="text-xs text-white/50 truncate">
              {value.startsWith('data:') ? 'Uploaded image' : value}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10"
            title="Remove logo"
          >
            Remove
          </button>
        </div>
      )}

      <label className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/30 transition-colors cursor-pointer min-h-[40px]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        {value ? 'Replace Logo' : 'Upload Logo'}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </label>
      <p className="text-xs text-white/50 mt-1.5">PNG, JPG, or SVG. Max 200 KB. Square images look best.</p>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

/** Homepage gallery: upload multiple images (base64), preview, remove, reorder. */
function GalleryUpload({ value = [], onChange }) {
  const [error, setError] = useState('');
  const MAX_BYTES = 250 * 1024; // 250 KB per image
  const MAX_IMAGES = 8;

  const handleFiles = (fileList) => {
    setError('');
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (value.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images. You can add ${MAX_IMAGES - value.length} more.`);
      return;
    }
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please pick image files only (PNG, JPG).');
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" is too large (${Math.round(file.size / 1024)} KB). Max 250 KB each — please compress first.`);
        return;
      }
    }
    // Read all files, then append in order.
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    )
      .then((dataUrls) => onChange([...value, ...dataUrls]))
      .catch(() => setError('Could not read one of the files.'));
  };

  const removeAt = (idx) => onChange(value.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="mb-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {value.map((src, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 bg-white/5">
              <img src={src} alt={`slide ${idx + 1}`} className="w-full h-24 object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 text-[10px] font-medium bg-accent text-primary px-1.5 py-0.5 rounded">First slide</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between items-center bg-black/60 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}
                    className="text-white/80 hover:text-white disabled:opacity-30 text-xs px-1" title="Move left">◀</button>
                  <button type="button" onClick={() => move(idx, 1)} disabled={idx === value.length - 1}
                    className="text-white/80 hover:text-white disabled:opacity-30 text-xs px-1" title="Move right">▶</button>
                </div>
                <button type="button" onClick={() => removeAt(idx)}
                  className="text-red-400 hover:text-red-300 text-xs px-1" title="Remove">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length < MAX_IMAGES && (
        <label className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/30 transition-colors cursor-pointer min-h-[40px]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {value.length ? 'Add More Images' : 'Upload Images'}
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
        </label>
      )}
      <p className="text-xs text-white/50 mt-1.5">
        Up to {MAX_IMAGES} photos, max 250 KB each. Landscape (wide) images look best. The first image shows first; drag order with ◀ ▶.
      </p>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

/** Phone input with a fixed "+94" prefix + inline validation + test button. */
function PhoneInput({ label, value, onChange, placeholder, showWaTest = false }) {
  const local = stripCC(value);
  const digits = String(value || '').replace(/[^0-9]/g, '');
  const isValid = digits.length >= 11 && digits.length <= 13; // 94 + 9-11 digits
  const showError = local.length > 0 && !isValid;

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
          className={`flex-1 w-full px-4 py-2.5 border rounded-r-lg text-[15px] min-h-[44px] bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent hover:border-white/20 ${
            showError ? 'border-red-500/50' : 'border-white/10'
          }`}
        />
      </div>
      {showError && (
        <p className="text-red-400 text-xs mt-1.5">Enter 9 digits only (no leading 0). Example: 77 123 4567</p>
      )}
      {showWaTest && isValid && local.length > 0 && (
        <a
          href={toWaLink(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 mt-1.5 hover:underline"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
          Test this number on WhatsApp
        </a>
      )}
    </div>
  );
}

export default function SalonInfoPage() {
  const { refresh: refreshBranding } = useBranding();
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
      await refreshBranding(); // update navbar/hero/tab title live, no reload needed
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
          <h3 className="font-semibold text-white mb-2">Branding</h3>
          <p className="text-xs text-white/60 mb-4">The salon name and logo shown throughout the app (navbar, login page, WhatsApp messages).</p>
          <Input label="Salon Name (displayed on app)" value={form.salonName} onChange={handleChange('salonName')} placeholder="e.g. SallonArt Men's Salon" />
          <LogoUpload value={form.logoUrl} onChange={(val) => setForm((f) => ({ ...f, logoUrl: val }))} />
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-2">Homepage Gallery</h3>
          <p className="text-xs text-white/60 mb-4">
            Photos of your salon shown as a rotating slideshow on the home page. Add a few of your best shots — interior, styling, results.
          </p>
          <GalleryUpload
            value={form.galleryImages}
            onChange={(imgs) => setForm((f) => ({ ...f, galleryImages: imgs }))}
          />
        </Card>

        <Card className="mb-5">
          <h3 className="font-semibold text-white mb-4">Primary Contact</h3>
          <Input label="Owner Name" value={form.ownerName} onChange={handleChange('ownerName')} placeholder="e.g. Kamal Perera" />
          <PhoneInput label="Phone (for calls)" value={form.phone} onChange={handlePhoneChange('phone')} placeholder="77 123 4567" />
          <PhoneInput label="WhatsApp Number" value={form.whatsapp} onChange={handlePhoneChange('whatsapp')} placeholder="77 123 4567" showWaTest />
          <p className="text-xs text-white/50 -mt-2 mb-4">
            💡 Enter 9 digits without the leading 0. Click "Test this number on WhatsApp" to verify before saving.
          </p>
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
