"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "@/lib/animations/gsap";

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    lenis.on("scroll", () => {
      // Potentially update ScrollTrigger here if needed
      // Currently, Lenis and GSAP ScrollTrigger work well together without explicit sync
      // unless we use a custom scroll container.
    });

    // Handle initial scroll positions or anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        e.preventDefault();
        lenis.scrollTo(anchor.hash);
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      lenis.destroy();
      (window as any).lenis = undefined;
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return lenisRef.current;
}
