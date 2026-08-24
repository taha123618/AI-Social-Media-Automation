'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
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
            // Push to current pathname without query params to clear stale businessId etc.
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
            className="w-full h-14 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 animate-pulse flex items-center px-4 mb-4"
         >
            <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 mr-3" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
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
                     className="fixed inset-0 z-[9999] bg-white/40 dark:bg-slate-950/40 flex flex-col items-center justify-center p-4 md:pl-64"
                     style={{ position: 'fixed', inset: 0 }}
                  >
                     <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-200/50 dark:border-slate-800/50 max-w-sm w-full text-center">
                        <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
                           <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Switching Workspace</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                           Preparing your dashboard environment and synchronizing resources...
                        </p>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                           <motion.div
                              className="bg-blue-600 h-full rounded-full"
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

         <div className="relative w-full mb-4" ref={dropdownRef}>
            <button
               onClick={() => setIsOpen(!isOpen)}
               disabled={isSwitching || isPending}
               className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group backdrop-blur-sm shadow-sm"
            >
               <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                     <Building2 className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                     <p className="text-xs text-slate-400 font-medium">Workspace</p>
                     <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {activeWorkspace?.name || 'Select Workspace'}
                     </p>
                  </div>
               </div>
               <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
               {isOpen && (
                  <motion.div
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     transition={{ duration: 0.15, ease: 'easeOut' }}
                     className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
                  >
                     <div className="max-h-60 overflow-y-auto space-y-1">
                        {workspaces.map((workspace) => {
                           const isSelected = workspace.id === activeId;
                           return (
                              <button
                                 key={workspace.id}
                                 onClick={() => handleSwitch(workspace.id)}
                                 className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-sm transition-all ${
                                    isSelected
                                       ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                                       : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 font-medium'
                                 }`}
                              >
                                 <div className="flex items-center gap-2.5 truncate">
                                    <div className={`h-2 w-2 rounded-full ${isSelected ? 'bg-blue-600 dark:bg-blue-400' : 'bg-transparent'}`} />
                                    <span className="truncate">{workspace.name}</span>
                                 </div>
                                 {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />}
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
