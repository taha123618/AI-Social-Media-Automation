"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2, // Duration of scroll animation
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing function
      lerp: 0.1, // Linear interpolation factor
      wheelMultiplier: 1, // Wheel sensitivity multiplier
      touchMultiplier: 2, // Touch sensitivity multiplier
      infinite: false, // Infinite scrolling
    });

    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    // Sync GSAP ScrollTrigger with Lenis
    lenis.on("scroll", ScrollTrigger.update);

    // Start the animation loop
    requestAnimationFrame(raf);

    // Handle resize
    const handleResize = () => {
      lenis.resize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Method to scroll to a specific element
  const scrollTo = (target: string | HTMLElement, offset: number = 0) => {
    if (!lenisRef.current) {
      console.warn('Lenis instance not available');
      return;
    }

    let element: HTMLElement | null = null;

    if (typeof target === "string") {
      element = document.querySelector(target);
      // Debug: Log if element is found
      console.log(`Looking for element: ${target}`, element);
    } else {
      element = target;
    }

    if (element) {
      const targetY = element.getBoundingClientRect().top + window.scrollY - offset;
      console.log(`Scrolling to Y position: ${targetY} (offset: ${offset})`);

      // Try Lenis first, then fallback to native smooth scroll
      try {
        setTimeout(() => {
          lenisRef.current?.scrollTo(targetY);
        }, 50);
      } catch (error) {
        console.warn('Lenis scroll failed, using fallback:', error);
        // Fallback to native smooth scrolling
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    } else {
      console.warn(`Element not found: ${target}`);
    }
  };

  return { scrollTo };
}
