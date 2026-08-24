"use client";
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Trash2, Star, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

type AdAccount = {
  id: string;
  platform: string;
  name: string;
  platformAccountId?: string | null;
  status: string;
  isPrimary?: boolean;
  balance?: number | null;
  currency?: string | null;
  timezone?: string | null;
  lastSyncedAt?: string | null;
  details?: Record<string, unknown> | null;
};

type Credential = {
  id: string;
  platform: string;
  expiresAt: string | null;
  createdAt: string;
};

type AccountsResponse = {
  accounts: AdAccount[];
  credentials: Credential[];
};

export default function AdAccountsPanel({ businessId }: { businessId: string }) {
  const [data, setData] = useState<AccountsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ad-campaigns/accounts', { headers: { 'x-business-id': businessId } });
      const d = await res.json();
      setData(d);
    } catch {
      toast.error('Failed to load ad accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [businessId]);

  const doAction = async (accountId: string, action: string) => {
    setActioning(accountId);
    try {
      const res = await fetch(`/api/ad-campaigns/accounts/${accountId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`${action === 'delete' ? 'Removed' : action === 'setPrimary' ? 'Set as primary' : 'Refreshed'} account`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActioning(null);
    }
  };

  const startOAuth = (platform: string) => {
    window.location.href = `/api/ad-campaigns/settings/${platform}/oauth/start`;
  };

  const discover = async (platform: string) => {
    await fetch(`/api/ad-campaigns/settings/${platform}/discover`, { method: 'POST', headers: { 'x-business-id': businessId } });
    await fetchData();
  };

  const accounts = data?.accounts ?? [];
  const credentials = data?.credentials ?? [];

  const credHealth = (platform: string): { status: 'healthy' | 'expiring' | 'expired' | 'none'; expiresAt?: string } => {
    const platformCreds = credentials.filter(c => c.platform === platform);
    if (platformCreds.length === 0) return { status: 'none' };
    const latest = platformCreds.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
    if (!latest.expiresAt) return { status: 'healthy' };
    const days = (new Date(latest.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (days <= 0) return { status: 'expired', expiresAt: latest.expiresAt };
    if (days <= 7) return { status: 'expiring', expiresAt: latest.expiresAt };
    return { status: 'healthy', expiresAt: latest.expiresAt };
  };

  const healthIcon = (status: string) => {
    if (status === 'healthy') return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    if (status === 'expiring') return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
    if (status === 'expired') return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    return <Info className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Ad Accounts</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => startOAuth('meta')}>
            Connect Meta
          </Button>
          <Button variant="outline" size="sm" onClick={() => startOAuth('google')}>
            Connect Google
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Credential health strip */}
      <div className="flex gap-4 mb-4 text-xs">
        {['META', 'GOOGLE'].map(p => {
          const health = credHealth(p);
          return (
            <div key={p} className="flex items-center gap-1.5 text-muted-foreground">
              {healthIcon(health.status)}
              <span className="font-medium">{p}</span>
              <span>
                {health.status === 'none' && 'Not connected'}
                {health.status === 'healthy' && 'Connected'}
                {health.status === 'expiring' && `Expiring ${new Date(health.expiresAt!).toLocaleDateString()}`}
                {health.status === 'expired' && 'Expired — reconnect'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {accounts.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No ad accounts found. Connect a platform above, then click Discover to import your accounts.
          </div>
        )}

        {accounts.map(a => (
          <div key={a.id} className="p-3 border rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{a.name}</span>
                  <Badge variant={a.platform === 'META' ? 'default' : 'secondary'} className="text-xs">
                    {a.platform}
                  </Badge>
                  {a.isPrimary && (
                    <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                      <Star className="h-3 w-3 mr-0.5" /> Primary
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  <span className="font-mono">{a.platformAccountId ?? '—'}</span>
                  <span>Status: {a.status}</span>
                  <span>Balance: {a.balance ?? '—'} {a.currency ?? ''}</span>
                  <span>TZ: {a.timezone ?? '—'}</span>
                  <span>Synced: {a.lastSyncedAt ? new Date(a.lastSyncedAt).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  disabled={actioning === a.id}
                  onClick={() => doAction(a.id, 'refresh')}>
                  <RefreshCw className={`h-3 w-3 mr-1 ${actioning === a.id ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {!a.isPrimary && (
                  <Button size="sm" variant="outline" className="h-7 text-xs"
                    disabled={actioning === a.id}
                    onClick={() => doAction(a.id, 'setPrimary')}>
                    <Star className="h-3 w-3 mr-1" />
                    Primary
                  </Button>
                )}
                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  disabled={actioning === a.id}
                  onClick={() => { if (confirm('Remove this ad account?')) doAction(a.id, 'delete'); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Discover buttons */}
      <div className="flex gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={() => discover('meta')}>
          Discover Meta Accounts
        </Button>
        <Button variant="ghost" size="sm" onClick={() => discover('google')}>
          Discover Google Accounts
        </Button>
      </div>
    </div>
  );
}
