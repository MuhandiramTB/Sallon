import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

const STEPS = [
  { num: '01', title: 'Choose Service', desc: 'Browse our curated menu' },
  { num: '02', title: 'Pick Your Time', desc: 'Select date & time slot' },
  { num: '03', title: 'Confirm & Relax', desc: 'Walk in at your time' },
];

export default function HomePage() {
  const [branding, setBranding] = useState({ salonName: 'SallonArt' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api('/config/branding').then((r) => setBranding(r.data)).catch(() => {});
  }, []);

  return (
    <div className="h-[calc(100vh-57px)] bg-gradient-hero text-white relative overflow-hidden flex flex-col">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent rounded-full blur-[100px]" />
      </div>

      {/* Hero content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white/70 mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Now accepting online bookings
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-slide-up">
            Welcome to<br />
            <span className="text-gradient">{branding.salonName}</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 mb-8 max-w-md mx-auto animate-slide-up">
            Your premium grooming experience. Book your appointment in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up">
            <button onClick={() => navigate(user ? '/services' : '/login')}
              className="bg-gradient-gold text-primary font-semibold px-8 py-3.5 rounded-xl text-base hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-[0.97] min-h-[48px]">
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: How it works */}
      <div className="relative z-10 pb-8">
        <div className="flex justify-center gap-8 sm:gap-16 px-4">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-accent font-bold text-sm">{step.num}</span>
              </div>
              <h3 className="font-medium text-white/80 text-sm">{step.title}</h3>
              <p className="text-xs text-white/60 mt-0.5 hidden sm:block">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
