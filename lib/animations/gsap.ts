import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // High-performance defaults
  gsap.config({
    nullTargetWarn: false,
    autoSleep: 60,
  });

  // Default ScrollTrigger settings for smooth SaaS feel
  ScrollTrigger.config({
    limitCallbacks: true,
  });
}

export const scrollAnimationDefaults = {
  start: "top 85%",
  end: "bottom 15%",
  toggleActions: "play none none reverse",
};

export const transitionFast = { duration: 0.3, ease: "power2.out" };
export const transitionMedium = { duration: 0.5, ease: "power3.out" };
export const transitionSlow = { duration: 0.8, ease: "power4.out" };

export { gsap, ScrollTrigger };
