import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-lg text-gray-800">{service.name}</h3>
        {service.description && (
          <p className="text-gray-500 text-sm mt-1">{service.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <span>{service.durationMinutes} min</span>
          <span className="font-semibold text-indigo-600">Rs. {service.price}</span>
        </div>
      </div>
      <Button
        className="mt-4 w-full"
        onClick={() => navigate(`/book/${service.id}`)}
      >
        Book Now
      </Button>
    </Card>
  );
}
