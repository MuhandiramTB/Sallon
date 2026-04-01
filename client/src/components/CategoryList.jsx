export default function CategoryList({ categories, selectedId, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-150 min-h-[44px] ${
          !selectedId
            ? 'bg-primary text-white shadow-md'
            : 'bg-surface text-text-secondary border border-border hover:border-primary/30 hover:text-primary'
        }`}
      >
        All Services
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-150 min-h-[44px] ${
            selectedId === cat.id
              ? 'bg-primary text-white shadow-md'
              : 'bg-surface text-text-secondary border border-border hover:border-primary/30 hover:text-primary'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
