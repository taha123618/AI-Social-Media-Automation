"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Settings {
  enabled: boolean;
  notificationEmails: string[];
  autoAssignLead: boolean;
  meetingDuration: number;
  dateRangeDays: number;
  crmProvider: string | null;
  calendarProvider: string | null;
  slackWebhook: string | null;
  discordWebhook: string | null;
  thankYouPage: string;
}

export default function SalesSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/talk-to-sales/settings");
        const json = await res.json();
        if (json.success) setSettings(json.data);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function saveSettings() {
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/talk-to-sales/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Settings saved");
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(key: string, value: unknown) {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/admin/talk-to-sales">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Overview
        </Link>
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Settings</h1>
          <p className="text-muted-foreground mt-1">Configure demo request and lead management settings</p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">General</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Demo Requests</Label>
                <p className="text-sm text-muted-foreground">Allow users to submit demo requests from the marketing page</p>
              </div>
              <Switch checked={settings?.enabled ?? true} onCheckedChange={(v) => updateField("enabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Assign Leads</Label>
                <p className="text-sm text-muted-foreground">Automatically assign new leads to available sales reps</p>
              </div>
              <Switch checked={settings?.autoAssignLead ?? true} onCheckedChange={(v) => updateField("autoAssignLead", v)} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div>
              <Label>Sales Notification Emails</Label>
              <p className="text-sm text-muted-foreground mb-2">Comma-separated email addresses for internal notifications</p>
              <Input
                value={settings?.notificationEmails?.join(", ") ?? ""}
                onChange={(e) => updateField("notificationEmails", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="sales@company.com, manager@company.com"
              />
            </div>
            <div>
              <Label>Slack Webhook URL (optional)</Label>
              <Input
                value={settings?.slackWebhook ?? ""}
                onChange={(e) => updateField("slackWebhook", e.target.value || null)}
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <Label>Discord Webhook URL (optional)</Label>
              <Input
                value={settings?.discordWebhook ?? ""}
                onChange={(e) => updateField("discordWebhook", e.target.value || null)}
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Meeting Configuration</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Meeting Duration (minutes)</Label>
                <Input
                  type="number"
                  value={settings?.meetingDuration ?? 30}
                  onChange={(e) => updateField("meetingDuration", parseInt(e.target.value) || 30)}
                />
              </div>
              <div>
                <Label>Date Range (days)</Label>
                <Input
                  type="number"
                  value={settings?.dateRangeDays ?? 90}
                  onChange={(e) => updateField("dateRangeDays", parseInt(e.target.value) || 90)}
                />
              </div>
            </div>
            <div>
              <Label>Thank You Page URL</Label>
              <Input
                value={settings?.thankYouPage ?? "/thank-you"}
                onChange={(e) => updateField("thankYouPage", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Integrations</h2>
          <div className="space-y-4">
            <div>
              <Label>CRM Provider (optional)</Label>
              <Input
                value={settings?.crmProvider ?? ""}
                onChange={(e) => updateField("crmProvider", e.target.value || null)}
                placeholder="hubspot / salesforce / pipedrive"
              />
            </div>
            <div>
              <Label>Calendar Provider (optional)</Label>
              <Input
                value={settings?.calendarProvider ?? ""}
                onChange={(e) => updateField("calendarProvider", e.target.value || null)}
                placeholder="google-calendar / outlook-calendar"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
