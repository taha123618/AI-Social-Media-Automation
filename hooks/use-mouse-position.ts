"use client";

import { useState, useEffect, useCallback, type RefObject } from "react";

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
  elementX: number;
  elementY: number;
}

export function useMousePosition(
  ref?: RefObject<HTMLElement | null>,
): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
    elementX: 0,
    elementY: 0,
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const normalizedX = (x / w) * 2 - 1;
      const normalizedY = (y / h) * 2 - 1;

      let elementX = 0;
      let elementY = 0;
      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect();
        elementX = x - rect.left;
        elementY = y - rect.top;
      }

      setPosition({ x, y, normalizedX, normalizedY, elementX, elementY });
    },
    [ref],
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return position;
}
