import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

const STEPS = [
  { num: '01', title: 'Choose Service', desc: 'Browse our curated menu' },
  { num: '02', title: 'Pick Your Time', desc: 'Select date & time slot' },
  { num: '03', title: 'Confirm & Relax', desc: 'Walk in at your time' },
];

const SLIDE_MS = 5000;

export default function HomePage() {
  const [branding, setBranding] = useState({ salonName: '', galleryImages: [] });
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    api('/config/branding').then((r) => setBranding(r.data || {})).catch(() => {});
  }, []);

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
    <div className="h-[calc(100vh-57px)] bg-gradient-hero text-white relative overflow-hidden flex flex-col">
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
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white/70 mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Now accepting online bookings
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-slide-up drop-shadow-lg">
            Welcome to<br />
            <span className="text-gradient">{branding.salonName || ' '}</span>
          </h1>
          <p className="text-base sm:text-lg text-white/80 mb-8 max-w-md mx-auto animate-slide-up drop-shadow">
            Your premium grooming experience. Book your appointment in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up">
            <button onClick={() => navigate(user ? '/services' : '/login')}
              className="bg-gradient-gold text-primary font-semibold px-8 py-3.5 rounded-xl text-base hover:shadow-lg hover:shadow-accent/30 transition-all active:scale-[0.97] min-h-[48px]">
              Book Appointment
            </button>
          </div>

          {/* Slide dots */}
          {slides.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? 'w-6 bg-accent' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: How it works */}
      <div className="relative z-10 pb-8">
        <div className="flex justify-center gap-8 sm:gap-16 px-4">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-accent font-bold text-sm">{step.num}</span>
              </div>
              <h3 className="font-medium text-white/90 text-sm drop-shadow">{step.title}</h3>
              <p className="text-xs text-white/70 mt-0.5 hidden sm:block drop-shadow">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
