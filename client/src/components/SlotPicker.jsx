import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { formatTime, getNextDays } from '../lib/formatDate.js';

export default function SlotPicker({ serviceId, onSelectSlot }) {
  const dates = getNextDays(14);
  // Auto-select the first day so the time grid shows immediately (no empty state on load).
  const [selectedDate, setSelectedDate] = useState(dates[0] || null);
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (!selectedDate) return;
    setIsLoading(true);
    setSlots([]);
    setMessage('');
    setSelectedSlot(null);
    api(`/slots?service_id=${serviceId}&date=${selectedDate}`)
      .then((res) => {
        setSlots(res.data.slots);
        if (res.data.message) setMessage(res.data.message);
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setIsLoading(false));
  }, [selectedDate, serviceId]);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    onSelectSlot({ date: selectedDate, ...slot });
  };

  return (
    <div>
      <h3 className="font-semibold text-white mb-3">Select Date</h3>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 snap-x snap-mandatory">
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] min-w-[80px] text-center snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              selectedDate === d
                ? 'bg-gradient-to-b from-accent to-amber-700 text-white shadow-md'
                : 'bg-white/5 text-white/80 border border-white/10 hover:border-accent/30'
            }`}
          >
            <div className="text-xs opacity-70">{new Date(d + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' })}</div>
            <div className="font-bold">{new Date(d + 'T00:00:00').getDate()}</div>
            <div className="text-xs opacity-70">{new Date(d + 'T00:00:00').toLocaleDateString('en', { month: 'short' })}</div>
          </button>
        ))}
      </div>

      {selectedDate && (
        <div className="animate-slide-up">
          <h3 className="font-semibold text-white mb-3">Select Time</h3>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[44px] bg-white/5 rounded-lg animate-pulse-soft" />
              ))}
            </div>
          ) : message ? (
            <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/60">{message}</p>
              <p className="text-white/70 text-sm mt-1">Try selecting a different date</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/70">No available slots for this date</p>
              <p className="text-white/70 text-sm mt-1">Try another date</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => handleSlotClick(slot)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                    selectedSlot?.startTime === slot.startTime
                      ? 'bg-gradient-to-b from-accent to-amber-700 text-white shadow-md'
                      : 'bg-white/5 text-white/80 border border-white/10 hover:border-accent/40 hover:bg-white/10 active:scale-[0.97]'
                  }`}
                >
                  {formatTime(slot.startTime)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
