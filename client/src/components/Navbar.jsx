import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [branding, setBranding] = useState({ salonName: 'Sallon', logoUrl: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api('/config/branding').then((res) => setBranding(res.data)).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium min-h-[44px] flex items-center px-2 transition-colors ${
        isActive(to) ? 'text-white border-b-2 border-white' : 'text-white/70 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          {branding.logoUrl && <img src={branding.logoUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />}
          <span className="text-xl font-bold tracking-tight">{branding.salonName}</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLink('/services', 'Services')}

          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  {navLink('/admin', 'Dashboard')}
                  <button
                    onClick={handleCopyLink}
                    className="text-sm font-medium text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all min-h-[44px] flex items-center gap-1.5 ml-1"
                  >
                    {copied ? (
                      <><span className="text-success-light">Copied!</span></>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Share
                      </>
                    )}
                  </button>
                </>
              )}
              {navLink('/my-bookings', 'Bookings')}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold hover:bg-white/30 transition-colors"
                  title="My Profile"
                >
                  {user.name.charAt(0).toUpperCase()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-white/70 hover:text-white transition-colors min-h-[44px] flex items-center"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              {navLink('/login', 'Login')}
              <Link
                to="/register"
                className="text-sm font-medium bg-white text-primary px-4 py-2 rounded-lg hover:bg-white/90 transition-all min-h-[44px] flex items-center active:scale-[0.97]"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
