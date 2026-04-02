import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import CategoryList from '../components/CategoryList.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { SkeletonPage } from '../ui/Skeleton.jsx';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') ? Number(searchParams.get('category')) : null;

  useEffect(() => {
    Promise.all([api('/services'), api('/categories')])
      .then(([svcRes, catRes]) => {
        setServices(svcRes.data);
        setCategories(catRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleCategorySelect = (catId) => {
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  const filtered = selectedCategory
    ? services.filter((s) => s.categoryId === selectedCategory)
    : services;

  if (isLoading) return <SkeletonPage cards={6} />;

  return (
    <div className="py-6 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Our Services</h1>
      <CategoryList categories={categories} selectedId={selectedCategory} onSelect={handleCategorySelect} />
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No services found"
          description="No services available in this category yet."
          actionLabel="View All Services"
          onAction={() => handleCategorySelect(null)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      )}
    </div>
  );
}
