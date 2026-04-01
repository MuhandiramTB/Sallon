export default function Card({ children, interactive, className = '', ...props }) {
  return (
    <div
      className={`bg-surface rounded-xl shadow-md p-6 transition-all duration-150 ${
        interactive ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
