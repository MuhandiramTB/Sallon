import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import CategoryList from '../components/CategoryList.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api('/services'), api('/categories')])
      .then(([svcRes, catRes]) => {
        setServices(svcRes.data);
        setCategories(catRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = selectedCategory
    ? services.filter((s) => s.categoryId === selectedCategory)
    : services;

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Services</h2>
      <CategoryList categories={categories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No services available in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      )}
    </div>
  );
}
