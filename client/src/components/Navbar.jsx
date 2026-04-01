import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [branding, setBranding] = useState({ salonName: 'Sallon', logoUrl: '' });

  useEffect(() => {
    api('/config/branding')
      .then((res) => setBranding(res.data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    alert('Booking link copied!');
  };

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:text-indigo-200 transition-colors">
          {branding.logoUrl && <img src={branding.logoUrl} alt="" className="w-8 h-8 rounded" />}
          {branding.salonName}
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/services" className="text-sm hover:text-indigo-200 transition-colors min-h-[44px] flex items-center">
            Services
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="text-sm hover:text-indigo-200 transition-colors min-h-[44px] flex items-center">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleCopyLink}
                    className="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded transition-colors min-h-[44px]"
                    title="Copy booking link for WhatsApp"
                  >
                    Share Link
                  </button>
                </>
              )}
              <Link to="/my-bookings" className="text-sm hover:text-indigo-200 transition-colors min-h-[44px] flex items-center">
                My Bookings
              </Link>
              <span className="text-sm text-indigo-200 hidden sm:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded transition-colors min-h-[44px]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:text-indigo-200 transition-colors min-h-[44px] flex items-center">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-white text-indigo-600 px-3 py-1 rounded font-medium hover:bg-indigo-50 transition-colors min-h-[44px] flex items-center"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
