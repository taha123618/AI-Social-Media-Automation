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
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border/70 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle Navigation"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        <div className="hidden sm:block">
          <WorkspaceSwitcher />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="sm:hidden">
          <WorkspaceSwitcher />
        </div>
        <ModeToggle />
        <div className="h-6 w-px bg-border/80 mx-1 hidden sm:block" />
        <UserProfile />
      </div>
    </header>
  );
};

export default TopHeader;
