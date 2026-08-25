'use client';

import { useState, useRef, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Building2, Check, ChevronDown, Loader2 } from 'lucide-react';
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
      staleTime: 5 * 60 * 1000
   });

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
            className="w-full h-10 rounded-none bg-card border border-border flex items-center px-3 mb-2"
         >
            <div className="h-4 w-4 rounded-none bg-secondary mr-2.5" />
            <div className="h-3 w-20 bg-secondary rounded-none" />
         </div>
      );
   }

   if (workspaces.length === 0) return null;

   return (
      <>
         {/* Tactical Switching Overlay */}
         {hasHydrated && typeof document !== 'undefined' && document.body && (isSwitching || isPending) && createPortal(
            <div
               className="fixed inset-0 z-[9999] bg-black/80 flex flex-col items-center justify-center p-4"
               style={{ position: 'fixed', inset: 0 }}
            >
               <div className="bg-card p-6 rounded-none shadow-none flex flex-col items-center border border-border max-w-sm w-full text-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-none border border-primary flex items-center justify-center mb-4">
                     <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground mb-1">
                     SWITCHING OPERATIONAL CONSOLE
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                     Synchronizing workspace telemetry and pipeline state...
                  </p>
                  <div className="w-full bg-secondary h-1.5 rounded-none overflow-hidden border border-border">
                     <div className="bg-primary h-full w-full animate-pulse" />
                  </div>
               </div>
            </div>,
            document.body
         )}

         <div className="relative w-full mb-2" ref={dropdownRef}>
            <button
               onClick={() => setIsOpen(!isOpen)}
               disabled={isSwitching || isPending}
               className="w-full flex items-center justify-between p-2.5 rounded-none border border-border bg-card hover:border-primary/50 text-left transition-none"
            >
               <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-7 w-7 rounded-none bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
                     <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate">
                     <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">WORKSPACE</p>
                     <p className="text-xs font-bold text-foreground truncate font-mono">
                        {activeWorkspace?.name || 'Select Workspace'}
                     </p>
                  </div>
               </div>
               <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-none shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {isOpen && (
               <div
                  className="absolute top-full left-0 right-0 mt-1 p-1 rounded-none border border-border bg-popover shadow-none z-50 overflow-hidden"
               >
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                     {workspaces.map((workspace) => {
                        const isSelected = workspace.id === activeId;
                        return (
                           <button
                              key={workspace.id}
                              onClick={() => handleSwitch(workspace.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-none text-left text-xs transition-none font-mono ${
                                 isSelected
                                    ? 'bg-primary text-primary-foreground font-bold'
                                    : 'text-foreground hover:bg-secondary'
                              }`}
                           >
                              <span className="truncate">{workspace.name}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground shrink-0" />}
                           </button>
                        );
                     })}
                  </div>
               </div>
            )}
         </div>
      </>
   );
}
