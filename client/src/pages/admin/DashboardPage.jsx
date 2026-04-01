import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { getTodayDate, formatTime } from '../../lib/formatDate.js';
import Card from '../../ui/Card.jsx';
import BookingStatusBadge from '../../components/BookingStatusBadge.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';

const NAV_ITEMS = [
  { to: '/admin/categories', icon: '📁', title: 'Categories', desc: 'Manage service categories' },
  { to: '/admin/services', icon: '✂️', title: 'Services', desc: 'Manage salon services & pricing' },
  { to: '/admin/bookings', icon: '📅', title: 'All Bookings', desc: 'View & manage all bookings' },
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
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="text-center py-5">
          <div className="text-3xl font-bold text-primary">{todayBookings.length}</div>
          <div className="text-sm text-text-secondary mt-1">Today</div>
        </Card>
        <Card className="text-center py-5">
          <div className="text-3xl font-bold text-amber-500">{pending}</div>
          <div className="text-sm text-text-secondary mt-1">Pending</div>
        </Card>
        <Card className="text-center py-5">
          <div className="text-3xl font-bold text-green-500">{confirmed}</div>
          <div className="text-sm text-text-secondary mt-1">Confirmed</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card interactive className="text-center py-5">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-sm text-text-primary">{item.title}</h3>
              <p className="text-text-muted text-xs mt-1 hidden sm:block">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-text-primary mb-4">Today's Schedule</h2>
      {todayBookings.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-secondary">No bookings for today</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {todayBookings.filter((b) => b.status !== 'cancelled').map((b) => (
            <Card key={b.id} className="flex items-center gap-4 py-4">
              <div className="text-center min-w-[60px]">
                <div className="text-lg font-bold text-primary">{formatTime(b.startTime)}</div>
                <div className="text-xs text-text-muted">{formatTime(b.endTime)}</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-text-primary">{b.customerName}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <div className="text-sm text-text-secondary">{b.serviceName}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
