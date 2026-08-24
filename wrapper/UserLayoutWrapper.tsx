'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Settings, Brain, BarChart3, FileText, Calendar, Users, Play, Building, Images, BookOpenCheck, MessageSquare, Globe, TrendingUp, Target, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Logout from '@/components/user/common/logout';
import AppLogo from '@/components/common/AppLogo';
import TopHeader from '@/components/user/common/TopHeader';
import { GlobalModals } from '@/components/common/GlobalModals';
import QueryProvider from '@/app/providers/query-provider';

// Type definitions with better organization
type NavItem = {
   readonly label: string;
   readonly href: string;
   readonly icon: React.ReactNode;
   readonly badge?: string;
};

interface UserLayoutWrapperProps {
   readonly children: React.ReactNode;
}

// Constants with better naming and structure
const NAVIGATION_ITEMS: readonly NavItem[] = [
   { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="h-5 w-5" /> },
   { label: 'Analytics', href: '/analytics', icon: <BarChart3 className="h-5 w-5" />, badge: 'New' },
   { label: 'AI Blog Writer', href: '/blog', icon: <FileText className="h-5 w-5" />, badge: 'AI' },
   { label: 'Knowledge', href: '/knowledge', icon: <FileText className="h-5 w-5" /> },
   { label: 'Contents', href: '/contents', icon: <FileText className="h-5 w-5" /> },
   { label: 'Videos', href: '/videos', icon: <Play className="h-5 w-5" /> },
   { label: 'Images', href: '/image', icon: <Images className="h-5 w-5" /> },
   { label: 'Gallery', href: '/gallery', icon: <Images className="h-5 w-5" /> },
   { label: 'Workflows', href: '/workflows', icon: <Brain className="h-5 w-5" /> },
   { label: 'Competitors', href: '/competitors', icon: <Target className="h-5 w-5" />, badge: 'AI' },
   { label: 'Local Trends', href: '/trends', icon: <TrendingUp className="h-5 w-5" />, badge: 'AI' },
   { label: 'Ad Campaigns', href: '/ad-campaigns', icon: <Megaphone className="h-5 w-5" />, badge: 'AI' },
   { label: 'Engagement', href: '/engagement', icon: <MessageSquare className="h-5 w-5" />, badge: 'AI' },
   { label: 'Multi-Location', href: '/multi-location', icon: <Globe className="h-5 w-5" />, badge: 'Pro' },
   { label: 'Calendar', href: '/schedule', icon: <Calendar className="h-5 w-5" /> },
   { label: 'Post Schedule', href: '/post-schedule', icon: <Calendar className="h-5 w-5" /> },
   { label: 'Posts', href: '/posts', icon: <FileText className="h-5 w-5" /> },
   { label: 'Social Accounts', href: '/social/accounts', icon: <Building className="h-5 w-5" /> },
   { label: 'Reviews', href: '/reviews', icon: <BookOpenCheck className="h-5 w-5" /> },
   { label: 'Team', href: '/team', icon: <Users className="h-5 w-5" /> }
] as const;

// Custom hooks for better separation of concerns
const useNavigationState = () => {
   const pathname = usePathname();

   const isActiveRoute = useCallback((href: string) => {
      return pathname.startsWith(href);
   }, [pathname]);

   return { isActiveRoute };
};

// Memoized navigation item component
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
         className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
         onClick={onItemClick}
         aria-current={isActive ? 'page' : undefined}
      >
         {isActive && (
            <motion.div
               layoutId="active-nav-bg"
               className="absolute inset-0 bg-linear-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl -z-10 border border-blue-100/50 dark:border-blue-500/20 shadow-sm"
               initial={false}
               transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
         )}

         <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive
            ? 'bg-linear-to-r from-blue-600/10 to-indigo-600/10 shadow-inner'
            : 'group-hover:bg-linear-to-r group-hover:from-blue-50 group-hover:to-indigo-50 dark:group-hover:from-blue-900/20 dark:group-hover:to-indigo-900/20'
            }`}>
            {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
               className: `h-5 w-5 transition-all duration-300 ${isActive ? 'stroke-[2.5px] text-blue-600 dark:text-blue-400' : 'stroke-[2px]'
                  }`
            })}
         </div>

         <div className="flex items-center gap-2 flex-1">
            <span className={`text-sm tracking-tight transition-all duration-300 ${isActive ? 'font-black text-blue-600 dark:text-blue-400' : 'font-semibold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
               }`}>
               {item.label}
            </span>
            {item.badge && (
               <span className="px-2 py-0.5 text-xs font-medium bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-sm">
                  {item.badge}
               </span>
            )}
         </div>

         {isActive && (
            <motion.div
               layoutId="active-nav-indicator"
               className="absolute right-2 h-1.5 w-1.5 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 shadow-lg shadow-blue-500/50"
               transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
         )}
      </Link>
   );
});

NavigationItem.displayName = 'NavigationItem';

const UserLayoutWrapper: React.FC<UserLayoutWrapperProps> = React.memo(({ children }) => {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const { isActiveRoute } = useNavigationState();

   // Memoized callbacks for better performance
   const handleSidebarClose = useCallback(() => {
      setSidebarOpen(false);
   }, []);

   const handleSidebarToggle = useCallback(() => {
      setSidebarOpen(prev => !prev);
   }, []);

   // Memoized navigation items for better performance
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
         <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased overflow-hidden">
         {/* Background Decoration */}
         <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-600/5" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px] dark:bg-purple-600/5" />
         </div>

         {/* Mobile Overlay */}
         <AnimatePresence>
            {sidebarOpen && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
                  onClick={() => setSidebarOpen(false)}
               />
            )}
         </AnimatePresence>

         {/* Sidebar */}
         <aside
            className={`fixed left-0 top-0 h-screen w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 z-50 flex flex-col ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
               }`}
         >
            <div className="p-2">
               <AppLogo />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 pt-2 pb-6 space-y-1.5 overflow-y-auto custom-scrollbar" role="navigation" aria-label="Main navigation">
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
            <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
               <NavigationItem
                  item={{
                     label: 'Settings',
                     href: '/settings',
                     icon: <Settings className="h-5 w-5" />
                  }}
                  isActive={isSettingsActive}
                  onItemClick={handleSidebarClose}
               />
               <Logout />
            </div>
         </aside>

         {/* Main Content */}
         <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
            <TopHeader sidebarOpen={sidebarOpen} setSidebarOpen={handleSidebarToggle} />

            {/* Page Content */}
            <main className="flex-1 overflow-auto bg-transparent relative">
               <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
               <div className="relative p-6 md:p-8">
                  {children}
               </div>
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