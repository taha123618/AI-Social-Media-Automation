import { ContentCard, AutomationCard, GrowthMetricsCard, AdRecommendationsCard } from './_components';
import { EnhancedDashboardHeader } from './_components/enhanced-header';
import {
   Brain,
   FileText,
   Search,
   TrendingUp,
   Users,
   Zap,
   Activity,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardNewContentButton, DashboardQuickActions, DashboardEmptyState, DashboardSearch } from './DashboardClient';
import AiGenerator from './_components/ai-generator';
import { headers } from 'next/headers';

import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';
import { AnimatePresence } from 'framer-motion';

interface DashboardPageProps {
   searchParams: Promise<{ search?: string; businessId?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
   const resolvedParams = await searchParams;
   const search = resolvedParams.search || '';

   // Prioritize searchParams, then fallback to active workspace cookie
   const businessId = resolvedParams.businessId || await getActiveWorkspaceId() || '';

   const res = await fetch(`${process.env.APP_URL}/api/dashboard?search=${encodeURIComponent(search)}${businessId ? `&businessId=${businessId}` : ''}`, {
      headers: await headers(),
      cache: 'no-store'
   });
   const dashboardData = await res.json();
   const drafts = dashboardData?.drafts || [];
   const recentAutomations = dashboardData?.recentAutomations || [];
   const growthData = dashboardData?.growth || null;
   const adRecommendations = dashboardData?.adRecommendations || [];

   return (
      <div className="relative min-h-screen">
         <main className="mx-auto max-w-7xl">

            <EnhancedDashboardHeader />

            {/* Search + Create Section */}
            <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-center md:justify-between pt-8">
               <DashboardSearch />

               <DashboardNewContentButton />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 items-start">

               {/* Recent Content */}
               <div className="lg:col-span-2 relative">
                  <div className="mb-10 flex items-center justify-between">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <div className="h-2 w-2 rounded-full bg-blue-600" />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Library</p>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                           Recent Drafts
                        </h3>
                     </div>
                     <Link
                        href="/contents"
                        className="group flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 px-5 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 transition-all hover:scale-105 active:scale-95"
                     >
                        View Library
                        <span className="transition-transform group-hover:translate-x-1 font-bold">→</span>
                     </Link>
                  </div>

                  <div className="space-y-6">
                     <AnimatePresence>
                     {drafts.length > 0 ? (
                        drafts.map((content: any, idx: number) => (
                           <ContentCard
                              key={content.id || idx}
                              index={idx}
                              title={content.title}
                              status={content.status}
                              date={content.date}
                              platforms={content.platforms}
                              author={content.author}
                           />
                        ))
                     ) : (
                           <DashboardEmptyState />
                     )}
                     </AnimatePresence>
                  </div>
               </div>

               {/* Quick Actions & AI Promo */}
               <div className="space-y-10 lg:sticky lg:top-24">
                  {/* Recent Automations */}
                  <div className="relative">
                     <div className="mb-8 items-center flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                           Recent Automations
                        </h3>
                     </div>

                     <div className="space-y-4">
                        {recentAutomations.length > 0 ? (
                           recentAutomations.map((automation: any, idx: number) => (
                              <AutomationCard
                                 key={automation.id}
                                 index={idx}
                                 workflowName={automation.workflowName}
                                 status={automation.status}
                                 startedAt={automation.startedAt}
                                 completedAt={automation.completedAt}
                              />
                           ))
                        ) : (
                           <p className="text-sm font-bold text-slate-400 dark:text-slate-500 italic pl-2">
                              No recent automation runs
                           </p>
                        )}
                     </div>
                  </div>

                  {/* Shortcuts */}
                  <div className="relative pt-4">
                     <div className="mb-8 items-center flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-600" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                           Shortcuts
                        </h3>
                     </div>

                     <div className="space-y-4">
                        <DashboardQuickActions />
                     </div>
                  </div>

                  <AiGenerator />
               </div>
            </div>

            {/* Growth & Ads Section */}
            <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 pb-24">
               <GrowthMetricsCard data={growthData} />
               <AdRecommendationsCard recommendations={adRecommendations} />
            </div>

         </main>
      </div>
   );
}
