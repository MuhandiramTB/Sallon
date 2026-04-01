import { formatDate, formatTime } from '../lib/formatDate.js';
import BookingStatusBadge from './BookingStatusBadge.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

export default function BookingCard({ booking, onCancel, showCustomer = false }) {
  return (
    <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800">{booking.serviceName}</h3>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-gray-500">
          {formatDate(booking.bookingDate)} &middot; {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
        </p>
        <p className="text-sm text-gray-500">
          Rs. {booking.price} &middot; {booking.categoryName}
        </p>
        {showCustomer && booking.customerName && (
          <p className="text-sm text-indigo-600 mt-1">{booking.customerName} ({booking.customerEmail})</p>
        )}
      </div>
      {onCancel && booking.status === 'pending' && (
        <Button onClick={() => onCancel(booking.id)} className="bg-red-500 hover:bg-red-600 text-sm">
          Cancel
        </Button>
      )}
    </Card>
  );
}
