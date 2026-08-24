'use client';

import { useEffect } from "react";

export function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
   useEffect(() => {
      const listener = (event: MouseEvent | TouchEvent) => {
         if (!ref.current || ref.current.contains(event.target as Node)) {
            return;
         }
         handler(event);
      };

      document.addEventListener('mousedown', listener as EventListener);
      document.addEventListener('touchstart', listener as EventListener);

      return () => {
         document.removeEventListener('mousedown', listener as EventListener);
         document.removeEventListener('touchstart', listener as EventListener);
      };
   }, [ref, handler]);
}