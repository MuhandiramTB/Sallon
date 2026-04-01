export default function Input({ label, error, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={!!error}
        className={`w-full px-4 py-2.5 border rounded-lg text-[15px] min-h-[44px] bg-white transition-all duration-150 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
          error ? 'border-error ring-1 ring-error/30' : 'border-border hover:border-gray-400'
        }`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-error text-sm mt-1.5 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
