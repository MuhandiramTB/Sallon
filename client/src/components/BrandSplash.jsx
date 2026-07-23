import { useBranding } from '../context/BrandingContext.jsx';

/**
 * Full-screen branded splash shown until branding first resolves (with a small
 * minimum-visible time so the animation is always seen — handled in App).
 * A salon logo sits inside animated gold rings; falls back to a scissors mark
 * when no logo is set. Cache hit → brief & polished; cold start → hides the wait.
 */
export default function BrandSplash() {
  const { branding } = useBranding();

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-hero flex flex-col items-center justify-center text-white animate-fade-in">
      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-accent rounded-full blur-[110px]" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo inside animated gold rings */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-7">
          {/* Outer spinning arc */}
          <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="rgba(201,169,110,0.15)" strokeWidth="2" />
            <path d="M50 4 a46 46 0 0 1 46 46" stroke="#c9a96e" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {/* Inner counter-spinning arc */}
          <svg className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] animate-spin-reverse" viewBox="0 0 100 100" fill="none">
            <path d="M50 6 a44 44 0 0 0 -44 44" stroke="#e8c97a" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          </svg>
          {/* Pulsing halo */}
          <div className="absolute inset-4 rounded-full bg-accent/10 animate-ring-pulse" />

          {/* Logo or scissors fallback */}
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt=""
              className="relative w-20 h-20 rounded-full object-cover border border-accent/30"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="relative w-20 h-20 rounded-full bg-primary/60 border border-accent/30 flex items-center justify-center">
              <svg className="w-9 h-9 text-accent animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="6" cy="6" r="3" strokeWidth={2} />
                <circle cx="6" cy="18" r="3" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 8.5L20 18M8.5 15.5L20 6" />
              </svg>
            </div>
          )}
        </div>

        {/* Salon name with shimmering gold gradient */}
        {branding.salonName ? (
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2 animate-shimmer-text bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #c9a96e 0%, #f5e2b8 45%, #ffffff 50%, #f5e2b8 55%, #c9a96e 100%)' }}
          >
            {branding.salonName}
          </h1>
        ) : (
          <div className="h-8 w-44 rounded-lg bg-white/10 animate-pulse-soft mb-2" />
        )}

        <p className="text-xs tracking-[0.3em] uppercase text-white/40">Premium Grooming</p>
      </div>
    </div>
  );
}
