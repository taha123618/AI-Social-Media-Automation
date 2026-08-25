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
import { PlusCircle, Edit, BarChart3, Megaphone, TrendingUp, DollarSign, Settings, Trash2, Pencil, Sparkles, Loader2 } from 'lucide-react';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase">Active</Badge>;
      case 'PAUSED':
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono uppercase">Paused</Badge>;
      case 'PENDING_REVIEW':
        return <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono uppercase">Review</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary" className="text-[10px] font-mono uppercase">Completed</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="text-[10px] font-mono uppercase">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-mono uppercase">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Autonomous Ad Campaigns
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synthesize high-converting ad copy and manage multi-platform campaigns on Meta &amp; Google.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ad-campaigns/generate">
            <Button variant="outline" size="sm" className="text-xs font-semibold rounded-lg gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Generate Copy</span>
            </Button>
          </Link>
          <Link href="/ad-campaigns/builder">
            <Button size="sm" className="text-xs font-semibold rounded-lg gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Campaign</span>
            </Button>
          </Link>
          <Link href="/ad-campaigns/settings">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Spend (30d)</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground" suppressHydrationWarning>
              ${stats.totalSpend.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Connected ad accounts metrics</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Campaigns</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {campaigns.filter(c => c.status === 'ACTIVE').length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">of {campaigns.length} total campaigns</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg. ROAS Target</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {stats.avgRoas > 0 ? `${stats.avgRoas.toFixed(2)}x` : '—'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Return on Ad Spend ratio</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-bold text-foreground">Campaign Matrix</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            All active, paused, and drafted ad campaigns for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading || businessLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading campaigns telemetry...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">No campaigns launched yet</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">Generate AI ad copy or launch your first multi-network campaign to start driving paid conversions.</p>
              </div>
              <div className="flex gap-2 mt-2">
                <Link href="/ad-campaigns/generate">
                  <Button variant="outline" size="sm" className="text-xs font-medium rounded-lg">Generate Copy</Button>
                </Link>
                <Link href="/ad-campaigns/builder">
                  <Button size="sm" className="text-xs font-semibold rounded-lg">Launch Campaign</Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Platform</TableHead>
                  <TableHead className="text-xs">Objective</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Budget/Day</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(c => (
                  <TableRow key={c.id} className="border-b border-border/40 hover:bg-secondary/40">
                    <TableCell className="font-semibold text-xs text-foreground">{c.name}</TableCell>
                    <TableCell className="text-xs font-mono">{c.platform}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.objective}</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell className="text-xs font-mono font-semibold text-foreground">
                      ${((c.dailyBudget ?? 0) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/ad-campaigns/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-lg">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <AlertDialog open={deleteId === c.id} onOpenChange={open => !open && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg"
                              onClick={() => setDeleteId(c.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl border border-border/80 bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-base font-bold">Delete Campaign?</AlertDialogTitle>
                              <AlertDialogDescription className="text-xs text-muted-foreground">
                                This will permanently delete &ldquo;{c.name}&rdquo;. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="text-xs rounded-lg">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs rounded-lg font-semibold"
                              >
                                {deleting ? 'Deleting...' : 'Delete'}
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
