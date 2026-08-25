'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import { UserProfile } from '@/components/auth/user-profile';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { WorkspaceSwitcher } from '@/components/common/WorkspaceSwitcher';

interface TopHeaderProps {
   sidebarOpen: boolean;
   setSidebarOpen: (open: boolean) => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
   return (
      <header className="h-14 bg-card border-b border-border px-4 flex items-center justify-between sticky top-0 z-40 transition-none">
         <div className="flex items-center gap-3">
            <button
               onClick={() => setSidebarOpen(!sidebarOpen)}
               className="md:hidden p-1.5 hover:bg-secondary rounded-none border border-border text-foreground transition-none"
            >
               {sidebarOpen ? (
                  <X className="h-4 w-4" />
               ) : (
                  <Menu className="h-4 w-4" />
               )}
            </button>
            <div className="hidden md:flex items-center">
               <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  CONSOLE // <span className="text-primary font-bold">TACTICAL OS</span>
               </span>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <div className="pt-2">
               <WorkspaceSwitcher />
            </div>
            <ModeToggle />
            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            <UserProfile />
         </div>
      </header>
   );
};

export default TopHeader;
