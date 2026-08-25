import { ContentCard, GrowthMetricsCard, AdRecommendationsCard } from './_components';
import { EnhancedDashboardHeader } from './_components/enhanced-header';
import {
   Sparkles,
   CheckCircle2,
   ArrowRight,
   Layers,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardNewContentButton, DashboardEmptyState, DashboardSearch } from './DashboardClient';
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
               <div className="mb-8 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-3 mb-4">
                     <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase font-mono">
                           {subscriptionDetails.plan.name.charAt(0)}
                        </span>
                        <div>
                           <h4 className="text-xs font-bold text-foreground">
                              {subscriptionDetails.plan.name} Plan Quotas
                           </h4>
                           <p className="text-[11px] text-muted-foreground">
                              Active billing period resets on {new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}
                           </p>
                        </div>
                     </div>
                     <Link
                        href="/settings/billing"
                        className="text-xs font-semibold text-primary hover:underline"
                     >
                        Manage Subscription →
                     </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                     <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                           <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                                 <Sparkles className="h-4 w-4" />
                              </div>
                              <div>
                                 <h5 className="text-xs font-bold text-foreground">
                                    Free Plan Limit Reached
                                 </h5>
                                 <p className="text-[11px] text-muted-foreground mt-0.5">
                                    You have used up your free monthly generation quota. Upgrade to unlock 10x higher throughput and automated scheduling.
                                 </p>
                              </div>
                           </div>
                           <Link
                              href="/settings/billing"
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all whitespace-nowrap"
                           >
                              Upgrade Plan <ArrowRight className="h-3.5 w-3.5" />
                           </Link>
                        </div>

                        {/* Quick Plan Highlights */}
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2.5 border-t border-amber-500/20">
                           <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span><strong className="text-foreground">Starter ($29/mo)</strong>: 50 Posts, 100 Articles (8k words)</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span><strong className="text-foreground">Pro ($99/mo)</strong>: Unlimited Posts & Articles, Swarm Fleet</span>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* Search + Create Section */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
               <DashboardSearch />
               <DashboardNewContentButton />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">

               {/* Recent Content */}
               <div className="lg:col-span-2 relative">
                  <div className="mb-5 flex items-center justify-between pb-3 border-b border-border/70">
                     <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <h3 className="text-base font-bold text-foreground">
                           Recent Drafts & Publications
                        </h3>
                     </div>
                     <Link
                        href="/contents"
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                     >
                        <span>View All Library</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                  </div>

                  <div className="space-y-4">
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
               <div className="space-y-6">
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
