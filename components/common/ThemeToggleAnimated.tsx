"use client";
import { useCallback, useEffect, useState } from 'react';
import { getTheme, toggleTheme, type Theme } from '@/lib/theme';

type AnimationVariant =
   | 'circle'
   | 'circle-blur'
   | 'polygon';

type StartPosition =
   | 'center'
   | 'top-left'
   | 'top-right'
   | 'bottom-left'
   | 'bottom-right';

export interface ThemeToggleAnimatedProps {
   /**
    * Size variant for the toggle button
    * @default 'default'
    */
   size?: 'sm' | 'default' | 'lg';
   /**
    * Custom className for the button
    */
   className?: string;
   /**
    * Show icon only or with text
    * @default true
    */
   iconOnly?: boolean;
   /**
    * Animation variant
    * @default 'circle-blur'
    */
   variant?: AnimationVariant;
   /**
    * Start position for the animation
    * If not provided, will automatically use:
    * - 'top-right' when switching to dark mode
    * - 'bottom-left' when switching to light mode
    */
   start?: StartPosition;
}

/**
 * Hook for using View Transitions API
 */
const useThemeTransition = () => {
   const startTransition = useCallback((updateFn: () => void) => {
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
         (document as any).startViewTransition(updateFn);
      } else {
         // Fallback for browsers without View Transitions API
         updateFn();
      }
   }, []);

   return { startTransition };
};

