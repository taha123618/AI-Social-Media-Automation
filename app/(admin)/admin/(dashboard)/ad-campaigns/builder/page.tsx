"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, ArrowLeft, CheckCircle2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CampaignBuilderPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleLaunch = () => {
    toast.success("Campaign Launched!", {
      description: "Your campaign is being synchronized with the advertising platform.",
    });
    setTimeout(() => {
      router.push('/admin/ad-campaigns');
    }, 1500);
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Builder</h1>
        <p className="text-muted-foreground">Launch your campaigns directly to Meta and Google Ads.</p>
      </div>

      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -z-10 -translate-y-1/2"></div>
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background font-semibold ${step >= num ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}`}>
            {step > num ? <CheckCircle2 className="h-6 w-6" /> : num}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Step 1: Campaign Objective"}
            {step === 2 && "Step 2: Audience & Targeting"}
            {step === 3 && "Step 3: Budget & Schedule"}
            {step === 4 && "Step 4: Creatives & Ad Copy"}
            {step === 5 && "Step 5: Review & Launch"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Select the advertising platform and what you want to achieve."}
            {step === 2 && "Define who should see your ads."}
            {step === 3 && "Set your spending limits and run dates."}
            {step === 4 && "Select the AI-generated variants you want to use."}
            {step === 5 && "Review your campaign details before publishing."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Advertising Platform</Label>
                <Select defaultValue="meta">
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta">Meta Ads (Facebook & Instagram)</SelectItem>
                    <SelectItem value="google">Google Ads (Search & Display)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Campaign Objective</Label>
                <Select defaultValue="traffic">
                  <SelectTrigger>
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traffic">Traffic (Link Clicks)</SelectItem>
                    <SelectItem value="leads">Lead Generation</SelectItem>
                    <SelectItem value="sales">Sales (Conversions)</SelectItem>
                    <SelectItem value="awareness">Brand Awareness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Locations</Label>
                <Input placeholder="e.g. United States, Canada, London" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age Range (Min)</Label>
                  <Input type="number" placeholder="18" defaultValue={18} />
                </div>
                <div className="space-y-2">
                  <Label>Age Range (Max)</Label>
                  <Input type="number" placeholder="65+" defaultValue={65} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Detailed Targeting (Interests)</Label>
                <Input placeholder="e.g. Technology, Fitness, Small Business" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Daily Budget (USD)</Label>
                <Input type="number" placeholder="50.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input type="date" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-muted/50 text-center">
                <p className="text-muted-foreground mb-4">You can select previously generated AI ad copy or create new ones.</p>
                <Button variant="outline" onClick={() => router.push('/admin/ad-campaigns/generate')}>
                  Go to AI Copy Generator
                </Button>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Landing Page URL</Label>
                <Input type="url" placeholder="https://yourwebsite.com/offer" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-md border p-4 bg-muted/20">
                <h3 className="font-semibold mb-2">Campaign Summary</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-muted-foreground">Platform:</span> <span>Meta Ads</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Objective:</span> <span>Traffic</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Budget:</span> <span>$50.00 / day</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Location:</span> <span>United States</span></li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">By launching this campaign, your linked payment method on the advertising platform will be charged.</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {step < 5 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} className="bg-green-600 hover:bg-green-700">
              Launch Campaign <Play className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
