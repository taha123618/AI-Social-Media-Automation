"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, RefreshCw, Search, CreditCard, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type Credential = {
  id: string;
  platform: string;
  expiresAt: string | null;
  createdAt: string;
};

type AdAccount = {
  id: string;
  platform: string;
  name: string;
  platformAccountId: string | null;
  status: string;
  isPrimary: boolean;
  balance: number | null;
  currency: string | null;
  timezone: string | null;
  lastSyncedAt: string | null;
  business: { id: string; name: string; slug: string };
  credentials: Credential[];
};

export default function AdminAdAccountsPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [filtered, setFiltered] = useState<AdAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/ad-accounts');
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
        setFiltered(data.accounts);
      }
    } catch {
      toast.error('Failed to load ad accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  useEffect(() => {
    let result = accounts;
    if (platformFilter !== 'ALL') result = result.filter(a => a.platform === platformFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.business?.name?.toLowerCase().includes(q) ||
        a.platformAccountId?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, platformFilter, accounts]);

  const stats = {
    total: accounts.length,
    meta: accounts.filter(a => a.platform === 'META').length,
    google: accounts.filter(a => a.platform === 'GOOGLE').length,
    primary: accounts.filter(a => a.isPrimary).length,
    withBalance: accounts.filter(a => a.balance != null).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-7 w-7" />
            Ad Accounts — Admin
          </h1>
          <p className="text-muted-foreground mt-1">Monitor all connected ad accounts across every business workspace.</p>
        </div>
        <Button variant="outline" onClick={fetchAccounts} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: 'Total Accounts', value: stats.total },
          { label: 'Meta', value: stats.meta },
          { label: 'Google', value: stats.google },
          { label: 'Primary', value: stats.primary },
          { label: 'With Balance', value: stats.withBalance },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, business, or account ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Platforms</SelectItem>
            <SelectItem value="META">Meta</SelectItem>
            <SelectItem value="GOOGLE">Google</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Ad Accounts ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No ad accounts found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Last Synced</TableHead>
                  <TableHead>Credentials</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{a.platformAccountId ?? '—'}</div>
                      {a.isPrimary && <Badge variant="outline" className="mt-1 text-xs">Primary</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{a.business?.name ?? '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.platform === 'META' ? 'default' : 'secondary'}>
                        {a.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600"><XCircle className="h-3.5 w-3.5" /> {a.status}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.balance != null ? `${a.balance} ${a.currency ?? ''}` : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.timezone ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {a.lastSyncedAt ? new Date(a.lastSyncedAt).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {a.credentials.length > 0 ? (
                        <div className="space-y-1">
                          {a.credentials.map(c => {
                            const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                            const isExpiring = c.expiresAt && !isExpired && new Date(c.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                            return (
                              <div key={c.id} className="flex items-center gap-1 text-xs">
                                {isExpired ? (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                ) : isExpiring ? (
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                )}
                                {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No expiry'}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No credentials</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
