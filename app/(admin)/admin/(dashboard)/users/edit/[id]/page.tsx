"use client";

import { useEffect, useState } from "react";
import { UserForm } from "../../../../_components/forms/user-form";
import {
  updateUser,
  getUserBillingDetails,
  updateUserBillingPlan,
} from "../../../../actions/admin.actions";
import {
  Users,
  ChevronLeft,
  Loader2,
  CreditCard,
  Sparkles,
  ShieldCheck,
  History,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { PLANS } from "@/features/billing/config/plans.config";

export default function EditUserPage() {
  const params = useParams();
  const id = params.id as string;
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for billing override
  const [selectedPlan, setSelectedPlan] = useState<string>("free");
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVE");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  async function fetchBillingData() {
    try {
      const data = await getUserBillingDetails(id);
      setBillingData(data);
      if (data.subscription?.planId) {
        setSelectedPlan(data.subscription.planId.toLowerCase());
      }
      if (data.subscription?.status) {
        setSelectedStatus(data.subscription.status);
      }
    } catch (error) {
      toast.error("Failed to fetch user billing metadata");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBillingData();
  }, [id]);

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlan(true);

    try {
      await updateUserBillingPlan(id, {
        planId: selectedPlan,
        status: selectedStatus as any,
        reason: overrideReason.trim() || undefined,
      });

      toast.success(`Plan updated to ${selectedPlan.toUpperCase()} successfully!`);
      setOverrideReason("");
      await fetchBillingData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update plan");
    } finally {
      setIsSavingPlan(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!billingData || !billingData.user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <Button asChild variant="link" className="mt-4">
          <Link href="/admin/users">Return to Registry</Link>
        </Button>
      </div>
    );
  }

  const user = billingData.user;
  const subscription = billingData.subscription;
  const organization = billingData.organization;
  const currentPlanKey = (subscription?.planId || "free").toLowerCase();
  const currentPlanDef = (PLANS as any)[currentPlanKey] || PLANS.free;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" className="hover:bg-accent -ml-4 mb-2 text-muted-foreground">
            <Link href="/admin/users">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Registry
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Reconfigure Identity & Entitlements
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage user profile credentials and manual billing tier overrides.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription & Plan Override Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card premium-border p-6 sm:p-8 rounded-3xl bg-card/40 backdrop-blur-xl shadow-xl space-y-6 border border-border/80"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Subscription & Plan Entitlements
                <Badge variant="outline" className="font-mono text-[10px] uppercase border-primary/30 text-primary">
                  {currentPlanKey}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Manually grant or revoke tier access without executing payment gateways.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Status:</span>
            <Badge
              variant={subscription?.status === "ACTIVE" ? "default" : "destructive"}
              className="font-mono text-xs uppercase font-bold"
            >
              {subscription?.status || "ACTIVE"}
            </Badge>
          </div>
        </div>

        {/* Current Entitlements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/30 p-4 rounded-2xl border border-border/60">
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">Active Workspace</span>
            <span className="text-xs font-bold text-foreground truncate block">
              {organization?.name || "Default Organization"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">Monthly AI Posts</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {currentPlanDef.features.ai_posts === -1 ? "Unlimited" : currentPlanDef.features.ai_posts}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">AI Articles</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {currentPlanDef.features.ai_articles === -1 ? "Unlimited" : currentPlanDef.features.ai_articles}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">Team Seats</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {currentPlanDef.features.team_collaboration ? "Enabled" : "1 Seat"}
            </span>
          </div>
        </div>

        {/* Manual Plan Override Form */}
        <form onSubmit={handleUpdatePlan} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="planSelect" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Override Plan Tier
              </Label>
              <select
                id="planSelect"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="free">Free Tier (5 posts, 20 articles)</option>
                <option value="starter">Starter Plan (50 posts, 100 articles)</option>
                <option value="pro">Pro Plan (Unlimited posts & articles, Team seats)</option>
                <option value="enterprise">Enterprise Plan (Dedicated custom limits & full SLA)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="statusSelect" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Billing Status
              </Label>
              <select
                id="statusSelect"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="ACTIVE">ACTIVE (Full live access)</option>
                <option value="TRIALING">TRIALING (Trial access)</option>
                <option value="PAUSED">PAUSED (Temporarily suspended)</option>
                <option value="CANCELED">CANCELED (Revoked access)</option>
                <option value="PAST_DUE">PAST_DUE (Payment warning)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reasonInput" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Audit Note / Reason
            </Label>
            <Input
              id="reasonInput"
              placeholder="e.g. VIP comped access / Manual trial extension / Enterprise partner agreement"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="h-11 rounded-xl bg-card border-border text-sm"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSavingPlan}
              className="h-10 px-6 font-bold text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
            >
              {isSavingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>Save & Propagate Plan Changes</span>
            </Button>
          </div>
        </form>

        {/* Audit Log History */}
        {billingData.auditLogs && billingData.auditLogs.length > 0 && (
          <div className="pt-4 border-t border-border/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <History className="h-3.5 w-3.5" />
              <span>Subscription Audit Trail</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {billingData.auditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-secondary/30 border border-border/50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                >
                  <div>
                    <span className="font-semibold text-foreground">
                      Updated to {(log.details?.newPlan || "FREE").toUpperCase()} ({log.details?.newStatus || "ACTIVE"})
                    </span>
                    {log.details?.reason && (
                      <span className="text-muted-foreground ml-2 italic font-mono text-[11px]">
                        — &quot;{log.details.reason}&quot;
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    by {log.details?.adminEmail || "Admin"} on{" "}
                    {new Date(log.createdAt).toLocaleDateString()}{" "}
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Identity Configuration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card premium-border p-6 sm:p-8 rounded-3xl bg-card/20 backdrop-blur-xl shadow-2xl space-y-6"
      >
        <div>
          <h2 className="text-xl font-bold text-foreground">Identity Protocol Overrides</h2>
          <p className="text-muted-foreground font-medium">
            Modify existing credentials or update personal identifiers for{" "}
            <span className="text-foreground font-bold">{user.name}</span>.
          </p>
        </div>
        <UserForm
          initialData={{
            name: user.name,
            email: user.email,
          }}
          onSubmit={(data) => updateUser(id, data)}
        />
      </motion.div>
    </div>
  );
}
