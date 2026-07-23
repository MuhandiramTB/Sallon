import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const BrandingContext = createContext(null);

const CACHE_KEY = 'branding-cache-v1';
const EMPTY = { salonName: '', logoUrl: '', galleryImages: [] };

// Read last-known branding synchronously so the first paint is already correct
// on repeat visits (no flash of empty content while the API wakes up).
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return { ...EMPTY, ...parsed, galleryImages: Array.isArray(parsed.galleryImages) ? parsed.galleryImages : [] };
    }
  } catch {
    /* ignore corrupt cache */
  }
  return null;
}

export function BrandingProvider({ children }) {
  const cached = readCache();
  const [branding, setBranding] = useState(cached || EMPTY);
  // "ready" = we have something real to show (a cache hit, or the API has answered).
  const [ready, setReady] = useState(!!cached);

  useEffect(() => {
    let alive = true;
    api('/config/branding')
      .then((res) => {
        if (!alive || !res?.data) return;
        const next = {
          ...EMPTY,
          ...res.data,
          galleryImages: Array.isArray(res.data.galleryImages) ? res.data.galleryImages : [],
        };
        setBranding(next);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {
          /* storage full / disabled — non-fatal */
        }
      })
      .catch(() => {
        /* offline / cold start — keep cached values if any */
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, ready }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
}
