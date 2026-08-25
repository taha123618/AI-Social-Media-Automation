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
import { BillingService } from '@/features/billing/services/billing.service';
import { UsageLimitIndicator } from '@/components/billing/UsageLimitIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
         <main className="mx-auto max-w-7xl space-y-6">

            <EnhancedDashboardHeader />

            {/* Plan & Usage Summary Bar */}
            {subscriptionDetails && (
               <div className="rounded-none border border-border bg-card p-4 shadow-none">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border pb-3 mb-3">
                     <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-none bg-primary text-primary-foreground border border-primary font-mono font-bold text-xs flex items-center justify-center">
                           {subscriptionDetails.plan.name.charAt(0)}
                        </div>
                        <div>
                           <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                              {subscriptionDetails.plan.name} QUOTAS // <span className="text-primary font-normal">TELEMETRY</span>
                           </h4>
                           <p className="text-[10px] font-mono text-muted-foreground">
                              Period resets on {new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}
                           </p>
                        </div>
                     </div>
                     <Link
                        href="/settings/billing"
                        className="text-xs font-mono font-bold uppercase tracking-wider text-primary hover:underline"
                     >
                        MANAGE TIER →
                     </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
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
                     <div className="mt-3 rounded-none border border-primary/50 bg-primary/10 p-3.5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                           <div className="flex items-start gap-2.5">
                              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                 <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                                    FREE PLAN ALLOCATION EXHAUSTED
                                 </h5>
                                 <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                    Monthly limit reached. Upgrade to Starter or Pro for 10x allocations, automated publishing, and voice cloning.
                                 </p>
                              </div>
                           </div>
                           <Link href="/settings/billing">
                              <Button size="sm" className="whitespace-nowrap">
                                 UPGRADE TIER <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                           </Link>
                        </div>

                        {/* Quick Plan Highlights */}
                        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2.5 border-t border-border font-mono text-[11px]">
                           <div className="flex items-center gap-2 text-foreground">
                              <span className="text-primary font-bold">▪</span>
                              <span><strong>Starter ($29/mo)</strong>: 50 AI Posts, 100 Articles, Scheduling</span>
                           </div>
                           <div className="flex items-center gap-2 text-foreground">
                              <span className="text-primary font-bold">▪</span>
                              <span><strong>Pro ($99/mo)</strong>: Unlimited Posts & Articles, Team Seats, Full API</span>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* Search + Create Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
               <DashboardSearch />
               <DashboardNewContentButton />
            </div>

            {/* Main Command Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">

               {/* Recent Content */}
               <div className="lg:col-span-2 relative">
                  <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
                     <div>
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-none bg-primary" />
                           <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">OPERATIONAL REPO</p>
                        </div>
                        <h3 className="text-base font-mono font-bold uppercase tracking-tight text-foreground">
                           Recent Drafts
                        </h3>
                     </div>
                     <Link
                        href="/contents"
                        className="text-xs font-mono font-bold uppercase tracking-wider text-primary hover:underline"
                     >
                        VIEW LIBRARY →
                     </Link>
                  </div>

                  <div className="space-y-3">
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
