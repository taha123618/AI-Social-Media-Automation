"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { PlusCircle, Edit, BarChart3, Megaphone, TrendingUp, DollarSign, Settings, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function UserAdCampaignsPage() {
  const { businessId, isLoading: businessLoading } = useCurrentBusiness();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSpend: 0, avgRoas: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const fetchCampaigns = () => {
    if (!businessId) return;
    fetch('/api/ad-campaigns', {
      headers: { 'x-business-id': businessId },
    })
      .then(r => r.json())
      .then(data => {
        setCampaigns(data.campaigns ?? []);
        setStats(data.stats ?? { totalSpend: 0, avgRoas: 0 });
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, [businessId]);

  const handleDelete = async () => {
    if (!deleteId || !businessId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ad-campaigns/${deleteId}`, {
        method: 'DELETE',
        headers: { 'x-business-id': businessId },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Campaign deleted');
      setDeleteId(null);
      fetchCampaigns();
    } catch (err: any) {
      toast.error('Failed to delete', { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-500',
    PAUSED: 'bg-yellow-500',
    DRAFT: 'bg-slate-400',
    PENDING_REVIEW: 'bg-indigo-500',
    COMPLETED: 'bg-blue-500',
    REJECTED: 'bg-red-500',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-primary" />
            Ad Campaigns
          </h1>
          <p className="text-muted-foreground mt-1">Generate AI-powered ad copy and launch campaigns on Meta &amp; Google.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ad-campaigns/generate">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Generate Copy
            </Button>
          </Link>
          <Link href="/ad-campaigns/builder">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
          <Link href="/ad-campaigns/settings">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Connected ad accounts metrics</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">of {campaigns.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgRoas > 0 ? `${stats.avgRoas.toFixed(2)}x` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">Return on Ad Spend ratio</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
          <CardDescription>All ad campaigns for your business.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || businessLoading ? (
            <p className="py-6 text-center text-muted-foreground">Loading campaigns…</p>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground/40" />
              <div>
                <p className="font-medium">No campaigns yet</p>
                <p className="text-sm text-muted-foreground">Generate AI ad copy or launch your first campaign to get started.</p>
              </div>
              <div className="flex gap-2">
                <Link href="/ad-campaigns/generate"><Button variant="outline">Generate Copy</Button></Link>
                <Link href="/ad-campaigns/builder"><Button>Launch Campaign</Button></Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Objective</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget/Day</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.platform}</TableCell>
                    <TableCell>{c.objective}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColor[c.status] ?? 'bg-slate-400'} text-white`}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.dailyBudget ? `$${c.dailyBudget}` : '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/ad-campaigns/${c.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Link href={`/ad-campaigns/${c.id}`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <AlertDialog open={deleteId === c.id} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(c.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{c.name}&quot;? This action cannot be undone.
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
