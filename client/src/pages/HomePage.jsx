import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import Card from '../ui/Card.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api('/categories')
      .then((res) => setCategories(res.data.filter((c) => c.isActive)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div className="py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Welcome to Sallon</h2>
        <p className="text-gray-500 mt-2 text-lg">Book your salon appointment in seconds</p>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-400 text-center">Services coming soon...</p>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Choose a Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="cursor-pointer hover:shadow-lg hover:border-indigo-200 border-2 border-transparent transition-all text-center"
                onClick={() => navigate(`/services?category=${cat.id}`)}
              >
                <h4 className="text-lg font-semibold text-indigo-600">{cat.name}</h4>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
