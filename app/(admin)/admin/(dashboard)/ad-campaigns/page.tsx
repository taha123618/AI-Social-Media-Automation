"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Search, Megaphone, RefreshCw, Play, Pause, Trash2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Campaign = {
  id: string;
  name: string;
  platform: string;
  status: string;
  objective: string;
  dailyBudget: number | null;
  createdAt: string;
  business: { name: string };
};

export default function AdminAdCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filtered, setFiltered] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/ad-campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
      setFiltered(data.campaigns ?? []);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    setActioningId(campaignId);
    try {
      const res = await fetch('/api/admin/ad-campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Campaign status updated to ${status}`);
      await fetchCampaigns();
    } catch {
      toast.error('Failed to update campaign status');
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/ad-campaigns/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Campaign deleted');
      setDeleteId(null);
      await fetchCampaigns();
    } catch {
      toast.error('Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  useEffect(() => {
    let result = campaigns;
    if (statusFilter !== 'ALL') result = result.filter(c => c.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.business?.name?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, campaigns]);

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-500 hover:bg-green-600',
    PAUSED: 'bg-yellow-500 hover:bg-yellow-600',
    DRAFT: 'bg-slate-400 hover:bg-slate-500',
    PENDING_REVIEW: 'bg-indigo-500 hover:bg-indigo-600',
    COMPLETED: 'bg-blue-500 hover:bg-blue-600',
    REJECTED: 'bg-red-500 hover:bg-red-600',
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'ACTIVE').length,
    draft: campaigns.filter(c => c.status === 'DRAFT').length,
    meta: campaigns.filter(c => c.platform === 'META').length,
    google: campaigns.filter(c => c.platform === 'GOOGLE').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-7 w-7" />
            Ad Campaigns — Admin
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all advertising campaigns across all business workspaces.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/ad-accounts">
            <Button variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Ad Accounts
            </Button>
          </Link>
          <Button variant="outline" onClick={fetchCampaigns} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: 'Total', value: stats.total, icon: BarChart3 },
          { label: 'Active', value: stats.active, color: 'text-green-600' },
          { label: 'Draft', value: stats.draft, color: 'text-slate-500' },
          { label: 'Meta', value: stats.meta, color: 'text-blue-600' },
          { label: 'Google', value: stats.google, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${color ?? ''}`}>{value}</div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by campaign or business…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns ({filtered.length})</CardTitle>
          <CardDescription>Showing campaigns across all registered business workspaces.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No campaigns found matching your filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Objective</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget/Day</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.business?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.platform}</Badge>
                    </TableCell>
                    <TableCell>{c.objective}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColor[c.status] ?? 'bg-slate-400'} text-white text-xs`}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.dailyBudget ? `$${c.dailyBudget.toFixed(2)}` : '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {c.status !== 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 border-green-200 text-green-700 hover:bg-green-50"
                            disabled={actioningId === c.id}
                            onClick={() => updateCampaignStatus(c.id, 'ACTIVE')}
                          >
                            <Play className="h-3.5 w-3.5 mr-1" /> Activate
                          </Button>
                        )}
                        {c.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                            disabled={actioningId === c.id}
                            onClick={() => updateCampaignStatus(c.id, 'PAUSED')}
                          >
                            <Pause className="h-3.5 w-3.5 mr-1" /> Pause
                          </Button>
                        )}
                        <AlertDialog open={deleteId === c.id} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setDeleteId(c.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{c.name}&quot;? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                                {deleting ? 'Deleting…' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
