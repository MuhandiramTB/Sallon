import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../ui/Card.jsx';
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

  return (
    <Card className="flex flex-col justify-between animate-slide-up">
      <div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-white">{service.name}</h3>
          <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full flex-shrink-0 ml-2">
            {service.categoryName}
          </span>
        </div>
        {service.description && String(service.description).trim() && String(service.description).trim() !== '0' && (
          <p className="text-white/80 text-sm mb-3 line-clamp-2">{service.description}</p>
        )}
        {service.isPackage && service.packageItems?.length > 0 && (
          <p className="text-xs text-accent mb-3">
            Includes: {service.packageItems.map((i) => i.name).join(' + ')}
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-accent">Rs. {service.price}</span>
          <span className="text-sm text-white/70 bg-white/10 px-2.5 py-0.5 rounded-full">
            {service.durationMinutes} min
          </span>
        </div>
      </div>
      <Button className="mt-5 w-full" onClick={handleBook}>
        {user?.role === 'admin' ? 'Book for Customer' : 'Book Now'}
      </Button>
    </Card>
  );
}
