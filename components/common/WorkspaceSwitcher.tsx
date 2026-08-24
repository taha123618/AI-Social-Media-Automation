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

export function WorkspaceSwitcher() {
   const [isOpen, setIsOpen] = useState(false);
   const [isSwitching, setIsSwitching] = useState(false);
   const [isPending, startTransition] = useTransition();
   const dropdownRef = useRef<HTMLDivElement>(null);
   const router = useRouter();
   const pathname = usePathname();
   const queryClient = useQueryClient();

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
   const isLoading = isLoadingWorkspaces;

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
         <div className="w-full h-14 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 animate-pulse flex items-center px-4 mb-4">
            <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 mr-3" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
         </div>
      );
   }

   if (workspaces.length === 0) return null;

   return (
      <>
         {/* Global Switching Overlay */}
         {document.body && createPortal(
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
                        <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while we load the data for your selected workspace.</p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>,
            document.body
         )}

         <div className="relative mb-6 z-50 px-3" ref={dropdownRef}>
            <button
               onClick={() => setIsOpen(!isOpen)}
               disabled={isSwitching}
               className="w-full h-14 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 group shadow-xs"
            >
               <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                     <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-start truncate text-left">
                     <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workspace</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                        {activeWorkspace?.name || 'Select Workspace'}
                     </span>
                  </div>
               </div>
               {isSwitching ? (
                  <Loader2 className="h-4 w-4 text-slate-400 animate-spin shrink-0" />
               ) : (
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
               )}
            </button>

            <AnimatePresence>
               {isOpen && (
                  <motion.div
                     initial={{ opacity: 0, y: -10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
                     transition={{ duration: 0.15 }}
                     className="absolute top-full left-3 right-3 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden py-2"
                  >
                     <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                        {workspaces?.map((workspace) => (
                           <button
                              key={workspace.id}
                              onClick={() => handleSwitch(workspace.id)}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                           >
                              <div className="flex items-center gap-3 truncate">
                                 <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold uppercase">{workspace.name.substring(0, 2)}</span>
                                 </div>
                                 <span className={`text-sm truncate max-w-[130px] ${activeId === workspace.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                    {workspace.name}
                                 </span>
                              </div>
                              {activeId === workspace.id && (
                                 <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                              )}
                           </button>
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </>
   );
}
