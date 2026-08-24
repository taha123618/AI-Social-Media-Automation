"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { Loader2, Save, CheckCircle2, Share2, Globe, RefreshCw, ExternalLink } from 'lucide-react';

const MetaSchema = z.object({
  adAccountId: z.string().min(1, 'Required — format: act_<numeric_id>'),
  pageId: z.string().min(1, 'Required — your Facebook Page ID'),
});

const GoogleSchema = z.object({
  developerToken: z.string().min(1, 'Required — from Google Ads Manager Account'),
  customerId: z.string().min(1, 'Required — numeric Customer ID, no dashes'),
});

export default function AdCampaignSettingsPage() {
  const { businessId, isLoading: bizLoading } = useCurrentBusiness();
  const [metaSaving, setMetaSaving] = useState(false);
  const [googleSaving, setGoogleSaving] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [metaConfigured, setMetaConfigured] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [credentials, setCredentials] = useState<{ platform: string; expiresAt: string | null; createdAt: string }[]>([]);

  const metaForm = useForm<z.infer<typeof MetaSchema>>({
    resolver: zodResolver(MetaSchema),
    defaultValues: { adAccountId: '', pageId: '' },
  });

  const googleForm = useForm<z.infer<typeof GoogleSchema>>({
    resolver: zodResolver(GoogleSchema),
    defaultValues: { developerToken: '', customerId: '' },
  });

  useEffect(() => {
    if (!businessId) return;

    setMetaLoading(true);
    fetch('/api/ad-campaigns/settings/meta', { headers: { 'x-business-id': businessId } })
      .then(r => r.json())
      .then(d => {
        metaForm.setValue('adAccountId', d.adAccountId || '');
        metaForm.setValue('pageId', d.pageId || '');
        setMetaConfigured(d.isConfigured || false);
      })
      .catch(() => {})
      .finally(() => setMetaLoading(false));

    setGoogleLoading(true);
    fetch('/api/ad-campaigns/settings/google', { headers: { 'x-business-id': businessId } })
      .then(r => r.json())
      .then(d => {
        googleForm.setValue('customerId', d.customerId || '');
        googleForm.setValue('developerToken', d.developerTokenSet ? '••••••••' : '');
        setGoogleConfigured(d.isConfigured || false);
      })
      .catch(() => {})
      .finally(() => setGoogleLoading(false));

    fetch('/api/ad-campaigns/accounts', { headers: { 'x-business-id': businessId } })
      .then(r => r.json())
      .then(d => setCredentials(d.credentials || []))
      .catch(() => {});
  }, [businessId, metaForm, googleForm]);

  async function saveMeta(data: z.infer<typeof MetaSchema>) {
    if (!businessId) return;
    setMetaSaving(true);
    try {
      const res = await fetch('/api/ad-campaigns/settings/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Meta Ads credentials saved!');
      setMetaConfigured(true);
    } catch (e: any) {
      toast.error('Failed to save', { description: e.message });
    } finally {
      setMetaSaving(false);
    }
  }

  async function saveGoogle(data: z.infer<typeof GoogleSchema>) {
    if (!businessId) return;
    setGoogleSaving(true);
    try {
      const res = await fetch('/api/ad-campaigns/settings/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Google Ads credentials saved!');
      setGoogleConfigured(true);
    } catch (e: any) {
      toast.error('Failed to save', { description: e.message });
    } finally {
      setGoogleSaving(false);
    }
  }

  const credHealth = (platform: string) => {
    const platformCreds = credentials.filter(c => c.platform === platform);
    if (platformCreds.length === 0) return { status: 'none', label: 'Not connected' };
    const latest = platformCreds.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
    if (!latest.expiresAt) return { status: 'healthy', label: 'Connected (no expiry)' };
    const days = (new Date(latest.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (days <= 0) return { status: 'expired', label: 'Expired — reconnect' };
    if (days <= 7) return { status: 'expiring', label: `Expires in ${Math.ceil(days)} days` };
    return { status: 'healthy', label: `Expires ${new Date(latest.expiresAt).toLocaleDateString()}` };
  };

  const startMetaOAuth = () => { window.location.href = '/api/ad-campaigns/settings/meta/oauth/start'; };
  const startGoogleOAuth = () => { window.location.href = '/api/ad-campaigns/settings/google/oauth/start'; };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ad Platform Settings</h1>
        <p className="text-muted-foreground mt-1">
          Connect your Meta and Google Ads accounts to launch campaigns directly from this platform.
        </p>
      </div>

      <Tabs defaultValue="meta">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meta" className="gap-2">
            <Share2 className="h-4 w-4" /> Meta Ads
          </TabsTrigger>
          <TabsTrigger value="google" className="gap-2">
            <Globe className="h-4 w-4" /> Google Ads
          </TabsTrigger>
        </TabsList>

        {/* ── Meta ── */}
        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meta Ads Configuration</CardTitle>
                  <CardDescription>
                    Connect to Meta (Facebook &amp; Instagram) to launch and manage campaigns.
                  </CardDescription>
                </div>
                <Badge variant={metaConfigured ? 'default' : 'secondary'}>
                  {metaConfigured ? 'Configured' : 'Not configured'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* OAuth + health */}
              <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">OAuth Token</span>
                  <Button variant="outline" size="sm" onClick={startMetaOAuth}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    {credHealth('META').status === 'none' ? 'Connect Meta' : 'Reconnect'}
                  </Button>
                </div>
                {credHealth('META').status !== 'none' && (
                  <div className="flex items-center gap-2 text-sm">
                    {credHealth('META').status === 'healthy' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    <span className="text-muted-foreground">{credHealth('META').label}</span>
                  </div>
                )}
              </div>

              <Separator />

              <Form {...metaForm} onSubmit={metaForm.handleSubmit(saveMeta)}>
                <div className="space-y-4">
                  {metaLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading settings…
                    </div>
                  ) : (
                    <>
                      <FormField control={metaForm.control} name="adAccountId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Account ID</FormLabel>
                          <FormControl>
                            <Input placeholder="act_123456789" {...field} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Found in Meta Business Manager → Ad Accounts. Always starts with "act_".
                          </p>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={metaForm.control} name="pageId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook Page ID</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789012345" {...field} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Your Facebook Page → About → Page ID.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}

                  <Button type="submit" disabled={metaSaving || bizLoading || metaLoading}>
                    {metaSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save Meta Settings</>}
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Google ── */}
        <TabsContent value="google">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Google Ads Configuration</CardTitle>
                  <CardDescription>
                    Connect to Google Ads (Search &amp; Display) to launch and manage campaigns.
                  </CardDescription>
                </div>
                <Badge variant={googleConfigured ? 'default' : 'secondary'}>
                  {googleConfigured ? 'Configured' : 'Not configured'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* OAuth + health */}
              <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">OAuth Token</span>
                  <Button variant="outline" size="sm" onClick={startGoogleOAuth}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    {credHealth('GOOGLE').status === 'none' ? 'Connect Google' : 'Reconnect'}
                  </Button>
                </div>
                {credHealth('GOOGLE').status !== 'none' && (
                  <div className="flex items-center gap-2 text-sm">
                    {credHealth('GOOGLE').status === 'healthy' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    <span className="text-muted-foreground">{credHealth('GOOGLE').label}</span>
                  </div>
                )}
              </div>

              <Separator />

              <Form {...googleForm} onSubmit={googleForm.handleSubmit(saveGoogle)}>
                <div className="space-y-4">
                  {googleLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading settings…
                    </div>
                  ) : (
                    <>
                      <FormField control={googleForm.control} name="developerToken" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Developer Token</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••••••••••" {...field} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Found in Google Ads Manager Account → Tools → API Center.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={googleForm.control} name="customerId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer ID</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Your 10-digit Google Ads Customer ID (no dashes).
                          </p>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}

                  <Button type="submit" disabled={googleSaving || bizLoading || googleLoading}>
                    {googleSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save Google Settings</>}
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Setup guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Setup Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Connect your <strong className="text-foreground">Facebook</strong> account via Social Accounts → authorizes Meta API access</li>
            <li>Enter your <strong className="text-foreground">Meta Ad Account ID</strong> and <strong className="text-foreground">Page ID</strong> above</li>
            <li>Connect your <strong className="text-foreground">Google</strong> account via Social Accounts → authorizes Google OAuth</li>
            <li>Enter your <strong className="text-foreground">Google Ads Developer Token</strong> and <strong className="text-foreground">Customer ID</strong> above</li>
            <li>Go to <strong className="text-foreground">Ad Campaigns → Generate</strong> to create AI copy, then launch from <strong className="text-foreground">Campaign Builder</strong></li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
