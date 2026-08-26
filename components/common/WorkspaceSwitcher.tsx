'use client';

import { useState, useRef, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Building2, Check, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserWorkspaces, getActiveWorkspaceId, setActiveWorkspaceId } from '@/app/(user)/actions/workspace';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

export function WorkspaceSwitcher() {
   const [isOpen, setIsOpen] = useState(false);
   const [isSwitching, setIsSwitching] = useState(false);
   const [isPending, startTransition] = useTransition();
   const dropdownRef = useRef<HTMLDivElement>(null);
   const router = useRouter();
   const pathname = usePathname();
   const queryClient = useQueryClient();
   const hasHydrated = useHasHydrated();

   const { data, isLoading: isLoadingWorkspaces } = useQuery({
      queryKey: ['workspaces'],
      queryFn: async () => {
         const [fetchedWorkspaces, currentId] = await Promise.all([
            getUserWorkspaces(),
            getActiveWorkspaceId()
         ]);
         return { workspaces: fetchedWorkspaces, currentId };
      },
      staleTime: 5 * 60 * 1000 // 5 minutes
   });

   // Initialize activeId from data directly, avoiding effect-based state updates
   const activeId = data?.currentId || null;
   const workspaces = data?.workspaces || [];
   const isLoading = !hasHydrated || isLoadingWorkspaces;

   useClickOutside(dropdownRef, () => setIsOpen(false));

   const handleSwitch = async (id: string) => {
      if (id === activeId) {
         setIsOpen(false);
         return;
      }

      setIsSwitching(true);
      try {
         await setActiveWorkspaceId(id);
         if (typeof window !== 'undefined') {
            localStorage.setItem('last_business_id', id);
         }
         setIsOpen(false);
         toast.success('Workspace switched');

         // Invalidate ALL queries to ensure everything is fresh
         await queryClient.invalidateQueries();

         startTransition(() => {
            router.push(pathname);
            router.refresh();
         });

         setIsSwitching(false);
      } catch {
         toast.error('Failed to switch workspace');
         setIsSwitching(false);
      }
   };

   const activeWorkspace = workspaces.find(w => w.id === activeId);

   if (isLoading) {
      return (
         <div
            suppressHydrationWarning
            className="w-full h-11 rounded-lg bg-secondary/60 animate-pulse flex items-center px-3 mt-3"
         >
            <div className="h-5 w-5 rounded-md bg-secondary mr-2.5" />
            <div className="h-3.5 w-24 bg-secondary rounded-md" />
         </div>
      );
   }

   if (workspaces.length === 0) return null;

   return (
      <>
         {/* Global Switching Overlay */}
         {hasHydrated && typeof document !== 'undefined' && document.body && createPortal(
            <AnimatePresence>
               {(isSwitching || isPending) && (
                  <motion.div
                     initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                     animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                     exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                     className="fixed inset-0 z-[9999] bg-background/60 flex flex-col items-center justify-center p-4 md:pl-64"
                     style={{ position: 'fixed', inset: 0 }}
                  >
                     <div className="bg-card p-6 rounded-2xl shadow-2xl flex flex-col items-center border border-border max-w-sm w-full text-center">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                           <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-1.5">Switching Workspace</h3>
                        <p className="text-xs text-muted-foreground mb-5">
                           Synchronizing workspace resources and agent parameters...
                        </p>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                           <motion.div
                              className="bg-primary h-full rounded-full"
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 1.5, ease: "easeInOut" }}
                           />
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>,
            document.body
         )}

         <div className="relative w-full mt-3" ref={dropdownRef}>
            <button
               onClick={() => setIsOpen(!isOpen)}
               disabled={isSwitching || isPending}
               className="w-full flex items-center justify-between p-2 rounded-lg border border-border/80 bg-sidebar-accent/50 hover:bg-sidebar-accent hover:border-primary/40 transition-all text-left group shadow-xs cursor-pointer"
            >
               <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                     <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate">
                     <p className="text-[10px] text-muted-foreground font-mono font-medium">Active Workspace</p>
                     <p className="text-xs font-bold text-foreground truncate">
                        {activeWorkspace?.name || 'Select Workspace'}
                     </p>
                  </div>
               </div>
               <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
               {isOpen && (
                  <motion.div
                     initial={{ opacity: 0, y: 6, scale: 0.98 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 6, scale: 0.98 }}
                     transition={{ duration: 0.15, ease: 'easeOut' }}
                     className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-xl border border-border bg-popover/95 backdrop-blur-xl shadow-lg z-50 overflow-hidden"
                  >
                     <div className="max-h-56 overflow-y-auto space-y-0.5">
                        {workspaces.map((workspace) => {
                           const isSelected = workspace.id === activeId;
                           return (
                              <button
                                 key={workspace.id}
                                 onClick={() => handleSwitch(workspace.id)}
                                 className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                                    isSelected
                                       ? 'bg-primary/10 text-primary font-bold shadow-xs'
                                       : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 font-medium'
                                 }`}
                              >
                                 <div className="flex items-center gap-2 truncate">
                                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${isSelected ? 'bg-primary' : 'bg-transparent'}`} />
                                    <span className="truncate">{workspace.name}</span>
                                 </div>
                                 {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                              </button>
                           );
                        })}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </>
   );
}
