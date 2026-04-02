import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import Button from '../ui/Button.jsx';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
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
      const res = await api('/auth/login', { method: 'POST', body: form });
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      if (err.details) setErrors(err.details);
      else setServerError(err.message);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-accent rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 animate-scale-in">
        {/* Logo & brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
            <span className="text-2xl font-bold text-primary">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{branding.salonName}</h1>
          <p className="text-white/60 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {serverError && (
            <div className="bg-error/10 border border-error/20 text-red-300 p-3.5 rounded-xl mb-5 text-sm font-medium animate-slide-up">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all min-h-[48px]"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
              <input
                name="password" type="password" value={form.password} onChange={handleChange} required
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all min-h-[48px]"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full !min-h-[50px] text-base">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-white/60 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-semibold hover:text-accent-hover transition-colors">Create one</Link>
        </p>
      </div>
    </div>
  );
}
