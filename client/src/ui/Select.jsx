export default function Select({ label, error, id, children, ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 py-2.5 border rounded-lg text-[15px] min-h-[44px] bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
          error ? 'border-error' : 'border-border hover:border-gray-400'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p role="alert" className="text-error text-sm mt-1.5">{error}</p>}
    </div>
  );
}
