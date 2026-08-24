"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuditLogs } from "@/features/system/hooks/use-system";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Wrench,
  Server,
  ArrowLeft,
  Plus,
  X,
  Clock,
  ShieldCheck,
  Save,
  Loader2,
  Lock,
  Globe,
  Settings,
} from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface MaintenanceConfig {
  isEnabled: boolean;
  message: string;
  estimatedCompletion: string | null;
  allowlistIps: string[];
  allowlistEmails: string[];
  apiBlocked: boolean;
  updatedAt?: string;
  updatedBy?: string | null;
}

const formatForInput = (isoString: string | null) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function MaintenanceAdminPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Local Form States
  const [isEnabled, setIsEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [estimatedCompletion, setEstimatedCompletion] = useState("");
  const [allowlistIps, setAllowlistIps] = useState<string[]>([]);
  const [allowlistEmails, setAllowlistEmails] = useState<string[]>([]);
  const [apiBlocked, setApiBlocked] = useState(true);

  // Allowlist input fields
  const [newIp, setNewIp] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Query configuration
  const { data: config, isLoading } = useQuery<MaintenanceConfig>({
    queryKey: ["admin", "maintenance"],
    queryFn: async () => {
      const res = await fetch("/api/admin/maintenance");
      if (!res.ok) throw new Error("Failed to load maintenance config");
      return res.json();
    },
  });

  // Query audit logs
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({
    page: 1,
    limit: 10,
    action: "MAINTENANCE_MODE_UPDATE",
  });

  // Update states when config loads
  useEffect(() => {
    if (config) {
      setIsEnabled(config.isEnabled);
      setMessage(config.message);
      setEstimatedCompletion(formatForInput(config.estimatedCompletion));
      setAllowlistIps(config.allowlistIps || []);
      setAllowlistEmails(config.allowlistEmails || []);
      setApiBlocked(config.apiBlocked ?? true);
    }
  }, [config]);

  // Update config mutation
  const updateMutation = useMutation({
    mutationFn: async (newConfig: MaintenanceConfig) => {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      if (!res.ok) throw new Error("Failed to save maintenance config");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["system", "audit"] });
      toast.success("Maintenance configuration saved successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save configuration");
    },
  });

  // GSAP Entrance Animations
  useGSAP(() => {
    gsap.from(".maint-header", {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });
    gsap.from(".maint-card", {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      delay: 0.1,
      ease: "power3.out",
    });
  }, { scope: containerRef });

  // Add handlers
  const handleAddIp = () => {
    const trimmed = newIp.trim();
    if (!trimmed) return;
    if (allowlistIps.includes(trimmed)) {
      toast.error("IP is already allowlisted");
      return;
    }
    setAllowlistIps([...allowlistIps, trimmed]);
    setNewIp("");
  };

  const handleAddEmail = () => {
    const trimmed = newEmail.trim();
    if (!trimmed) return;
    if (allowlistEmails.includes(trimmed)) {
      toast.error("Email is already allowlisted");
      return;
    }
    setAllowlistEmails([...allowlistEmails, trimmed]);
    setNewEmail("");
  };

  // Remove handlers
  const handleRemoveIp = (ip: string) => {
    setAllowlistIps(allowlistIps.filter((item) => item !== ip));
  };

  const handleRemoveEmail = (email: string) => {
    setAllowlistEmails(allowlistEmails.filter((item) => item !== email));
  };

  const handleSave = () => {
    updateMutation.mutate({
      isEnabled,
      message,
      estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion).toISOString() : null,
      allowlistIps,
      allowlistEmails,
      apiBlocked,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const auditLogs = auditData?.logs || [];

  return (
    <div ref={containerRef} className="space-y-8 pb-10">
      {/* Header & Back Navigation */}
      <div className="maint-header flex flex-col gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-3 w-fit font-black rounded-lg gap-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/admin/system">
            <ArrowLeft className="h-4 w-4" />
            Back to System Control
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4 drop-shadow-sm">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              Maintenance Control
            </h1>
            <p className="text-muted-foreground text-base font-medium">
              Manage website availability, set downtime messaging, and add developer access bypasses.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded-xl font-black gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: General Configuration */}
        <div className="maint-card lg:col-span-2 space-y-6">
          <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/10 bg-muted/20">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                General System Configuration
              </CardTitle>
              <CardDescription className="font-medium">
                Core toggle and public message settings during system maintenance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between rounded-xl bg-muted/30 border border-border/30 p-5">
                <div className="space-y-1 pr-4">
                  <Label htmlFor="maint-toggle" className="text-base font-black flex items-center gap-2 cursor-pointer">
                    Enable Maintenance Mode
                    {isEnabled ? (
                      <Badge className="bg-rose-500 hover:bg-rose-600 border-0 rounded-md font-bold text-[10px]">
                        ACTIVE
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 border-0 rounded-md font-bold text-[10px]">
                        INACTIVE
                      </Badge>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground font-medium leading-normal">
                    When active, redirects non-allowlisted visitors to the animated maintenance screen.
                  </p>
                </div>
                <Switch
                  id="maint-toggle"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                  className="data-[state=checked]:bg-rose-500"
                />
              </div>

              {/* API Block Toggle */}
              <div className="flex items-center justify-between rounded-xl bg-muted/30 border border-border/30 p-5">
                <div className="space-y-1 pr-4">
                  <Label htmlFor="api-toggle" className="text-base font-black flex items-center gap-2 cursor-pointer">
                    Block Public API Traffic
                  </Label>
                  <p className="text-xs text-muted-foreground font-medium leading-normal">
                    If active, non-allowlisted users calling API endpoints will receive a 503 Service Unavailable JSON response.
                  </p>
                </div>
                <Switch
                  id="api-toggle"
                  checked={apiBlocked}
                  onCheckedChange={setApiBlocked}
                />
              </div>

              {/* Maintenance Notice Message */}
              <div className="space-y-2">
                <Label htmlFor="maint-message" className="text-sm font-black">
                  Maintenance Message Notice
                </Label>
                <Textarea
                  id="maint-message"
                  placeholder="Enter custom downtime message..."
                  className="min-h-28 rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary font-medium"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground font-medium">
                  Supports clear messaging detailing the goals or duration of the maintenance.
                </p>
              </div>

              {/* Completion Date */}
              <div className="space-y-2 max-w-md">
                <Label htmlFor="maint-completion" className="text-sm font-black flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Estimated Completion Date & Time (Optional)
                </Label>
                <Input
                  id="maint-completion"
                  type="datetime-local"
                  className="rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary font-semibold"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                />
                <p className="text-xs text-muted-foreground font-medium">
                  Setting this will enable a live countdown timer on the maintenance landing page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Allowlists */}
        <div className="maint-card space-y-6">
          <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl h-full flex flex-col">
            <CardHeader className="border-b border-border/10 bg-muted/20">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Access Allowlist Bypasses
              </CardTitle>
              <CardDescription className="font-medium">
                Configure IP subnets and developer emails to bypass maintenance screens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 flex-1">
              {/* IP Allowlist */}
              <div className="space-y-3">
                <Label className="text-sm font-black">IP Address Allowlist</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 192.168.1.1"
                    className="rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary font-semibold"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddIp())}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl font-black px-3"
                    onClick={handleAddIp}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {allowlistIps.length === 0 ? (
                    <span className="text-xs text-muted-foreground font-medium italic">
                      No IPs added. Only administrators will have bypass privileges.
                    </span>
                  ) : (
                    allowlistIps.map((ip) => (
                      <Badge
                        key={ip}
                        variant="secondary"
                        className="rounded-lg px-2.5 py-1 font-bold flex items-center gap-1.5 border border-border/40"
                      >
                        {ip}
                        <button
                          type="button"
                          className="hover:text-destructive transition-colors"
                          onClick={() => handleRemoveIp(ip)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Email Allowlist */}
              <div className="space-y-3 pt-4 border-t border-border/10">
                <Label className="text-sm font-black">Developer Email Allowlist</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. dev@example.com"
                    type="email"
                    className="rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary font-semibold"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddEmail())}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl font-black px-3"
                    onClick={handleAddEmail}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {allowlistEmails.length === 0 ? (
                    <span className="text-xs text-muted-foreground font-medium italic">
                      No emails added. Public users will be blocked.
                    </span>
                  ) : (
                    allowlistEmails.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="rounded-lg px-2.5 py-1 font-bold flex items-center gap-1.5 border border-border/40"
                      >
                        {email}
                        <button
                          type="button"
                          className="hover:text-destructive transition-colors"
                          onClick={() => handleRemoveEmail(email)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="maint-card">
        <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/10 bg-muted/20">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Maintenance Audit Trail
            </CardTitle>
            <CardDescription className="font-medium">
              Audit logs detailing administrative toggle events and message adjustments.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {auditLoading ? (
              <div className="p-8 text-center text-muted-foreground font-semibold flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading audit logs...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-bold italic">
                No logs recorded yet for maintenance adjustments.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/10 bg-muted/30">
                      <th className="p-4 font-black text-muted-foreground uppercase text-xs tracking-wider">Timestamp</th>
                      <th className="p-4 font-black text-muted-foreground uppercase text-xs tracking-wider">Administrator</th>
                      <th className="p-4 font-black text-muted-foreground uppercase text-xs tracking-wider">IP Address</th>
                      <th className="p-4 font-black text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                      <th className="p-4 font-black text-muted-foreground uppercase text-xs tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log: any) => {
                      const details = log.details || {};
                      return (
                        <tr key={log.id} className="border-b border-border/15 hover:bg-muted/10 transition-colors font-medium">
                          <td className="p-4 font-semibold text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 font-black text-foreground">
                            {details.updatedBy || log.userId || "System Admin"}
                          </td>
                          <td className="p-4 font-mono text-xs">{log.ipAddress || "—"}</td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={
                                log.status === "SUCCESS"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold"
                                  : "bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold"
                              }
                            >
                              {log.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground max-w-sm truncate">
                            {details.isEnabled !== undefined
                              ? `Toggled ${details.isEnabled ? "ON" : "OFF"} | API Block: ${details.apiBlocked ? "YES" : "NO"}`
                              : "Config updated"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
