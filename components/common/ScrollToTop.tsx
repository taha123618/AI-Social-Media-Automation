"use client"
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type Lenis from "lenis";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
   const [isVisible, setIsVisible] = useState(false);
   const [scrollProgress, setScrollProgress] = useState(0);

   // Listen to Lenis scroll events
   useEffect(() => {
      const lenis = (window as any).lenis as Lenis | undefined;

      // Check if Lenis is available AND has event methods
      if (!lenis || typeof (lenis as any).on !== "function") {
      // Fallback to window scroll if Lenis is not initialized or lacks event API
         const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
            setScrollProgress(progress);

            if (window.scrollY > 500 && !isVisible) {
               setIsVisible(true);
            } else if (window.scrollY <= 300 && isVisible) {
               setIsVisible(false);
            }
         };

         window.addEventListener("scroll", handleScroll, { passive: true });
         handleScroll(); // Initial check

         return () => window.removeEventListener("scroll", handleScroll);
      }

      // Use Lenis scroll events
      const handleLenisScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
         const progress = limit > 0 ? scroll / limit : 0;
         setScrollProgress(progress);

         if (scroll > 500 && !isVisible) {
            setIsVisible(true);
         } else if (scroll <= 300 && isVisible) {
            setIsVisible(false);
         }
      };

      lenis.on("scroll", handleLenisScroll);

      // Initial check
      const currentScroll = (lenis as any).scroll ?? 0;
      const scrollLimit = (lenis as any).limit ?? 1;
      handleLenisScroll({ scroll: currentScroll, limit: scrollLimit });

      return () => {
         lenis.off("scroll", handleLenisScroll);
      };
   }, [isVisible]);

   // Smooth scroll to top using Lenis
   const scrollToTop = () => {
      const lenis = (window as any).lenis as Lenis | undefined;

      if (lenis) {
         // Use Lenis smooth scroll
         lenis.scrollTo(0, {
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
         });
      } else {
         // Fallback to native smooth scroll
         window.scrollTo({
            top: 0,
            behavior: "smooth",
         });
      }
   };

   // Calculate SVG circle progress
   const circumference = 2 * Math.PI * 24;
   const strokeDashoffset = circumference - scrollProgress * circumference;

   return (
      <>
         {/* Progress bar at top */}
         <motion.div
            className="fixed top-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary via-secondary to-primary origin-left z-50"
            style={{ scaleX: scrollProgress }}
         />

         <div className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
               {isVisible && (
                  <motion.button
                     onClick={scrollToTop}
                     className="group relative flex items-center justify-center"
                     aria-label="Scroll to top"
                     initial={{ opacity: 0, scale: 0.5, y: 20 }}
                     animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: { type: "spring", damping: 15, stiffness: 400 },
                     }}
                     exit={{
                        opacity: 0,
                        scale: 0.5,
                        y: 20,
                        transition: { duration: 0.2 },
                     }}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                  >
                     {/* Outer glow ring */}
                     <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all duration-500" />

                     {/* Progress ring SVG */}
                     <svg
                        className="absolute w-16 h-16 -rotate-90"
                        viewBox="0 0 52 52"
                     >
                        {/* Background track */}
                        <circle
                           cx="26"
                           cy="26"
                           r="24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                           className="text-border/50"
                        />
                        {/* Progress indicator */}
                        <circle
                           cx="26"
                           cy="26"
                           r="24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           className="text-primary"
                           style={{
                              strokeDasharray: circumference,
                              strokeDashoffset: strokeDashoffset,
                              transition: "stroke-dashoffset 0.1s ease-out",
                           }}
                        />
                     </svg>

                     {/* Glassmorphism button */}
                     <div className="relative w-12 h-12 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-all duration-300">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                        {/* Icon */}
                        <ArrowUp className="relative w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
                     </div>

                     {/* Tooltip */}
                     <motion.span
                        className="absolute right-full mr-4 px-3 py-1.5 bg-popover/90 backdrop-blur-md border border-border/50 rounded-lg text-xs font-medium text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-lg"
                     >
                        Back to top
                        {/* Tooltip arrow */}
                        <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-popover/90 border-r border-b border-border/50 rotate-[-45deg]" />
                     </motion.span>
                  </motion.button>
               )}
            </AnimatePresence>
         </div>
      </>
   );
};

export default ScrollToTop;
