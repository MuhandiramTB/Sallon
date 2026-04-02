export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl shadow-md p-6 animate-pulse-soft">
      <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
      <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
      <div className="h-4 bg-white/10 rounded w-1/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 items-center p-4 animate-pulse-soft">
      <div className="h-4 bg-white/10 rounded w-1/4" />
      <div className="h-4 bg-white/10 rounded w-1/3" />
      <div className="h-4 bg-white/10 rounded w-1/6" />
    </div>
  );
}

export function SkeletonPage({ cards = 6 }) {
  return (
    <div className="animate-fade-in">
      <div className="h-8 bg-white/10 rounded w-1/3 mb-6 animate-pulse-soft" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
