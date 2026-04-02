import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { getTodayDate, formatTime } from '../../lib/formatDate.js';
import Card from '../../ui/Card.jsx';
import BookingStatusBadge from '../../components/BookingStatusBadge.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';

const NAV_ITEMS = [
  { to: '/admin/quick-booking', icon: '📞', title: 'Quick Booking', desc: 'Book for walk-in / phone customer' },
  { to: '/admin/bookings', icon: '📅', title: 'All Bookings', desc: 'View & manage all bookings' },
  { to: '/admin/categories', icon: '📁', title: 'Categories', desc: 'Manage service categories' },
  { to: '/admin/services', icon: '✂️', title: 'Services', desc: 'Manage salon services & pricing' },
  { to: '/admin/operating-hours', icon: '🕐', title: 'Hours', desc: 'Set open/close per day' },
];

export default function DashboardPage() {
  const [todayBookings, setTodayBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api(`/admin/bookings?date=${getTodayDate()}`)
      .then((res) => setTodayBookings(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  const pending = todayBookings.filter((b) => b.status === 'pending').length;
  const confirmed = todayBookings.filter((b) => b.status === 'confirmed').length;

  if (isLoading) return <SkeletonPage cards={4} />;

  return (
    <div className="py-6 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="text-center py-5">
          <div className="text-3xl font-bold text-accent">{todayBookings.length}</div>
          <div className="text-sm text-white/60 mt-1">Today</div>
        </Card>
        <Card className="text-center py-5">
          <div className="text-3xl font-bold text-amber-400">{pending}</div>
          <div className="text-sm text-white/60 mt-1">Pending</div>
        </Card>
        <Card className="text-center py-5">
          <div className="text-3xl font-bold text-green-400">{confirmed}</div>
          <div className="text-sm text-white/60 mt-1">Confirmed</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card interactive className="text-center py-5">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-sm text-white">{item.title}</h3>
              <p className="text-white/60 text-xs mt-1 hidden sm:block">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Today's Bookings</h2>

      {todayBookings.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-white/60">No bookings for today</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {todayBookings.filter((b) => b.status !== 'cancelled').map((b) => (
            <Card key={b.id} className="py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-accent">{formatTime(b.startTime)}</div>
                <BookingStatusBadge status={b.status} />
              </div>
              <div className="space-y-1.5">
                <div className="font-medium text-white">{b.customerName}</div>
                <div className="text-sm text-white/80">{b.serviceName}</div>
                <div className="text-xs text-white/60">{formatTime(b.startTime)} - {formatTime(b.endTime)}</div>
                {b.customerPhone && (
                  <a
                    href={`tel:${b.customerPhone}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(b.customerPhone);
                      const el = e.currentTarget;
                      const original = el.innerHTML;
                      el.textContent = 'Copied!';
                      setTimeout(() => { el.innerHTML = original; }, 1500);
                      window.open(`tel:${b.customerPhone}`);
                    }}
                    className="text-xs text-accent font-medium hover:underline cursor-pointer flex items-center gap-1 mt-1"
                    title="Tap to call / copy number"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {b.customerPhone}
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
