import { useState, useEffect } from 'react';
import { useBranding } from '../context/BrandingContext.jsx';

/**
 * Shared split-screen shell for auth pages (login / register / forgot).
 * Desktop: branded visual panel (salon gallery photos, Ken-Burns) on the left,
 * form on the right. Mobile: compact branded header above the form.
 *
 * Props:
 *  - title:    heading above the form (e.g. "Welcome back")
 *  - subtitle: small line under the title
 *  - children: the form
 *  - footer:   optional node under the form card (e.g. "Create one" link)
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  const { branding } = useBranding();
  const slides = Array.isArray(branding.galleryImages) ? branding.galleryImages : [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const Logo = ({ size }) =>
    branding.logoUrl ? (
      <img
        src={branding.logoUrl}
        alt={branding.salonName || ''}
        className={`${size} rounded-full object-cover border-2 border-accent/50 bg-white/10 shadow-lg shadow-accent/30`}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    ) : (
      <div className={`${size} bg-gradient-gold rounded-full flex items-center justify-center shadow-lg shadow-accent/30 border-2 border-accent/50`}>
        <span className="text-3xl font-bold text-primary">{branding.salonName?.charAt(0).toUpperCase() || 'S'}</span>
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-57px)] flex bg-gradient-hero">
      {/* Left: branded visual panel (desktop only) */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        {slides.length > 0 ? (
          slides.map((src, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                i === current ? 'opacity-100 animate-ken-burns' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))
        ) : (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]" />
          </div>
        )}
        {/* Overlay + branding */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-12">
          <Logo size="w-24 h-24 mb-6 animate-scale-in" />
          <h2 className="text-3xl font-bold text-gradient mb-3">{branding.salonName || ' '}</h2>
          <p className="text-white/70 max-w-xs tracking-wide">
            Your premium grooming experience — booking made effortless.
          </p>
          <div className="mt-6 text-xs tracking-[0.3em] uppercase text-white/40">Premium Grooming</div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Subtle glow on the form side */}
        <div className="absolute inset-0 opacity-10 pointer-events-none lg:hidden">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-md px-4 py-10 animate-scale-in">
          {/* Compact brand header (mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4"><Logo size="w-20 h-20" /></div>
            <h1 className="text-2xl font-bold text-white">{branding.salonName || ' '}</h1>
          </div>

          {/* Title (desktop shows here; mobile shows salon name above) */}
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/60 text-sm mt-1">{subtitle}</p>}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 sm:p-8 shadow-2xl">
            {children}
          </div>

          {footer && <div className="text-center text-sm text-white/60 mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
