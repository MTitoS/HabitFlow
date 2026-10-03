import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export interface MotionContextValue {
  reducedMotion: boolean;
  animate: (callback: () => void) => void;
}

export function shouldAnimate(reducedMotion: boolean): boolean {
  return !reducedMotion;
}

const MotionContext = createContext<MotionContextValue>({
  reducedMotion: false,
  animate: (cb) => cb(),
});

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);

  const value = useMemo<MotionContextValue>(
    () => ({
      reducedMotion,
      animate: (cb) => {
        if (shouldAnimate(reducedMotion)) {
          cb();
        }
      },
    }),
    [reducedMotion],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}