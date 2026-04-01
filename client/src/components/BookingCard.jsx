import { formatDate, formatTime } from '../lib/formatDate.js';
import BookingStatusBadge from './BookingStatusBadge.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

export default function BookingCard({ booking, onCancel, showCustomer = false }) {
  return (
    <Card className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <h3 className="font-semibold text-text-primary">{booking.serviceName}</h3>
            <BookingStatusBadge status={booking.status} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-text-secondary flex items-center gap-2">
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {formatDate(booking.bookingDate)} &middot; {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </p>
            <p className="text-sm text-text-secondary flex items-center gap-2">
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
              Rs. {booking.price} &middot; {booking.categoryName}
            </p>
            {showCustomer && booking.customerName && (
              <p className="text-sm text-primary font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {booking.customerName} ({booking.customerPhone || booking.customerEmail})
              </p>
            )}
          </div>
        </div>
        {onCancel && booking.status === 'pending' && (
          <Button variant="danger" onClick={() => onCancel(booking.id)} className="text-sm sm:w-auto w-full">
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
