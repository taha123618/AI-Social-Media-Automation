"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { ArrowLeft, Save, Loader2, Megaphone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-green-500',
  PAUSED: 'bg-yellow-500',
  DRAFT: 'bg-slate-400',
  PENDING_REVIEW: 'bg-indigo-500',
  COMPLETED: 'bg-blue-500',
  REJECTED: 'bg-red-500',
};

type VariantForm = {
  id: string;
  headline: string;
  primaryText: string;
  description: string;
  cta: string;
  imageUrl: string;
  isWinner: boolean;
};

type AdForm = {
  id: string;
  name: string;
  status: string;
  variants: VariantForm[];
};

type AdSetForm = {
  id: string;
  name: string;
  status: string;
  dailyBudget: string;
  audience: string;
  ads: AdForm[];
};

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { businessId } = useCurrentBusiness();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [campaign, setCampaign] = useState<any>(null);

  // Campaign-level form
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('TRAFFIC');
  const [dailyBudget, setDailyBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Nested forms
  const [adSets, setAdSets] = useState<AdSetForm[]>([]);

  useEffect(() => {
    if (!businessId || !id) return;
    fetch(`/api/ad-campaigns/${id}`, { headers: { 'x-business-id': businessId } })
      .then(r => r.json())
      .then(data => {
        if (!data.success) { toast.error('Failed to load campaign'); return; }
        const c = data.campaign;
        setCampaign(c);
        setName(c.name || '');
        setObjective(c.objective || 'TRAFFIC');
        setDailyBudget(c.dailyBudget?.toString() || '');
        setStartDate(c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '');
        setEndDate(c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '');
        setAdSets((c.adSets || []).map((as: any) => ({
          id: as.id,
          name: as.name || '',
          status: as.status || 'DRAFT',
          dailyBudget: as.dailyBudget?.toString() || '',
          audience: as.audience ? (typeof as.audience === 'string' ? as.audience : JSON.stringify(as.audience)) : '',
          ads: (as.ads || []).map((ad: any) => ({
            id: ad.id,
            name: ad.name || '',
            status: ad.status || 'DRAFT',
            variants: (ad.adVariants || []).map((v: any) => ({
              id: v.id,
              headline: v.headline || '',
              primaryText: v.primaryText || '',
              description: v.description || '',
              cta: v.cta || '',
              imageUrl: v.imageUrl || '',
              isWinner: v.isWinner || false,
            })),
          })),
        })));
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load'); setLoading(false); });
  }, [businessId, id]);

  const updateAdSet = (index: number, field: string, value: any) => {
    setAdSets(prev => prev.map((as, i) => i === index ? { ...as, [field]: value } : as));
  };

  const updateAd = (setIndex: number, adIndex: number, field: string, value: any) => {
    setAdSets(prev => prev.map((as, i) =>
      i === setIndex
        ? { ...as, ads: as.ads.map((ad, j) => j === adIndex ? { ...ad, [field]: value } : ad) }
        : as
    ));
  };

  const updateVariant = (setIndex: number, adIndex: number, vIndex: number, field: string, value: any) => {
    setAdSets(prev => prev.map((as, i) =>
      i === setIndex
        ? {
          ...as,
          ads: as.ads.map((ad, j) =>
            j === adIndex
              ? { ...ad, variants: ad.variants.map((v, k) => k === vIndex ? { ...v, [field]: value } : v) }
              : ad
          ),
        }
        : as
    ));
  };

  const handleSaveCampaign = async () => {
    if (!businessId) return;
    setSavingField('campaign');
    try {
      const payload: any = { name, objective };
      payload.dailyBudget = dailyBudget ? parseFloat(dailyBudget) : null;
      payload.startDate = startDate || null;
      payload.endDate = endDate || null;
      const res = await fetch(`/api/ad-campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(typeof data.error === 'string' ? data.error : 'Validation error');
      setCampaign((prev: any) => ({ ...prev, ...data.campaign }));
      toast.success('Campaign saved');
    } catch (err: any) {
      toast.error('Failed to save', { description: err.message });
    } finally {
      setSavingField(null);
    }
  };

  const handleSaveAdSet = async (as: AdSetForm) => {
    if (!businessId) return;
    setSavingField(`adset-${as.id}`);
    try {
      const res = await fetch(`/api/ad-campaigns/${id}/ad-sets/${as.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify({
          name: as.name,
          dailyBudget: as.dailyBudget ? parseFloat(as.dailyBudget) : null,
          audience: as.audience ? (() => { try { return JSON.parse(as.audience); } catch { return as.audience; } })() : null,
          status: as.status,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to save ad set');
      setAdSets(prev => prev.map(s => s.id === as.id ? { ...s, ...data.adSet } : s));
      toast.success('Ad set saved');
    } catch (err: any) {
      toast.error('Failed to save ad set', { description: err.message });
    } finally {
      setSavingField(null);
    }
  };

  const handleSaveAd = async (ad: AdForm) => {
    if (!businessId) return;
    setSavingField(`ad-${ad.id}`);
    try {
      const adSetId = adSets.find(as => as.ads.some(a => a.id === ad.id))?.id;
      const res = await fetch(`/api/ad-campaigns/${id}/ad-sets/${adSetId}/ads/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify({ name: ad.name, status: ad.status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to save ad');
      setAdSets(prev => prev.map(as =>
        as.id === adSetId
          ? { ...as, ads: as.ads.map(a => a.id === ad.id ? { ...a, ...data.ad } : a) }
          : as
      ));
      toast.success('Ad saved');
    } catch (err: any) {
      toast.error('Failed to save ad', { description: err.message });
    } finally {
      setSavingField(null);
    }
  };

  const handleSaveVariant = async (v: VariantForm, adId: string) => {
    if (!businessId) return;
    setSavingField(`variant-${v.id}`);
    try {
      const parentAdSetId = adSets.find(s => s.ads.some(a => a.id === adId))?.id;
      const res = await fetch(`/api/ad-campaigns/${id}/ad-sets/${parentAdSetId}/ads/${adId}/variants/${v.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify({
          headline: v.headline,
          primaryText: v.primaryText,
          description: v.description,
          cta: v.cta,
          imageUrl: v.imageUrl || null,
          isWinner: v.isWinner,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to save variant');
      setAdSets(prev => prev.map(s =>
        s.id === parentAdSetId
          ? { ...s, ads: s.ads.map(a =>
              a.id === adId
                ? { ...a, variants: a.variants.map(vr => vr.id === v.id ? { ...vr, ...data.variant } : vr) }
                : a
            ) }
          : s
      ));
      toast.success('Variant saved');
    } catch (err: any) {
      toast.error('Failed to save variant', { description: err.message });
    } finally {
      setSavingField(null);
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
      if (!data.success) throw new Error('Failed to delete');
      toast.success('Campaign deleted');
      router.push('/ad-campaigns');
    } catch (err: any) {
      toast.error('Failed to delete', { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/ad-campaigns/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="text-muted-foreground mt-1">{campaign.platform} &middot; {campaign.objective}</p>
        </div>
        <Badge className={`${statusColor[campaign.status] ?? 'bg-slate-400'} text-white`}>{campaign.status}</Badge>
        <Button
          variant="outline" size="sm"
          className="border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
        </Button>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Edit name, objective, budget, and schedule.</CardDescription>
          </div>
          <Button size="sm" onClick={handleSaveCampaign} disabled={savingField === 'campaign'}>
            {savingField === 'campaign' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            Save
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Objective</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TRAFFIC">Traffic</SelectItem>
                <SelectItem value="LEADS">Lead Generation</SelectItem>
                <SelectItem value="SALES">Sales / Conversions</SelectItem>
                <SelectItem value="AWARENESS">Brand Awareness</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Daily Budget (USD)</Label>
              <Input type="number" value={dailyBudget} onChange={e => setDailyBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={campaign.status} onValueChange={async (v) => {
                if (!businessId) return;
                try {
                  const res = await fetch(`/api/ad-campaigns/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
                    body: JSON.stringify({ status: v }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setCampaign((prev: any) => ({ ...prev, status: v }));
                    toast.success(`Status → ${v}`);
                  }
                } catch { toast.error('Failed to update status'); }
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Sets, Ads & Variants */}
      {adSets.map((as, setIdx) => (
        <Card key={as.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ad Set: {as.name}</CardTitle>
              <CardDescription>Edit targeting and budget per ad set.</CardDescription>
            </div>
            <Button size="sm" onClick={() => handleSaveAdSet(as)} disabled={savingField === `adset-${as.id}`}>
              {savingField === `adset-${as.id}` ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              Save Ad Set
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Set Name</Label>
              <Input value={as.name} onChange={e => updateAdSet(setIdx, 'name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Daily Budget (USD)</Label>
                <Input type="number" value={as.dailyBudget} onChange={e => updateAdSet(setIdx, 'dailyBudget', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={as.status} onValueChange={v => updateAdSet(setIdx, 'status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Audience (JSON)</Label>
              <Textarea
                value={as.audience}
                onChange={e => updateAdSet(setIdx, 'audience', e.target.value)}
                rows={3}
              />
            </div>

            {/* Ads in this set */}
            {(as.ads || []).map((ad, adIdx) => (
              <div key={ad.id} className="mt-4 rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Ad: {ad.name}</h4>
                  <Button size="sm" variant="outline" onClick={() => handleSaveAd(ad)} disabled={savingField === `ad-${ad.id}`}>
                    {savingField === `ad-${ad.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Ad Name</Label>
                    <Input value={ad.name} onChange={e => updateAd(setIdx, adIdx, 'name', e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Status</Label>
                    <Select value={ad.status} onValueChange={v => updateAd(setIdx, adIdx, 'status', v)}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Variants */}
                {(ad.variants || []).map((v, vIdx) => (
                  <div key={v.id} className="rounded-md bg-muted/30 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Variant {vIdx + 1} {v.isWinner ? <Badge className="bg-green-500 text-white ml-2 text-[10px]">Winner</Badge> : ''}
                      </h5>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleSaveVariant(v, ad.id)} disabled={savingField === `variant-${v.id}`}>
                        {savingField === `variant-${v.id}` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                        Save
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Headline</Label>
                        <Input value={v.headline} onChange={e => updateVariant(setIdx, adIdx, vIdx, 'headline', e.target.value)} className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">CTA</Label>
                        <Input value={v.cta} onChange={e => updateVariant(setIdx, adIdx, vIdx, 'cta', e.target.value)} className="h-7 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Primary Text</Label>
                      <Textarea value={v.primaryText} onChange={e => updateVariant(setIdx, adIdx, vIdx, 'primaryText', e.target.value)} rows={2} className="text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Description</Label>
                      <Input value={v.description} onChange={e => updateVariant(setIdx, adIdx, vIdx, 'description', e.target.value)} className="h-7 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Image URL</Label>
                        <Input value={v.imageUrl} onChange={e => updateVariant(setIdx, adIdx, vIdx, 'imageUrl', e.target.value)} className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1 flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={v.isWinner}
                            onChange={e => updateVariant(setIdx, adIdx, vIdx, 'isWinner', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-xs font-medium">Mark as Winner</span>
                        </label>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2 pb-12">
        <Button variant="outline" onClick={() => router.push(`/ad-campaigns/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaign
        </Button>
        <Button onClick={handleSaveCampaign} disabled={savingField === 'campaign'}>
          <Save className="mr-2 h-4 w-4" /> Save All Campaign Details
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This cannot be undone.
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
