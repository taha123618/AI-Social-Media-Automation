'use client';

import { useEffect, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

// Hook to prevent hydration mismatches by deferring client-only rendering
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState warning
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return isHydrated;
}

// Component wrapper to prevent hydration issues
export function HydrationWrapper({
  children,
  fallback = null
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const isHydrated = useHydration();

  if (!isHydrated) {
    return fallback as ReactElement;
  }

  return children as ReactElement;
}
