import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Key, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getActiveWorkspaceId } from '../../actions/workspace';
import { ApiKeysPanel } from '../_components/api-keys-panel';
import { FeatureGate } from '@/components/billing/FeatureGate';

export default async function ApiKeysSettingsPage() {
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Developer API Keys
            </h1>
            <p className="text-xs text-muted-foreground">
              Generate high-throughput API keys for programmatically scheduling posts and invoking AI agents.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto gap-1 border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs py-1 px-2.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          REST API v1
        </Badge>
      </div>

      {/* Main API Keys Panel */}
      <FeatureGate feature="api_access">
        <ApiKeysPanel businessId={businessId} />
      </FeatureGate>
    </div>
  );
}
