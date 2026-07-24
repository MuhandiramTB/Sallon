import { useEffect } from 'react';

/**
 * Full-screen image viewer. Renders nothing when `src` is falsy.
 * Close on backdrop click, the X button, or Escape.
 */
export default function Lightbox({ src, alt = '', onClose }) {
  useEffect(() => {
    if (!src) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    // Prevent background scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close image"
        className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain animate-scale-in"
      />
    </div>
  );
}
