import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getBusinessSettings } from '../actions/get-business-settings';
import { getActiveWorkspaceId } from '../../actions/workspace';
import { BusinessSettingsPanel } from '../_components/business-settings';

export default async function OrganizationSettingsPage() {
  const businessSettings = await getBusinessSettings();
  const businessId = await getActiveWorkspaceId();

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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Organization & Workspace
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure your business identity, brand voice tone, default timezone, and operational parameters.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto gap-1 border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs py-1 px-2.5">
          <Sparkles className="h-3.5 w-3.5" />
          Workspace Active
        </Badge>
      </div>

      {/* Main Business Settings Panel */}
      <BusinessSettingsPanel
        businessSettings={businessSettings}
        businessId={businessId}
      />
    </div>
  );
}
