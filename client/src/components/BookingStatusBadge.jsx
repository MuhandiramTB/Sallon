const STATUS_CONFIG = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
  confirmed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Confirmed' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Completed' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Cancelled' },
};

export default function BookingStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.cancelled;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      {config.label}
    </span>
  );
}
