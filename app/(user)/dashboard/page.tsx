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
   Sparkles,
   CheckCircle2,
   ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardNewContentButton, DashboardQuickActions, DashboardEmptyState, DashboardSearch } from './DashboardClient';
import AiGenerator from './_components/ai-generator';
import { headers } from 'next/headers';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';
import { AnimatePresence } from 'framer-motion';
import { BillingService } from '@/features/billing/services/billing.service';
import { UsageLimitIndicator } from '@/components/billing/UsageLimitIndicator';

interface DashboardPageProps {
   searchParams: Promise<{ search?: string; businessId?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
   const resolvedParams = await searchParams;
   const search = resolvedParams.search || '';

   // Prioritize searchParams, then fallback to active workspace cookie
   const businessId = resolvedParams.businessId || await getActiveWorkspaceId() || '';

   let subscriptionDetails = null;
   if (businessId) {
      try {
         subscriptionDetails = await BillingService.getBusinessSubscription(businessId);
      } catch (err) {
         console.warn('Could not fetch subscription for dashboard:', err);
      }
   }

   const res = await fetch(`${process.env.APP_URL}/api/dashboard?search=${encodeURIComponent(search)}${businessId ? `&businessId=${businessId}` : ''}`, {
      headers: await headers(),
      cache: 'no-store'
   });
   const dashboardData = await res.json();
   const drafts = dashboardData?.drafts || [];
   const recentAutomations = dashboardData?.recentAutomations || [];
   const growthData = dashboardData?.growth || null;
   const adRecommendations = dashboardData?.adRecommendations || [];

   const postsUsage = subscriptionDetails?.usage.find((u) => u.feature === 'ai_posts');
   const articlesUsage = subscriptionDetails?.usage.find((u) => u.feature === 'ai_articles');
   const brandVoiceUsage = subscriptionDetails?.usage.find((u) => u.feature === 'brand_voice_profiles');

   const isFreePlan = subscriptionDetails?.plan.id === 'free';
   const isQuotaExhausted =
      isFreePlan &&
      ((postsUsage && postsUsage.limit > 0 && postsUsage.used >= postsUsage.limit) ||
       (articlesUsage && articlesUsage.limit > 0 && articlesUsage.used >= articlesUsage.limit) ||
       (brandVoiceUsage && brandVoiceUsage.limit > 0 && brandVoiceUsage.used >= brandVoiceUsage.limit));

   return (
      <div className="relative min-h-screen">
         <main className="mx-auto max-w-7xl">

            <EnhancedDashboardHeader />

            {/* Plan & Usage Summary Bar */}
            {subscriptionDetails && (
               <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white/60 p-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
                     <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                           {subscriptionDetails.plan.name.charAt(0)}
                        </span>
                        <div>
                           <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {subscriptionDetails.plan.name} Plan Quotas
                           </h4>
                           <p className="text-xs text-slate-500 dark:text-slate-400">
                              Active billing period resets on {new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}
                           </p>
                        </div>
                     </div>
                     <Link
                        href="/settings/billing"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                     >
                        Manage Subscription →
                     </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                     {postsUsage && (
                        <UsageLimitIndicator
                           feature="ai_posts"
                           label="Monthly AI Social Posts"
                           used={postsUsage.used}
                           limit={postsUsage.limit}
                        />
                     )}
                     {articlesUsage && (
                        <UsageLimitIndicator
                           feature="ai_articles"
                           label="Monthly AI Blog Articles"
                           used={articlesUsage.used}
                           limit={articlesUsage.limit}
                        />
                     )}
                     {brandVoiceUsage && (
                        <UsageLimitIndicator
                           feature="brand_voice_profiles"
                           label="Brand Voice Profiles"
                           used={brandVoiceUsage.used}
                           limit={brandVoiceUsage.limit}
                        />
                     )}
                  </div>

                  {/* Free Plan Quota Exhaustion -> Paid Plans Upgrade Offer */}
                  {isQuotaExhausted && (
                     <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20 p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                 <Sparkles className="h-5 w-5" />
                              </div>
                              <div>
                                 <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Free Plan Limit Reached
                                 </h5>
                                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                    You have used up your free monthly generation limits. Upgrade to a paid plan to unlock 10x higher limits, scheduled auto-publishing, and AI voice cloning.
                                 </p>
                              </div>
                           </div>
                           <Link
                              href="/settings/billing"
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all whitespace-nowrap"
                           >
                              View Paid Plans <ArrowRight className="h-3.5 w-3.5" />
                           </Link>
                        </div>

                        {/* Quick Plan Highlights */}
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 pt-3 border-t border-amber-200/60 dark:border-amber-900/30">
                           <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                              <span><strong>Starter ($29/mo)</strong>: 50 AI Posts, 100 Articles (8k words), Scheduling</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                              <span><strong>Pro ($99/mo)</strong>: Unlimited Posts & Articles, Team Seats, Full API</span>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}

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

               {/* Automation Status & Analytics */}
               <div className="space-y-12">
                  <AiGenerator />

                  {/* Growth Metrics */}
                  <GrowthMetricsCard data={growthData} />

                  {/* Ad Optimization Recommendations */}
                  <AdRecommendationsCard recommendations={adRecommendations} />
               </div>
            </div>
         </main>
      </div>
   );
}
