'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import { UserProfile } from '@/components/auth/user-profile';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { GlobalModals } from '@/components/common/GlobalModals';
import { WorkspaceSwitcher } from '@/components/common/WorkspaceSwitcher';

interface TopHeaderProps {
   sidebarOpen: boolean;
   setSidebarOpen: (open: boolean) => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
   return (
      <>
         <header className="h-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center">
               <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
               >
                  {sidebarOpen ? (
                     <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  ) : (
                     <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  )}
               </button>
            </div>

            <div className="flex items-center gap-4">
               <div className="pt-6">
                  <WorkspaceSwitcher />
               </div>
               <ModeToggle />
               <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
               <UserProfile />
            </div>
         </header>
         {/* <GlobalModals /> */}
      </>
   );
};

export default TopHeader;
