"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getAdminBillingOverview,
  adminUpdateSubscription,
  adminResetUsage,
  adminRetryWebhook,
} from "../../actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  RefreshCw,
  Search,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
  Layers,
  ArrowUpDown,
  Filter,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminBillingPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "audit" | "webhooks">("subscriptions");

  // Filtering and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states for managing a subscription
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [overridePlan, setOverridePlan] = useState<string>("free");
  const [overrideStatus, setOverrideStatus] = useState<string>("ACTIVE");
  const [extendDays, setExtendDays] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [isResettingUsage, setIsResettingUsage] = useState(false);

  async function fetchBillingData() {
    setIsLoading(true);
    try {
      const res = await getAdminBillingOverview();
      setData(res);
    } catch (error) {
      toast.error("Failed to fetch platform billing data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBillingData();
  }, []);

  const openManageModal = (sub: any) => {
    setSelectedSub(sub);
    setOverridePlan(sub.planId.toLowerCase());
    setOverrideStatus(sub.status);
    setExtendDays(0);
    setOverrideReason("");
  };

  const handleSaveOverride = async () => {
    if (!selectedSub) return;
    setIsSubmittingOverride(true);
    try {
      await adminUpdateSubscription(selectedSub.id, {
        planId: overridePlan,
        status: overrideStatus as any,
        extendDays: extendDays > 0 ? extendDays : undefined,
        reason: overrideReason.trim() || undefined,
      });
      toast.success(`Subscription for ${selectedSub.organizationName} updated to ${overridePlan.toUpperCase()}!`);
      setSelectedSub(null);
      await fetchBillingData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update subscription");
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleResetQuota = async (feature?: string) => {
    if (!selectedSub) return;
    setIsResettingUsage(true);
    try {
      await adminResetUsage(selectedSub.id, feature);
      toast.success("Usage counters reset successfully");
      await fetchBillingData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to reset usage");
    } finally {
      setIsResettingUsage(false);
    }
  };

  const handleRetryWebhook = async (webhookId: string) => {
    try {
      await adminRetryWebhook(webhookId);
      toast.success("Webhook marked as processed");
      await fetchBillingData();
    } catch (error) {
      toast.error("Failed to retry webhook");
    }
  };

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    if (!data?.subscriptions) return [];
    return data.subscriptions.filter((sub: any) => {
      const matchesSearch =
        sub.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.owner?.name && sub.owner.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.owner?.email && sub.owner.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPlan = planFilter === "all" || sub.planId.toLowerCase() === planFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || sub.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [data?.subscriptions, searchQuery, planFilter, statusFilter]);

  const metrics = data?.metrics || {
    mrr: 0,
    arr: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    trialingSubscriptions: 0,
    pausedSubscriptions: 0,
    canceledSubscriptions: 0,
    pastDueSubscriptions: 0,
    planDistribution: { free: 0, starter: 0, pro: 0, enterprise: 0 },
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Billing & Subscriptions Command Center
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base font-medium ml-15">
            Monitor revenue streams, manage plan tiers, inspect webhook logs, and apply manual subscription overrides.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchBillingData}
            className="glass-card hover:bg-muted font-semibold px-6 border-border"
            disabled={isLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4 text-primary", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-border shadow-lg space-y-2 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 text-emerald-500/20">
            <DollarSign className="h-16 w-16" />
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Monthly Recurring Revenue</span>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono text-[10px]">
              Active MRR
            </Badge>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            ${metrics.mrr.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>ARR Run Rate: ${(metrics.arr).toLocaleString()} / yr</span>
          </div>
        </motion.div>

        {/* Active Subscriptions Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-border shadow-lg space-y-2 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 text-primary/20">
            <Users className="h-16 w-16" />
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Total Subscriptions</span>
            <Badge variant="outline" className="font-mono text-[10px]">
              {metrics.activeSubscriptions} Paying
            </Badge>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            {metrics.totalSubscriptions}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>
              {metrics.trialingSubscriptions} Trialing • {metrics.pastDueSubscriptions} Past Due
            </span>
          </div>
        </motion.div>

        {/* Plan Distribution Breakdown Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-border shadow-lg space-y-2 col-span-1 sm:col-span-2 relative"
        >
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Tier Distribution Breakdown</span>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Free</span>
              <span className="text-xl font-extrabold text-foreground font-mono">
                {metrics.planDistribution.free || 0}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span className="text-[10px] font-mono uppercase text-blue-500 block font-bold">Starter</span>
              <span className="text-xl font-extrabold text-blue-500 font-mono">
                {metrics.planDistribution.starter || 0}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <span className="text-[10px] font-mono uppercase text-indigo-500 block font-bold">Pro</span>
              <span className="text-xl font-extrabold text-indigo-500 font-mono">
                {metrics.planDistribution.pro || 0}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
              <span className="text-[10px] font-mono uppercase text-purple-500 block font-bold">Enterprise</span>
              <span className="text-xl font-extrabold text-purple-500 font-mono">
                {metrics.planDistribution.enterprise || 0}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={cn(
            "px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "subscriptions"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <CreditCard className="h-4 w-4" />
          <span>Subscription Directory</span>
          <Badge variant="secondary" className="ml-1 text-[10px] font-mono">
            {filteredSubscriptions.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={cn(
            "px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "audit"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <History className="h-4 w-4" />
          <span>Audit Overrides Trail</span>
          <Badge variant="secondary" className="ml-1 text-[10px] font-mono">
            {data?.auditLogs?.length || 0}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("webhooks")}
          className={cn(
            "px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "webhooks"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Activity className="h-4 w-4" />
          <span>Gateway Webhooks</span>
          <Badge variant="secondary" className="ml-1 text-[10px] font-mono">
            {data?.webhooks?.length || 0}
          </Badge>
        </button>
      </div>

      {/* TAB 1: SUBSCRIPTION DIRECTORY */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/30 p-4 rounded-2xl border border-border">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, email, organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-background border-border text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Plan Filters */}
              <div className="flex items-center bg-background rounded-xl p-1 border border-border">
                {["all", "free", "starter", "pro", "enterprise"].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setPlanFilter(plan)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider transition-all",
                      planFilter === plan
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {plan}
                  </button>
                ))}
              </div>

              {/* Status Filters */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="TRIALING">TRIALING</option>
                <option value="PAUSED">PAUSED</option>
                <option value="CANCELED">CANCELED</option>
                <option value="PAST_DUE">PAST_DUE</option>
              </select>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="rounded-3xl border border-border bg-card/30 backdrop-blur-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6">Workspace & Owner</th>
                    <th className="py-4 px-4">Plan Tier</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Monthly Rate</th>
                    <th className="py-4 px-4">Feature Limits</th>
                    <th className="py-4 px-4">Renewal Window</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        No subscription instances match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((sub: any) => {
                      const planKey = sub.planId.toLowerCase();
                      const getBadgeColor = () => {
                        switch (planKey) {
                          case "enterprise":
                            return "bg-purple-500/10 text-purple-500 border-purple-500/20";
                          case "pro":
                            return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
                          case "starter":
                            return "bg-blue-500/10 text-blue-500 border-blue-500/20";
                          default:
                            return "bg-muted text-muted-foreground border-border";
                        }
                      };

                      const aiPostUsage = sub.usage?.find((u: any) => u.feature === "AI_POSTS");
                      const aiArticleUsage = sub.usage?.find((u: any) => u.feature === "AI_BLOG_ARTICLES");

                      return (
                        <tr key={sub.id} className="hover:bg-muted/20 transition-all">
                          {/* Workspace / Owner */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shadow-sm">
                                {sub.organizationName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground">{sub.organizationName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {sub.owner?.name || "Unassigned"} ({sub.owner?.email || "No email"})
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="py-4 px-4">
                            <Badge
                              variant="outline"
                              className={cn("font-mono font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-lg border", getBadgeColor())}
                            >
                              {planKey}
                            </Badge>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <Badge
                              variant={sub.status === "ACTIVE" ? "default" : "destructive"}
                              className="font-mono text-[10px] uppercase font-bold"
                            >
                              {sub.status}
                            </Badge>
                          </td>

                          {/* Price */}
                          <td className="py-4 px-4 font-mono font-bold text-foreground">
                            ${sub.price} <span className="text-[10px] text-muted-foreground font-normal">/ mo</span>
                          </td>

                          {/* Feature Usage Overview */}
                          <td className="py-4 px-4 text-xs font-mono space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <span className="font-bold text-foreground">{aiPostUsage ? aiPostUsage.used : 0}</span> /{" "}
                              <span>{aiPostUsage ? (aiPostUsage.limit === -1 ? "∞" : aiPostUsage.limit) : "5"} Posts</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                              <span className="font-bold text-foreground">{aiArticleUsage ? aiArticleUsage.used : 0}</span> /{" "}
                              <span>{aiArticleUsage ? (aiArticleUsage.limit === -1 ? "∞" : aiArticleUsage.limit) : "20"} Articles</span>
                            </div>
                          </td>

                          {/* Renewal Date */}
                          <td className="py-4 px-4 text-xs text-muted-foreground font-mono">
                            {sub.currentPeriodEnd ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                <span>{format(new Date(sub.currentPeriodEnd), "MMM dd, yyyy")}</span>
                              </div>
                            ) : (
                              "Continuous"
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-4 px-6 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openManageModal(sub)}
                              className="h-8 px-3 text-xs font-bold rounded-xl border-border hover:bg-primary hover:text-primary-foreground transition-all gap-1.5"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Manage Override</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT OVERRIDES TRAIL */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-border shadow-lg">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Administrative Billing Override Log
            </h2>
            <div className="space-y-3">
              {data?.auditLogs && data.auditLogs.length > 0 ? (
                data.auditLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-secondary/30 border border-border/50 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold text-primary">
                          {log.action}
                        </Badge>
                        <span className="font-bold text-foreground">
                          {log.details?.organizationName || log.resource}
                        </span>
                        {log.details?.newPlan && (
                          <Badge className="bg-primary/20 text-primary border-0 font-mono text-[10px]">
                            {(log.details.previousPlan || "free").toUpperCase()} → {log.details.newPlan.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      {log.details?.reason && (
                        <p className="text-muted-foreground italic font-mono text-[11px]">
                          Reason: &quot;{log.details.reason}&quot;
                        </p>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono text-right">
                      <div>by {log.details?.adminEmail || "Super Admin"}</div>
                      <div>{format(new Date(log.createdAt), "MMM dd, yyyy • HH:mm")}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">No billing audit overrides on record.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GATEWAY WEBHOOKS */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-border shadow-lg">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Payment Gateway Webhooks Log
            </h2>
            <div className="space-y-3">
              {data?.webhooks && data.webhooks.length > 0 ? (
                data.webhooks.map((hook: any) => (
                  <div
                    key={hook.id}
                    className="p-4 rounded-2xl bg-secondary/30 border border-border/50 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={hook.processed ? "default" : "destructive"}
                          className="font-mono text-[10px] uppercase font-bold"
                        >
                          {hook.processed ? "PROCESSED" : "FAILED"}
                        </Badge>
                        <span className="font-mono font-bold text-foreground">{hook.eventType}</span>
                        <span className="text-muted-foreground font-mono text-[10px]">[{hook.provider}]</span>
                      </div>
                      <div className="text-muted-foreground font-mono text-[11px]">
                        Event ID: {hook.eventId}
                      </div>
                      {hook.error && (
                        <p className="text-destructive font-mono text-[11px]">Error: {hook.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[11px] text-muted-foreground font-mono text-right">
                        <div>{format(new Date(hook.createdAt), "MMM dd, yyyy • HH:mm")}</div>
                        <div>Retries: {hook.retryCount}</div>
                      </div>
                      {!hook.processed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryWebhook(hook.id)}
                          className="h-8 px-3 text-xs font-bold"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No incoming webhook events detected yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Override Modal */}
      <Dialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <DialogContent className="sm:max-w-lg glass-card border-border rounded-3xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Manage Subscription Override
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Directly reconfigure tier status, extend billing dates, and reset quotas for{" "}
              <span className="font-bold text-foreground">{selectedSub?.organizationName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Plan Tier
                </Label>
                <select
                  value={overridePlan}
                  onChange={(e) => setOverridePlan(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="free">Free Tier</option>
                  <option value="starter">Starter Plan ($29/mo)</option>
                  <option value="pro">Pro Plan ($99/mo)</option>
                  <option value="enterprise">Enterprise Plan ($299/mo)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Billing Status
                </Label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="TRIALING">TRIALING</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="CANCELED">CANCELED</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Extend Access Period (Days)
              </Label>
              <div className="flex items-center gap-2">
                {[0, 7, 14, 30, 90].map((days) => (
                  <Button
                    key={days}
                    type="button"
                    variant={extendDays === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExtendDays(days)}
                    className="h-8 text-xs font-mono font-bold rounded-lg flex-1"
                  >
                    {days === 0 ? "Default" : `+${days}d`}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Audit Reason / Reference
              </Label>
              <Input
                placeholder="e.g. VIP comped / Partner trial agreement / Sales exception"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="h-10 rounded-xl bg-card border-border text-xs"
              />
            </div>

            {/* Quota Reset Action Button */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground block">Usage Quotas</span>
                <span className="text-[10px] text-muted-foreground">Reset current period usage counters to 0</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isResettingUsage}
                onClick={() => handleResetQuota()}
                className="h-8 text-xs font-bold rounded-xl border-border text-primary hover:bg-primary/10 gap-1"
              >
                <RotateCcw className={cn("h-3.5 w-3.5", isResettingUsage && "animate-spin")} />
                <span>Reset All Quotas</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedSub(null)}
              className="h-10 px-5 text-xs font-bold rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmittingOverride}
              onClick={handleSaveOverride}
              className="h-10 px-6 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-1.5"
            >
              {isSubmittingOverride ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>Commit & Propagate</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
