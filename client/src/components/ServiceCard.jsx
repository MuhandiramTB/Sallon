import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBook = () => {
    if (user?.role === 'admin') {
      navigate(`/admin/quick-booking?service=${service.id}`);
    } else {
      navigate(`/book/${service.id}`);
    }
  };

  const hasDescription =
    service.description &&
    String(service.description).trim() &&
    String(service.description).trim() !== '0';

  return (
    <div className="group flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 animate-slide-up">
      {/* Image (or elegant gradient fallback) */}
      <div className="relative h-44 overflow-hidden">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-[#2d2d44] to-primary flex items-center justify-center">
            <span className="text-5xl font-bold text-accent/40 group-hover:text-accent/60 transition-colors">
              {service.name?.charAt(0).toUpperCase() || '✂'}
            </span>
          </div>
        )}
        {/* Gradient scrim for text legibility + category chip */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute top-3 right-3 text-xs font-medium text-accent bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {service.categoryName}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-semibold text-lg text-white">{service.name}</h3>
        {hasDescription && (
          <p className="text-white/70 text-sm mt-1 line-clamp-2">{service.description}</p>
        )}
        {!!service.isPackage && service.packageItems?.length > 0 && (
          <p className="text-xs text-accent mt-2">
            Includes: {service.packageItems.map((i) => i.name).join(' + ')}
          </p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-2xl font-bold text-accent">Rs. {service.price}</span>
          <span className="text-sm text-white/70 bg-white/10 px-2.5 py-0.5 rounded-full">
            {service.durationMinutes} min
          </span>
        </div>
        <Button className="mt-5 w-full" onClick={handleBook}>
          {user?.role === 'admin' ? 'Book for Customer' : 'Book Now'}
        </Button>
      </div>
    </div>
  );
}
