import { useBranding } from '../context/BrandingContext.jsx';

/**
 * Full-screen branded splash shown until branding first resolves.
 * Cache hit → shows for a single frame (effectively instant).
 * Cold start → a polished salon-themed loader instead of a half-empty page.
 */
export default function BrandSplash() {
  const { branding } = useBranding();

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-hero flex flex-col items-center justify-center text-white animate-fade-in">
      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-accent rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo, or an animated scissors mark as a fallback */}
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt=""
            className="w-20 h-20 rounded-full object-cover border-2 border-accent/50 animate-float mb-5"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-accent/15 border-2 border-accent/40 flex items-center justify-center animate-float mb-5">
            <svg className="w-9 h-9 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="6" cy="6" r="3" strokeWidth={2} />
              <circle cx="6" cy="18" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 8.5L20 18M8.5 15.5L20 6" />
            </svg>
          </div>
        )}

        {/* Salon name (shimmering) once known */}
        {branding.salonName ? (
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-6">
            {branding.salonName}
          </h1>
        ) : (
          <div className="h-8 w-40 rounded-lg bg-white/10 animate-pulse-soft mb-6" />
        )}

        {/* Loading dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse-soft"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