export default function ThemeToggleAnimated({
   size = 'default',
   className = '',
   iconOnly = true,
   variant = 'circle-blur',
   start, // Optional - if not provided, will use dynamic positioning
}: ThemeToggleAnimatedProps) {
   const [theme, setThemeState] = useState<Theme>(() => getTheme());
   const [mounted, setMounted] = useState(false);
   const { startTransition } = useThemeTransition();

   useEffect(() => {
      setMounted(true);
      setThemeState(getTheme());

      // Listen for storage changes to sync theme across tabs
      const handleStorageChange = (e: StorageEvent) => {
         if (e.key === 'theme' && e.newValue) {
            const newTheme = e.newValue as Theme;
            setThemeState(newTheme);
         }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
         window.removeEventListener('storage', handleStorageChange);
      };
   }, []);

   const injectAnimationStyles = useCallback((variant: AnimationVariant, startPosition: StartPosition) => {
      // Use a counter instead of Date.now() to avoid hydration mismatch
      const styleId = `theme-transition-${Math.random().toString(36).substr(2, 9)}`;
      let style = document.getElementById(styleId) as HTMLStyleElement;

      if (!style) {
         style = document.createElement('style');
         style.id = styleId;
      }

      const positions: Record<StartPosition, string> = {
         center: 'center',
         'top-left': 'top left',
         'top-right': 'top right',
         'bottom-left': 'bottom left',
         'bottom-right': 'bottom right',
      };

      let css = '';

      if (variant === 'circle') {
         const cx = startPosition === 'center' ? '50' : startPosition.includes('left') ? '0' : '100';
         const cy = startPosition === 'center' ? '50' : startPosition.includes('top') ? '0' : '100';
         css = `
        @supports (view-transition-name: root) {
          ::view-transition-group(root) {
            animation-duration: 0.9s;
            animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          ::view-transition-old(root) {
            animation: fade-out-smooth 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            mix-blend-mode: normal;
          }
          ::view-transition-new(root) {
            animation: circle-expand-smooth 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            transform-origin: ${positions[startPosition]};
            mix-blend-mode: normal;
          }
          @keyframes fade-out-smooth {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
          @keyframes circle-expand-smooth {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
              opacity: 1;
            }
          }
        }
      `;
      } else if (variant === 'circle-blur') {
         const cx = startPosition === 'center' ? '50' : startPosition.includes('left') ? '0' : '100';
         const cy = startPosition === 'center' ? '50' : startPosition.includes('top') ? '0' : '100';
         css = `
        @supports (view-transition-name: root) {
          ::view-transition-group(root) {
            animation-duration: 1s;
            animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            will-change: transform;
          }
          ::view-transition-old(root) {
            animation: fade-out-blur 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            mix-blend-mode: normal;
            will-change: opacity, filter;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand-smooth 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            transform-origin: ${positions[startPosition]};
            mix-blend-mode: normal;
            will-change: clip-path, filter, opacity;
          }
          @keyframes fade-out-blur {
            from {
              opacity: 1;
              filter: blur(0);
            }
            to {
              opacity: 0;
              filter: blur(6px);
            }
          }
          @keyframes circle-blur-expand-smooth {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
              filter: blur(14px);
              opacity: 0;
            }
            12% {
              opacity: 0.6;
              filter: blur(10px);
            }
            25% {
              opacity: 0.75;
              filter: blur(7px);
            }
            45% {
              filter: blur(5px);
              opacity: 0.85;
            }
            65% {
              filter: blur(3px);
              opacity: 0.92;
            }
            85% {
              filter: blur(1px);
              opacity: 0.97;
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
              filter: blur(0);
              opacity: 1;
            }
          }
        }
      `;
      } else if (variant === 'polygon') {
         css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: ${theme === 'light' ? 'wipe-in-dark' : 'wipe-in-light'} 0.5s ease-out;
          }
          @keyframes wipe-in-dark {
            from {
              clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
          @keyframes wipe-in-light {
            from {
              clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
        }
      `;
      }

      if (css) {
         style.textContent = css;
         if (!document.getElementById(styleId)) {
            document.head.appendChild(style);
         }

         // Clean up animation styles after transition completes
         setTimeout(() => {
            const styleEl = document.getElementById(styleId);
            if (styleEl) {
               styleEl.remove();
            }
         }, 1500); // Clean up after animation completes (1000ms + buffer)
      }
   }, [theme]);

   const handleToggle = useCallback(() => {
      const currentTheme = getTheme();
      const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';

      // Dynamic start position based on target theme:
      // - top-right when switching to dark mode (light -> dark)
      // - bottom-left when switching to light mode (dark -> light)
      // If start prop is explicitly set, use it; otherwise use dynamic positioning
      const dynamicStart: StartPosition = start !== undefined
         ? start
         : newTheme === 'dark'
            ? 'top-right'  // When switching to dark, animate from top-right
            : 'bottom-left'; // When switching to light, animate from bottom-left (reverse)

      // Inject animation styles before transition
      if (typeof document !== 'undefined') {
         // Pre-inject styles synchronously to avoid delay
         injectAnimationStyles(variant, dynamicStart);

         // Use requestAnimationFrame to ensure browser is ready for transition
         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               startTransition(() => {
                  // Apply theme change directly (View Transition will handle the animation)
                  const root = document.documentElement;

                  // Ensure smooth transition by preparing DOM
                  root.style.willChange = 'background-color, color';

                  if (newTheme === 'dark') {
                     root.classList.add('dark');
                  } else {
                     root.classList.remove('dark');
                  }

                  // Update localStorage
                  localStorage.setItem('theme', newTheme);

                  // Reset will-change after transition
                  requestAnimationFrame(() => {
                     setTimeout(() => {
                        root.style.willChange = 'auto';
                     }, 1100); // Match animation duration
                  });

                  setThemeState(newTheme);

                  // Dispatch custom event to notify other components
                  window.dispatchEvent(new CustomEvent('themechange', { detail: newTheme }));
               });
            });
         });
      } else {
         // Fallback if document is not available
         setThemeState(newTheme);
      }
   }, [variant, start, injectAnimationStyles, startTransition]);

   // Size variants
   const sizeClasses = {
      sm: 'h-8 w-8 p-1.5',
      default: 'h-10 w-10 p-2',
      lg: 'h-12 w-12 p-2.5',
   };

   const iconSizes = {
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-6 w-6',
   };

   // Don't render until mounted to avoid hydration mismatch
   if (!mounted) {
      return (
         <button
            className={`rounded-full bg-gradient-to-r from-secondary to-primary text-white transition-all duration-200 ${sizeClasses[size]} ${className}`}
            aria-label="Toggle theme"
            disabled
         >
            <div className={iconSizes[size]} />
         </button>
      );
   }

   const isDark = theme === 'dark';

   return (
      <button
         onClick={handleToggle}
         className={`rounded-full bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center ${sizeClasses[size]} ${className}`}
         aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
         type="button"
         style={{
            position: 'relative',
            overflow: 'visible',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)' // Force GPU acceleration
         }}
      >
         {isDark ? (
            // Moon icon for dark mode (clicking switches to light)
            <svg
               xmlns="http://www.w3.org/2000/svg"
               className={iconSizes[size]}
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
               aria-hidden="true"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
               />
            </svg>
         ) : (
            // Sun icon for light mode (clicking switches to dark)
            <svg
               xmlns="http://www.w3.org/2000/svg"
               className={iconSizes[size]}
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
               aria-hidden="true"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
               />
            </svg>
         )}
         {!iconOnly && (
            <span className="ml-2 text-sm font-medium">
               {isDark ? 'Dark' : 'Light'}
            </span>
         )}
      </button>
   );
}

