export default function CategoryList({ categories, selectedId, onSelect }) {
  const base = 'flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-150 min-h-[44px]';
  const active = 'bg-gradient-gold text-primary shadow-lg shadow-accent/20';
  const inactive = 'bg-white/5 text-white/60 border border-white/10 hover:border-accent/30 hover:text-white';

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
      <button onClick={() => onSelect(null)} className={`${base} ${!selectedId ? active : inactive}`}>
        All Services
      </button>
      {categories.map((cat) => (
        <button key={cat.id} onClick={() => onSelect(cat.id)} className={`${base} ${selectedId === cat.id ? active : inactive}`}>
          {cat.name}
        </button>
      ))}
    </div>
  );
}
