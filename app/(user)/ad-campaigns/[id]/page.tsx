"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { ArrowLeft, Megaphone, DollarSign, Eye, MousePointerClick, TrendingUp, Pencil, Trash2, Save, X, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-green-500',
  PAUSED: 'bg-yellow-500',
  DRAFT: 'bg-slate-400',
  PENDING_REVIEW: 'bg-indigo-500',
  COMPLETED: 'bg-blue-500',
  REJECTED: 'bg-red-500',
};

export default function UserCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { businessId } = useCurrentBusiness();
  const [campaign, setCampaign] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    objective: 'TRAFFIC',
    dailyBudget: '',
    startDate: '',
    endDate: '',
  });

  const fetchCampaign = () => {
    if (!businessId || !id) return;
    fetch(`/api/ad-campaigns/${id}`, {
      headers: { 'x-business-id': businessId },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCampaign(data.campaign);
          setAnalytics(data.analytics);
          setForm({
            name: data.campaign.name || '',
            objective: data.campaign.objective || 'TRAFFIC',
            dailyBudget: data.campaign.dailyBudget?.toString() || '',
            startDate: data.campaign.startDate ? new Date(data.campaign.startDate).toISOString().split('T')[0] : '',
            endDate: data.campaign.endDate ? new Date(data.campaign.endDate).toISOString().split('T')[0] : '',
          });
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { fetchCampaign(); }, [businessId, id]);

  const handleSave = async () => {
    if (!businessId) return;
    setSaving(true);
    try {
      const payload: any = { name: form.name, objective: form.objective };
      if (form.dailyBudget) payload.dailyBudget = parseFloat(form.dailyBudget);
      else payload.dailyBudget = null;
      payload.startDate = form.startDate || null;
      payload.endDate = form.endDate || null;

      const res = await fetch(`/api/ad-campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Campaign updated');
      setEditing(false);
      fetchCampaign();
    } catch (err: any) {
      toast.error('Failed to update', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!businessId) return;
    setActioning(newStatus);
    try {
      const res = await fetch(`/api/ad-campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(`Campaign ${newStatus.toLowerCase()}`);
      fetchCampaign();
    } catch (err: any) {
      toast.error('Failed to update status', { description: err.message });
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async () => {
    if (!businessId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ad-campaigns/${id}`, {
        method: 'DELETE',
        headers: { 'x-business-id': businessId },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Campaign deleted');
      router.push('/ad-campaigns');
    } catch (err: any) {
      toast.error('Failed to delete', { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading campaign…</p>;
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Megaphone className="h-12 w-12 text-muted-foreground/40" />
        <p className="font-medium">Campaign not found</p>
        <Link href="/ad-campaigns"><Button variant="outline">Back to Campaigns</Button></Link>
      </div>
    );
  }

  const roas = analytics?.totalSpend > 0 ? (analytics.totalRevenue / analytics.totalSpend).toFixed(2) : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/ad-campaigns')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          <p className="text-muted-foreground mt-1">
            {campaign.platform} &middot; {campaign.objective}
          </p>
        </div>
        <Badge className={`${statusColor[campaign.status] ?? 'bg-slate-400'} text-white`}>
          {campaign.status}
        </Badge>
        <div className="flex gap-1">
          {!editing && (
            <>
              {(campaign.status === 'DRAFT' || campaign.status === 'PAUSED') && (
                <Button
                  size="sm" variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  disabled={actioning === 'ACTIVE'}
                  onClick={() => handleStatusChange('ACTIVE')}
                >
                  <Play className="h-3.5 w-3.5 mr-1" /> {actioning === 'ACTIVE' ? '…' : 'Activate'}
                </Button>
              )}
              {campaign.status === 'ACTIVE' && (
                <Button
                  size="sm" variant="outline"
                  className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                  disabled={actioning === 'PAUSED'}
                  onClick={() => handleStatusChange('PAUSED')}
                >
                  <Pause className="h-3.5 w-3.5 mr-1" /> {actioning === 'PAUSED' ? '…' : 'Pause'}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button
                size="sm" variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.totalSpend?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalImpressions?.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalClicks?.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roas}{roas !== '—' ? 'x' : ''}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Campaign Details</CardTitle>
          {editing && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(false); fetchCampaign(); }} disabled={saving}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-3.5 w-3.5 mr-1" /> {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Objective</Label>
                <Select value={form.objective} onValueChange={v => setForm(f => ({ ...f, objective: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRAFFIC">Traffic</SelectItem>
                    <SelectItem value="LEADS">Lead Generation</SelectItem>
                    <SelectItem value="SALES">Sales / Conversions</SelectItem>
                    <SelectItem value="AWARENESS">Brand Awareness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Daily Budget (USD)</Label>
                <Input type="number" value={form.dailyBudget} onChange={e => setForm(f => ({ ...f, dailyBudget: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Daily Budget:</span> {campaign.dailyBudget ? `$${campaign.dailyBudget}` : '—'}</div>
              <div><span className="text-muted-foreground">Lifetime Budget:</span> {campaign.lifetimeBudget ? `$${campaign.lifetimeBudget}` : '—'}</div>
              <div><span className="text-muted-foreground">Start Date:</span> {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : '—'}</div>
              <div><span className="text-muted-foreground">End Date:</span> {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : '—'}</div>
              <div><span className="text-muted-foreground">Created:</span> {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '—'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {campaign.adSets?.length > 0 && campaign.adSets.map((adSet: any) => (
        <Card key={adSet.id}>
          <CardHeader>
            <CardTitle>{adSet.name}</CardTitle>
            <CardDescription>
              Status: <Badge className={`${statusColor[adSet.status] ?? 'bg-slate-400'} text-white`}>{adSet.status}</Badge>
              {adSet.dailyBudget ? ` · Budget: $${adSet.dailyBudget}/day` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adSet.ads?.length > 0 ? adSet.ads.map((ad: any) => (
              <div key={ad.id} className="mb-4 last:mb-0">
                <h4 className="font-medium mb-2">{ad.name} <Badge className={`${statusColor[ad.status] ?? 'bg-slate-400'} text-white`}>{ad.status}</Badge></h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Headline</TableHead>
                      <TableHead>Primary Text</TableHead>
                      <TableHead>CTA</TableHead>
                      <TableHead>Winner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ad.adVariants?.map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.headline}</TableCell>
                        <TableCell>{v.primaryText}</TableCell>
                        <TableCell>{v.cta}</TableCell>
                        <TableCell>{v.isWinner ? <Badge className="bg-green-500 text-white">Winner</Badge> : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )) : <p className="text-sm text-muted-foreground">No ads in this ad set.</p>}
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push('/ad-campaigns')}>Back to Campaigns</Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}