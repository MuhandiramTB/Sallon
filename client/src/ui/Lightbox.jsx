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
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Close button — large, always reachable at top-right */}
      <button
        onClick={onClose}
        aria-label="Close image"
        className="fixed top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all shadow-lg"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain animate-scale-in"
      />

      {alt && (
        <p className="mt-4 text-white/80 text-sm font-medium text-center px-4">{alt}</p>
      )}

      {/* Tap-to-close hint (mobile) */}
      <p className="mt-1 text-white/40 text-xs">Tap anywhere to close</p>
    </div>
  );
}
