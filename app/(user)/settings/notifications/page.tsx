import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getUserSettings } from '../actions/get-user-settings';
import { NotificationsPanel } from '../_components/notifications-panel';

export default async function NotificationsSettingsPage() {
  const userSettings = await getUserSettings();

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Top Breadcrumb Link */}
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Settings Hub</span>
        </Link>
      </div>

      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Alerts & Notifications
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage publishing alerts, AI anomaly detections, weekly performance summaries, and email triggers.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto gap-1 border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs py-1 px-2.5">
          <Sparkles className="h-3.5 w-3.5" />
          Omnichannel Delivery
        </Badge>
      </div>

      {/* Main Notifications Panel */}
      <NotificationsPanel userSettings={userSettings} />
    </div>
  );
}
