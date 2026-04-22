import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { getTodayDate, formatTime } from '../../lib/formatDate.js';
import Card from '../../ui/Card.jsx';
import BookingStatusBadge from '../../components/BookingStatusBadge.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';
import Button from '../../ui/Button.jsx';

export default function DashboardPage() {
  const [todayBookings, setTodayBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api(`/admin/bookings?date=${getTodayDate()}`),
      api('/admin/stats'),
    ])
      .then(([bookingsRes, statsRes]) => {
        setTodayBookings(bookingsRes.data);
        setStats(statsRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const todayPending = todayBookings.filter((b) => b.status === 'pending').length;
  const todayConfirmed = todayBookings.filter((b) => b.status === 'confirmed').length;

  if (isLoading) return <SkeletonPage cards={4} />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <Link to="/admin/quick-booking">
          <Button className="text-sm">+ Quick Booking</Button>
        </Link>
      </div>

      {/* Overall Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Link to="/admin/bookings" className="block">
            <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
              <div className="text-2xl font-bold text-accent">{stats.customers}</div>
              <div className="text-xs text-white/60 mt-1">Customers</div>
            </Card>
          </Link>
          <Link to="/admin/services" className="block">
            <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
              <div className="text-2xl font-bold text-white">{stats.services}</div>
              <div className="text-xs text-white/60 mt-1">Services</div>
            </Card>
          </Link>
          <Link to="/admin/bookings" className="block">
            <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
              <div className="text-2xl font-bold text-blue-400">{stats.bookings.total}</div>
              <div className="text-xs text-white/60 mt-1 leading-tight">Total Bookings</div>
            </Card>
          </Link>
          <Link to="/admin/bookings?status=completed" className="block">
            <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
              <div className="text-2xl font-bold text-green-400">{stats.bookings.completed}</div>
              <div className="text-xs text-white/60 mt-1">Completed</div>
            </Card>
          </Link>
        </div>
      )}

      {/* Today Stats */}
      <h2 className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Today</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link to="/admin/bookings?date=today" className="block">
          <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
            <div className="text-2xl font-bold text-white">{todayBookings.filter(b => b.status !== 'cancelled').length}</div>
            <div className="text-xs text-white/60 mt-1">Appointments</div>
          </Card>
        </Link>
        <Link to="/admin/bookings?date=today&status=pending" className="block">
          <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
            <div className="text-2xl font-bold text-amber-400">{todayPending}</div>
            <div className="text-xs text-white/60 mt-1">Pending</div>
          </Card>
        </Link>
        <Link to="/admin/bookings?date=today&status=confirmed" className="block">
          <Card interactive className="flex flex-col items-center justify-center !px-2 py-4 text-center h-full">
            <div className="text-2xl font-bold text-green-400">{todayConfirmed}</div>
            <div className="text-xs text-white/60 mt-1">Confirmed</div>
          </Card>
        </Link>
      </div>

      {/* Today's Bookings */}
      {todayBookings.filter(b => b.status !== 'cancelled').length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-3xl mb-3">☀️</div>
          <p className="text-white/70">No appointments today</p>
          <p className="text-white/60 text-sm mt-1">Use Quick Booking when a customer calls</p>
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
