"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, CheckCircle2, Play, Megaphone, Loader2, AlertTriangle, CheckCircle2 as CheckCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCurrentBusiness } from '@/hooks/use-current-business';

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
};

export default function UserCampaignBuilderPage() {
  const [step, setStep] = useState(1);
  const [launching, setLaunching] = useState(false);
  const router = useRouter();
  const { businessId } = useCurrentBusiness();

  // Campaign State
  const [name, setName] = useState(`Campaign - ${new Date().toLocaleDateString()}`);
  const [platform, setPlatform] = useState('META');
  const [objective, setObjective] = useState('TRAFFIC');

  // Audience State
  const [countries, setCountries] = useState('US');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [interests, setInterests] = useState('');

  // Budget State
  const [dailyBudget, setDailyBudget] = useState('50.00');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  // Creatives State
  const [landingUrl, setLandingUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [primaryText, setPrimaryText] = useState('');
  const [description, setDescription] = useState('');
  const [cta, setCta] = useState('LEARN_MORE');

  // AdAccount selection
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [accountsLoading, setAccountsLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    setAccountsLoading(true);
    fetch('/api/ad-campaigns/accounts', { headers: { 'x-business-id': businessId } })
      .then(r => r.json())
      .then(data => {
        const accounts = (data.accounts || [])
          .filter((a: AdAccount) => a.platform === platform);
        setAdAccounts(accounts);
        const primary = accounts.find((a: AdAccount) => a.isPrimary);
        setSelectedAccountId(primary?.id ?? accounts[0]?.id ?? '');
      })
      .catch(() => toast.error('Failed to load ad accounts'))
      .finally(() => setAccountsLoading(false));
  }, [businessId, platform]);

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleLaunch = async () => {
    if (!businessId) {
      toast.error('No business context selected');
      return;
    }
    if (!landingUrl) {
      toast.error('A valid landing page URL is required');
      setStep(4);
      return;
    }

    setLaunching(true);
    try {
      const createRes = await fetch('/api/ad-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId,
        },
        body: JSON.stringify({
          name,
          platform,
          objective,
          dailyBudget,
          startDate,
          endDate,
          audience: {
            countries: countries.split(',').map(c => c.trim()),
            ageMin,
            ageMax,
            interests: interests.split(',').map(i => i.trim()).filter(Boolean),
          },
          variants: [
            {
              headline: headline || 'Unlock Your Business Potential',
              primaryText: primaryText || 'Generate dynamic social content and start winning more leads.',
              description: description || 'The all-in-one AI platform.',
              cta,
            },
          ],
        }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create campaign draft');
      }

      const createData = await createRes.json();
      const campaignId = createData.campaign.id;

      const selectedAccount = adAccounts.find(a => a.id === selectedAccountId);

      const launchRes = await fetch('/api/ad-campaigns/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId,
        },
        body: JSON.stringify({
          campaignId,
          landingUrl,
          keywords: interests.split(',').map(i => i.trim()).filter(Boolean),
          adAccountId: selectedAccount?.platformAccountId ?? undefined,
        }),
      });

      const launchData = await launchRes.json();

      if (!launchRes.ok) {
        throw new Error(launchData.error || 'Failed to queue campaign launch');
      }

      toast.success('Campaign Launched!', {
        description: `Queued on ${selectedAccount?.name ?? platform}.`,
      });
      setTimeout(() => router.push('/ad-campaigns'), 1500);
    } catch (err: any) {
      toast.error('Launch Error', {
        description: err.message,
      });
    } finally {
      setLaunching(false);
    }
  };

  const steps = ['Objective', 'Audience', 'Budget', 'Creatives', 'Review'];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-7 w-7 text-primary" />
          Campaign Builder
        </h1>
        <p className="text-muted-foreground mt-1">Launch your campaign directly to Meta or Google Ads in minutes.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
        {steps.map((label, i) => {
          const num = i + 1;
          const done = step > num;
          const active = step === num;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background font-semibold text-sm transition-colors ${done ? 'border-primary bg-primary text-primary-foreground' : active ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}`}>
                {done ? <CheckCircle2 className="h-5 w-5" /> : num}
              </div>
              <span className={`text-xs hidden md:block ${active ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {step}: {steps[step - 1]}</CardTitle>
          <CardDescription>
            {step === 1 && 'Choose your advertising platform, target goal, and name.'}
            {step === 2 && 'Define who should see your ads.'}
            {step === 3 && 'Set your daily budget and run dates.'}
            {step === 4 && 'Input your creative landing page and copy.'}
            {step === 5 && 'Review and publish your campaign.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Special Offer" />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="META">Meta Ads (Facebook &amp; Instagram)</SelectItem>
                    <SelectItem value="GOOGLE">Google Ads (Search &amp; Display)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Campaign Objective</Label>
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
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Locations (comma-separated)</Label>
                <Input value={countries} onChange={e => setCountries(e.target.value)} placeholder="e.g. US, CA, GB" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age Min</Label>
                  <Input type="number" value={ageMin} onChange={e => setAgeMin(parseInt(e.target.value) || 18)} />
                </div>
                <div className="space-y-2">
                  <Label>Age Max</Label>
                  <Input type="number" value={ageMax} onChange={e => setAgeMax(parseInt(e.target.value) || 65)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Interests / Keywords (comma-separated)</Label>
                <Input value={interests} onChange={e => setInterests(e.target.value)} placeholder="e.g. Fitness, Technology, Marketing" />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>Daily Budget (USD)</Label>
                <Input type="number" value={dailyBudget} onChange={e => setDailyBudget(e.target.value)} placeholder="50.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date (optional)</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Landing Page URL</Label>
                <Input type="url" value={landingUrl} onChange={e => setLandingUrl(e.target.value)} placeholder="https://yoursite.com/offer" />
              </div>
              <div className="space-y-2">
                <Label>Ad Headline</Label>
                <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Get 50% Off Today Only" />
              </div>
              <div className="space-y-2">
                <Label>Ad Primary Text</Label>
                <Input value={primaryText} onChange={e => setPrimaryText(e.target.value)} placeholder="e.g. Discover our summer catalog..." />
              </div>
              <div className="space-y-2">
                <Label>Ad Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Free shipping on all orders." />
              </div>
              <div className="space-y-2">
                <Label>Call to Action (CTA)</Label>
                <Select value={cta} onValueChange={setCta}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                    <SelectItem value="SHOP_NOW">Shop Now</SelectItem>
                    <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                    <SelectItem value="BOOK_NOW">Book Now</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <h3 className="font-semibold text-sm">Summary</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{name}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Platform</span><span>{platform === 'META' ? 'Meta Ads' : 'Google Ads'}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Objective</span><span>{objective}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Daily Budget</span><span>${parseFloat(dailyBudget || '0').toFixed(2)}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Target Countries</span><span>{countries}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Landing URL</span><span className="truncate max-w-[200px]">{landingUrl}</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  Ad Account
                </h3>
                {accountsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading accounts…
                  </div>
                ) : adAccounts.length === 0 ? (
                  <div className="text-sm text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    No {platform} ad accounts found.{' '}
                    <a href="/ad-campaigns/settings" className="underline font-medium">Connect one →</a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad account" />
                      </SelectTrigger>
                      <SelectContent>
                        {adAccounts.map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} {a.isPrimary ? '(Primary)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedAccountId && (() => {
                      const acc = adAccounts.find(a => a.id === selectedAccountId);
                      if (!acc) return null;
                      return (
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircleIcon className="h-3 w-3 text-green-500" />
                            {acc.status}
                          </span>
                          {acc.balance != null && (
                            <span>Balance: {acc.balance} {acc.currency ?? ''}</span>
                          )}
                          {acc.timezone && <span>TZ: {acc.timezone}</span>}
                          {acc.platformAccountId && (
                            <span className="font-mono">ID: {acc.platformAccountId}</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">By launching, the selected ad account will be charged. Configure credentials under Settings first.</p>
            </div>
          )}
        </CardContent>

        <div className="flex justify-between p-6 pt-0">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || launching}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < 5 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} disabled={launching} className="bg-green-600 hover:bg-green-700 text-white">
              {launching ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching…</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> Launch Campaign</>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
