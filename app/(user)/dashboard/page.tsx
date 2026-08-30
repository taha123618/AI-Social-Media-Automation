import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CreditCard,
  HelpCircle,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  FileText,
  Workflow,
  Layers,
  Zap,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getActiveWorkspaceId } from "@/app/(user)/actions/workspace";
import { BillingService } from "@/features/billing/services/billing.service";
import { UsageLimitIndicator } from "@/components/billing/UsageLimitIndicator";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ businessId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const businessId =
    resolvedParams?.businessId || (await getActiveWorkspaceId()) || "";

  let user = null;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    user = session?.user || null;
  } catch (err) {
    // Guest fallback
  }

  // Fetch user-scoped metrics and activity
  let subscriptionDetails = null;
  let totalPostsCount = 0;
  let totalWorkflowsCount = 0;
  let recentDrafts: any[] = [];

  if (businessId) {
    try {
      const [sub, posts, workflows, drafts] = await Promise.all([
        BillingService.getBusinessSubscription(businessId).catch(() => null),
        prisma.post.count({ where: { businessId } }).catch(() => 0),
        prisma.workflow.count({ where: { businessId } }).catch(() => 0),
        prisma.contentDraft.findMany({
          where: { businessId },
          take: 4,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            platforms: true,
          },
        }).catch(() => []),
      ]);

      subscriptionDetails = sub;
      totalPostsCount = posts;
      totalWorkflowsCount = workflows;
      recentDrafts = drafts;
    } catch (err) {
      console.warn("Dashboard data query error:", err);
    }
  }

  const activePlanName = subscriptionDetails?.plan?.name || "Free Starter";
  const isPaidTier = subscriptionDetails?.plan?.id && subscriptionDetails.plan.id !== "free";

  const postsUsage = subscriptionDetails?.usage?.find((u) => u.feature === "ai_posts");
  const articlesUsage = subscriptionDetails?.usage?.find((u) => u.feature === "ai_articles");
  const brandVoiceUsage = subscriptionDetails?.usage?.find((u) => u.feature === "brand_voice_profiles");

  const metrics = [
    {
      title: "Total Activity",
      value: totalPostsCount.toString(),
      icon: Activity,
      description: "AI generated posts & vectors",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Active Subscription",
      value: activePlanName,
      icon: CreditCard,
      description: isPaidTier ? "Automated billing active" : "14-day Pro trial available",
      badge: isPaidTier ? "PRO TIER" : "FREE PLAN",
    },
    {
      title: "Active Workflows",
      value: totalWorkflowsCount.toString(),
      icon: Workflow,
      description: "Autonomous agent pipelines",
      trend: "+4.2%",
      trendUp: true,
    },
    {
      title: "Support & System Status",
      value: "Operational",
      icon: HelpCircle,
      description: "99.9% agent engine uptime",
      badge: "OPTIMAL",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your autonomous AI fleets, content queues, and subscription quota telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/blog">
            <Button size="sm" className="rounded-lg h-9 px-4 text-xs font-semibold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              <span>Generate Article</span>
            </Button>
          </Link>
          <Link href="/workflows">
            <Button variant="outline" size="sm" className="rounded-lg h-9 px-4 text-xs font-semibold">
              <span>View Workflows</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI / Metrics Grid - Exactly matching Admin Panel spacing, tokens & typography */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <Card
              key={i}
              className="rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
                  {metric.value}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                  {metric.trend && (
                    <span className="inline-flex items-center text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      {metric.trend}
                    </span>
                  )}
                  {metric.badge && (
                    <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0.5 rounded-md">
                      {metric.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Limit & Quota Telemetry Section */}
      <Card className="rounded-xl border border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Gauge className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Resource Quota Telemetry
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Live billing cycle capacity and feature consumption meters.
                </CardDescription>
              </div>
            </div>
            <Link href="/settings/billing">
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg">
                Manage Quotas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UsageLimitIndicator
              feature="ai_posts"
              label="Monthly AI Posts"
              used={postsUsage?.used || 0}
              limit={postsUsage?.limit ?? 5}
            />
            <UsageLimitIndicator
              feature="ai_articles"
              label="AI Blog Articles"
              used={articlesUsage?.used || 0}
              limit={articlesUsage?.limit ?? 1}
            />
            <UsageLimitIndicator
              feature="brand_voice_profiles"
              label="Brand Voice Profiles"
              used={brandVoiceUsage?.used || 0}
              limit={brandVoiceUsage?.limit ?? 1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Secondary Grid: AI Content Engine & Activity Feed */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Launch & Content Engine */}
        <Card className="rounded-xl border border-border bg-card shadow-xs lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  AI Content Generation Engine
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Launch autonomous AI agents to produce high-ranking content.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                AGENTIC V2
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/blog"
                className="p-4 rounded-xl border border-border/80 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all block group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-xs font-bold text-foreground mb-1">
                  Long-Form SEO Articles
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Compose Gutenberg-ready blog posts with keyword research and automatic schema markup.
                </p>
              </Link>

              <Link
                href="/workflows"
                className="p-4 rounded-xl border border-border/80 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all block group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Workflow className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <h4 className="text-xs font-bold text-foreground mb-1">
                  Multi-Step Workflows
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automate cross-network scheduling, competitor counter-posting, and engagement.
                </p>
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Scale Your Production Capacity
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Upgrade to Pro for unlimited brand voices and priority background worker queues.
                  </p>
                </div>
              </div>
              <Link href="/settings/billing">
                <Button size="sm" variant="outline" className="text-xs font-semibold rounded-lg shrink-0">
                  Manage Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="rounded-xl border border-border bg-card shadow-xs lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Recent Content Activity
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Latest drafts and pipeline generation events.
                </CardDescription>
              </div>
              <Link
                href="/contents"
                className="text-xs text-primary hover:underline font-semibold"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentDrafts.length > 0 ? (
              <div className="space-y-3">
                {recentDrafts.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-secondary/20"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {act.title || "Untitled AI Draft"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {(act.platforms && act.platforms.length > 0 ? act.platforms.join(", ") : "MULTI-CHANNEL")} &bull; {new Date(act.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                      {act.status || "DRAFT"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground">No recent posts yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Generate your first article or social post to populate this feed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
