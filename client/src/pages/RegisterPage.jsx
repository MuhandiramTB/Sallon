import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import Button from '../ui/Button.jsx';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branding, setBranding] = useState({ salonName: 'SallonArt' });
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { api('/config/branding').then((r) => setBranding(r.data)).catch(() => {}); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');
    try {
      const res = await api('/auth/register', { method: 'POST', body: form });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      if (err.details) setErrors(err.details);
      else setServerError(err.message);
    } finally { setIsSubmitting(false); }
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 bg-white/5 border rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all min-h-[44px] ${errors[field] ? 'border-red-400/50' : 'border-white/10'}`;

  return (
    <div className="h-[calc(100vh-57px)] flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4 animate-scale-in">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-accent/20">
            <span className="text-lg font-bold text-primary">S</span>
          </div>
          <h1 className="text-xl font-bold text-white">{branding.salonName}</h1>
          <p className="text-white/40 text-xs mt-1">Create your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          {serverError && (
            <div className="bg-error/10 border border-error/20 text-red-300 p-3 rounded-xl mb-4 text-xs font-medium animate-slide-up">{serverError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter your name" className={inputClass('name')} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className={inputClass('email')} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Mobile Number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="07X XXX XXXX" className={inputClass('phone')} />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" className={inputClass('password')} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            <Button type="submit" isLoading={isSubmitting} className="w-full !min-h-[46px] text-sm mt-1">
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/40 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold hover:text-accent-hover">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
