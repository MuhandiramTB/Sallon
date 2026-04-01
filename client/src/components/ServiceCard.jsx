import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col justify-between animate-slide-up">
      <div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-text-primary">{service.name}</h3>
          <span className="text-xs font-medium text-primary bg-primary-light px-2 py-1 rounded-full flex-shrink-0 ml-2">
            {service.categoryName}
          </span>
        </div>
        {service.description && (
          <p className="text-text-secondary text-sm mb-3 line-clamp-2">{service.description}</p>
        )}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-primary">Rs. {service.price}</span>
          <span className="text-sm text-text-muted bg-gray-100 px-2 py-0.5 rounded">
            {service.durationMinutes} min
          </span>
        </div>
      </div>
      <Button
        className="mt-5 w-full"
        onClick={() => navigate(`/book/${service.id}`)}
      >
        Book Now
      </Button>
    </Card>
  );
}
