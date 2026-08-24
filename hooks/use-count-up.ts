"use client";

import { useState, useEffect, useRef } from "react";
import { useScrollReveal } from "./use-scroll-reveal";

interface CountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  formatter?: (value: number) => string;
}

export function useCountUp(options: CountUpOptions) {
  const { end, duration = 2000, decimals = 0, suffix = "", prefix = "" } = options;
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible || !mounted) return;

    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (end - startValue) * eased;

      setCount(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, mounted, end, duration]);

  const formatted = (() => {
    if (!mounted) return `${prefix}0${suffix}`;
    const value = decimals > 0 ? count.toFixed(decimals) : count >= 1000000
      ? `${(count / 1000000).toFixed(1)}M`
      : count >= 1000
        ? `${(count / 1000).toFixed(0)}K`
        : Math.floor(count).toString();
    return `${prefix}${value}${suffix}`;
  })();

  return { count, ref, formatted, isVisible, mounted };
}
