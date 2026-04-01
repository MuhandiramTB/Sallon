import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { formatTime, getNextDays, formatDate } from '../lib/formatDate.js';
import Spinner from '../ui/Spinner.jsx';

export default function SlotPicker({ serviceId, onSelectSlot }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const dates = getNextDays(14);

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
      <h3 className="font-semibold text-gray-700 mb-3">Select Date</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              selectedDate === d
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {formatDate(d)}
          </button>
        ))}
      </div>

      {selectedDate && (
        <>
          <h3 className="font-semibold text-gray-700 mb-3">Select Time</h3>
          {isLoading ? (
            <Spinner />
          ) : message ? (
            <p className="text-gray-500 text-center py-4">{message}</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No available slots for this date.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => handleSlotClick(slot)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                    selectedSlot?.startTime === slot.startTime
                      ? 'bg-indigo-600 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  {formatTime(slot.startTime)}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
