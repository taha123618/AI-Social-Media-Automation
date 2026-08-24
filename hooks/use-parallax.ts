"use client";

import { useEffect, useRef, useState } from "react";

export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const diff = centerY - viewportCenter;
      setOffsetY(diff * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, offsetY };
}
