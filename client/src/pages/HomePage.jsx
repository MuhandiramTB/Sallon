import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useBranding } from '../context/BrandingContext.jsx';

const STEPS = [
  { num: '01', title: 'Choose Service', desc: 'Browse our curated menu' },
  { num: '02', title: 'Pick Your Time', desc: 'Select date & time slot' },
  { num: '03', title: 'Confirm & Relax', desc: 'Walk in at your time' },
];

const SLIDE_MS = 5000;

export default function HomePage() {
  const { branding } = useBranding();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const timerRef = useRef(null);

  const slides = Array.isArray(branding.galleryImages) ? branding.galleryImages : [];
  const hasSlides = slides.length > 0;

  // Auto-advance the slider (paused when only one/no image).
  useEffect(() => {
    if (slides.length < 2) return undefined;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const goTo = (i) => {
    setCurrent(i);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="min-h-[calc(100svh-3.5rem)] bg-gradient-hero text-white relative overflow-hidden flex flex-col">
      {/* Slideshow background (falls back to gradient glow when no images) */}
      {hasSlides ? (
        <div className="absolute inset-0">
          {slides.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
              style={{ backgroundImage: `url(${src})`, opacity: i === current ? 1 : 0 }}
              aria-hidden={i !== current}
            />
          ))}
          {/* Dark overlay so text stays readable over any photo */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/90" />
          <div className="absolute inset-0 bg-primary/30" />
        </div>
      ) : (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent rounded-full blur-[100px]" />
        </div>
      )}

      {/* Hero content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-5 py-8">
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm text-white/80 mb-5 sm:mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
            Now accepting online bookings
          </div>

          {/* Logo on top of the hero */}
          {branding.logoUrl && (
            <img
              src={branding.logoUrl}
              alt={branding.salonName || ''}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-accent/50 bg-white/10 shadow-xl shadow-accent/20 mx-auto mb-4 sm:mb-5 animate-scale-in"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight animate-slide-up drop-shadow-lg">
            <span className="block text-xl sm:text-3xl font-medium text-white/80 mb-1">Welcome to</span>
            <span className="text-gradient">{branding.salonName || ' '}</span>
          </h1>
          <p className="text-sm sm:text-lg text-white/80 mb-7 sm:mb-8 max-w-md mx-auto animate-slide-up drop-shadow">
            Your premium grooming experience. Book your appointment in seconds.
          </p>

          <div className="animate-slide-up">
            <button
              onClick={() => navigate(user ? '/services' : '/login')}
              className="w-full sm:w-auto bg-gradient-gold text-primary font-semibold px-8 py-4 rounded-xl text-base sm:text-lg hover:shadow-lg hover:shadow-accent/30 transition-all active:scale-[0.97] min-h-[52px] inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Book Appointment
            </button>
          </div>

          {/* Slide dots */}
          {slides.length > 1 && (
            <div className="flex justify-center gap-1 mt-7">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="p-2 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-full"
                >
                  <span className={`block h-2 rounded-full transition-all ${i === current ? 'w-6 bg-accent' : 'w-2 bg-white/40'}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: How it works — responsive card row */}
      <div className="relative z-10 px-5 pb-24 md:pb-10">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2.5 sm:gap-4">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl px-2 py-3 sm:px-4 sm:py-5 animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-accent/15 border border-accent/20 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                <span className="text-accent font-bold text-xs sm:text-base">{step.num}</span>
              </div>
              <h3 className="font-semibold text-white text-xs sm:text-sm leading-tight">{step.title}</h3>
              <p className="text-[11px] sm:text-xs text-white/60 mt-1 leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
