export default function Button({ children, type = 'button', disabled, className = '', ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
