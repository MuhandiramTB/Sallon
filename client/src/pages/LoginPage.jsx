import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-text-secondary mt-2">Sign in to manage your appointments</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            {serverError && (
              <div className="bg-red-50 text-error p-3.5 rounded-lg mb-5 text-sm font-medium animate-slide-up">{serverError}</div>
            )}
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="your@email.com" required />
            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Enter your password" required />
            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
