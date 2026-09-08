import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getActiveWorkspaceId } from '../../actions/workspace';
import { CrmIntegrationPanel } from '../_components/crm-integration-panel';

export default async function CrmSettingsPage() {
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              CRM & Sales Pipeline Integration
            </h1>
            <p className="text-xs text-muted-foreground">
              Sync inbound social leads, DM inquiries, and customer interactions into HubSpot and sales tools.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs py-1 px-2.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Pipeline Connected
        </Badge>
      </div>

      {/* Main CRM Integration Panel */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
        <CrmIntegrationPanel businessId={businessId || ''} />
      </div>
    </div>
  );
}
