'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Settings, Brain, BarChart3, FileText, Calendar, Users, Play, Building, Images, BookOpenCheck, MessageSquare, Globe, TrendingUp, Target, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logout from '@/components/user/common/logout';
import AppLogo from '@/components/common/AppLogo';
import TopHeader from '@/components/user/common/TopHeader';
import { GlobalModals } from '@/components/common/GlobalModals';
import QueryProvider from '@/app/providers/query-provider';

type NavItem = {
   readonly label: string;
   readonly href: string;
   readonly icon: React.ReactNode;
   readonly badge?: string;
};

interface UserLayoutWrapperProps {
   readonly children: React.ReactNode;
}

const NAVIGATION_ITEMS: readonly NavItem[] = [
   { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
   { label: 'Analytics', href: '/analytics', icon: <BarChart3 className="h-4 w-4" />, badge: 'METRICS' },
   { label: 'AI Blog Writer', href: '/blog', icon: <FileText className="h-4 w-4" />, badge: 'AI' },
   { label: 'Knowledge', href: '/knowledge', icon: <FileText className="h-4 w-4" /> },
   { label: 'Contents', href: '/contents', icon: <FileText className="h-4 w-4" /> },
   { label: 'Videos', href: '/videos', icon: <Play className="h-4 w-4" /> },
   { label: 'Images', href: '/image', icon: <Images className="h-4 w-4" /> },
   { label: 'Gallery', href: '/gallery', icon: <Images className="h-4 w-4" /> },
   { label: 'Workflows', href: '/workflows', icon: <Brain className="h-4 w-4" /> },
   { label: 'Competitors', href: '/competitors', icon: <Target className="h-4 w-4" />, badge: 'AI' },
   { label: 'Local Trends', href: '/trends', icon: <TrendingUp className="h-4 w-4" />, badge: 'AI' },
   { label: 'Ad Campaigns', href: '/ad-campaigns', icon: <Megaphone className="h-4 w-4" />, badge: 'AI' },
   { label: 'Engagement', href: '/engagement', icon: <MessageSquare className="h-4 w-4" />, badge: 'AI' },
   { label: 'Multi-Location', href: '/multi-location', icon: <Globe className="h-4 w-4" />, badge: 'PRO' },
   { label: 'Calendar', href: '/schedule', icon: <Calendar className="h-4 w-4" /> },
   { label: 'Post Schedule', href: '/post-schedule', icon: <Calendar className="h-4 w-4" /> },
   { label: 'Posts', href: '/posts', icon: <FileText className="h-4 w-4" /> },
   { label: 'Social Accounts', href: '/social/accounts', icon: <Building className="h-4 w-4" /> },
   { label: 'Reviews', href: '/reviews', icon: <BookOpenCheck className="h-4 w-4" /> },
   { label: 'Team', href: '/team', icon: <Users className="h-4 w-4" /> }
] as const;

const useNavigationState = () => {
   const pathname = usePathname();

   const isActiveRoute = useCallback((href: string) => {
      return pathname.startsWith(href);
   }, [pathname]);

   return { isActiveRoute };
};

const NavigationItem = React.memo(({
   item,
   isActive,
   onItemClick
}: {
   item: NavItem;
   isActive: boolean;
   onItemClick: () => void;
}) => {
   return (
      <Link
         href={item.href}
         className={`group relative flex items-center justify-between px-3 py-2 rounded-none border-l-2 transition-none select-none text-xs font-semibold uppercase tracking-wider ${
            isActive
               ? 'bg-primary/10 border-primary text-primary'
               : 'border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
         }`}
         onClick={onItemClick}
         aria-current={isActive ? 'page' : undefined}
      >
         <div className="flex items-center gap-2.5 truncate">
            <span className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>
               {item.icon}
            </span>
            <span className="truncate font-medium">{item.label}</span>
         </div>

         {item.badge && (
            <span
               className={`px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase rounded-none border ${
                  isActive
                     ? 'bg-primary text-primary-foreground border-primary'
                     : 'bg-secondary text-muted-foreground border-border'
               }`}
            >
               {item.badge}
            </span>
         )}
      </Link>
   );
});

NavigationItem.displayName = 'NavigationItem';

const UserLayoutWrapper: React.FC<UserLayoutWrapperProps> = React.memo(({ children }) => {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const { isActiveRoute } = useNavigationState();

   const handleSidebarClose = useCallback(() => {
      setSidebarOpen(false);
   }, []);

   const handleSidebarToggle = useCallback(() => {
      setSidebarOpen(prev => !prev);
   }, []);

   const navigationItems = useMemo(() =>
      NAVIGATION_ITEMS.map(item => ({
         ...item,
         isActive: isActiveRoute(item.href)
      })),
      [isActiveRoute]
   );

   const isSettingsActive = isActiveRoute('/settings');

   return (
      <QueryProvider>
         <div className="flex h-screen bg-background text-foreground font-sans antialiased overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
               <div
                  className="fixed inset-0 z-40 bg-black/80 md:hidden transition-none"
                  onClick={() => setSidebarOpen(false)}
               />
            )}

            {/* Tactical Command Sidebar */}
            <aside
               className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-border transform transition-none md:relative md:translate-x-0 z-50 flex flex-col ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
               }`}
            >
               <div className="p-3 border-b border-border bg-sidebar">
                  <AppLogo />
               </div>

               {/* Navigation */}
               <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Main navigation">
                  {navigationItems?.map((item) => (
                     <NavigationItem
                        key={item.href}
                        item={item}
                        isActive={item.isActive}
                        onItemClick={handleSidebarClose}
                     />
                  ))}
               </nav>

               {/* Footer */}
               <div className="p-2 border-t border-border bg-sidebar space-y-1">
                  <NavigationItem
                     item={{
                        label: 'Settings',
                        href: '/settings',
                        icon: <Settings className="h-4 w-4" />
                     }}
                     isActive={isSettingsActive}
                     onItemClick={handleSidebarClose}
                  />
                  <div className="pt-1">
                     <Logout />
                  </div>
               </div>
            </aside>

            {/* Main Command Canvas */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden bg-background">
               <TopHeader sidebarOpen={sidebarOpen} setSidebarOpen={handleSidebarToggle} />

               {/* Page Content */}
               <main className="flex-1 overflow-auto bg-background relative p-4 md:p-6">
                  {children}
               </main>
            </div>

            {/* Global Modals */}
            <GlobalModals />
         </div>
      </QueryProvider>
   );
});

UserLayoutWrapper.displayName = 'UserLayoutWrapper';

export default UserLayoutWrapper;