'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, BarChart3, Globe, Settings, RefreshCw, ChevronRight, Building2, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const businessTypeOptions = [
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'SALON', label: 'Salon' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'AUTO_REPAIR', label: 'Auto Repair' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'HEALTH_FITNESS', label: 'Health & Fitness' },
  { value: 'MEDICAL_DENTAL', label: 'Medical & Dental' },
  { value: 'LEGAL_FINANCIAL', label: 'Legal & Financial' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'HOME_SERVICES', label: 'Home Services' },
  { value: 'BEAUTY_COSMETICS', label: 'Beauty & Cosmetics' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'PET_SERVICES', label: 'Pet Services' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'EVENT_SERVICES', label: 'Event Services' },
  { value: 'PERSONAL_SERVICES', label: 'Personal Services' },
  { value: 'OTHER', label: 'Other / Local Business' },
];

const getBusinessTypeLabel = (type: string) => {
  const options: Record<string, string> = {
    RESTAURANT: 'Restaurant',
    SALON: 'Salon',
    CONTRACTOR: 'Contractor',
    AUTO_REPAIR: 'Auto Repair',
    REAL_ESTATE: 'Real Estate',
    HEALTH_FITNESS: 'Health & Fitness',
    MEDICAL_DENTAL: 'Medical & Dental',
    LEGAL_FINANCIAL: 'Legal & Financial',
    RETAIL: 'Retail',
    HOME_SERVICES: 'Home Services',
    BEAUTY_COSMETICS: 'Beauty & Cosmetics',
    EDUCATION: 'Education',
    PET_SERVICES: 'Pet Services',
    PHOTOGRAPHY: 'Photography',
    EVENT_SERVICES: 'Event Services',
    PERSONAL_SERVICES: 'Personal Services',
    OTHER: 'Local Business',
  };
  return options[type] || type || 'Local Business';
};

export default function MultiLocationPage() {
  const { businessId, isLoading: businessLoading } = useCurrentBusiness();
  const [locations, setLocations] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', type: 'OTHER' });
  const [isLocating, setIsLocating] = useState(false);
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);
  const [adviceQuery, setAdviceQuery] = useState('');
  const [adviceResult, setAdviceResult] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [baseContent, setBaseContent] = useState('');
  const [customizedContent, setCustomizedContent] = useState('');
  const [brandVoice, setBrandVoice] = useState('Professional yet friendly, focusing on local expertise and quality service.');

  const handleGetCurrentLocation = async () => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      toast.info("Geolocation is not supported. Please enter your location manually.");
      return;
    }

    setIsLocating(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.suburb || '';
              const state = data.address.state || '';
              let formattedAddress = '';
              if (city) {
                formattedAddress = city;
                if (state) formattedAddress += `, ${state}`;
              } else {
                formattedAddress = data.display_name;
              }
              setNewLocation((prev) => ({ ...prev, address: formattedAddress }));
              toast.success(`Location set to: ${formattedAddress}`);
            } else {
              const coordStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setNewLocation((prev) => ({ ...prev, address: coordStr }));
              toast.success(`Coordinates set to: ${coordStr}`);
            }
          } catch {
            const coordStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setNewLocation((prev) => ({ ...prev, address: coordStr }));
            toast.success(`Location set to coordinates: ${coordStr}`);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          setIsLocating(false);
          if (error?.code === 1) {
            toast.info('Location access not permitted. Please enter your location manually.');
          } else if (error?.code === 3) {
            toast.info('Geolocation timed out. Please enter your location manually.');
          } else {
            toast.info('Could not detect location. Please enter it manually.');
          }
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    } catch {
      setIsLocating(false);
      toast.info('Please enter your location manually.');
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchLocations();
      fetchAggregatedAnalytics();
    }
  }, [businessId]);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`/api/multi-location?businessId=${businessId}`);
      const result = await res.json();
      if (result.success) {
        setLocations(result.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAggregatedAnalytics = async () => {
    try {
      const res = await fetch('/api/multi-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_AGGREGATED_ANALYTICS', businessId })
      });
      const result = await res.json();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching aggregated analytics:', error);
    }
  };

  const handleSyncSettings = async () => {
    try {
      const res = await fetch(`/api/settings?type=business`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId as string,
        },
        body: JSON.stringify({ description: brandVoice })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Brand settings synchronized successfully');
      } else {
        toast.error(data.error || 'Failed to sync settings');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error syncing settings');
    }
  };

  const handleAddLocation = async () => {
    setIsAddingLocation(true);
    try {
      const res = await fetch('/api/multi-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_LOCATION',
          businessId,
          locationData: newLocation
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Location added successfully');
        fetchLocations();
        setNewLocation({ name: '', address: '', type: 'OTHER' });
      } else {
        toast.error(result.error || 'Failed to add location');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsAddingLocation(false);
    }
  };

  const handleGetAdvice = async () => {
    if (!adviceQuery) return;
    setIsGettingAdvice(true);
    try {
      const res = await fetch('/api/multi-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GET_STRATEGIC_ADVICE',
          businessId,
          query: adviceQuery
        })
      });
      const result = await res.json();
      if (result.success) {
        setAdviceResult(result.data);
      } else {
        toast.error('Failed to get advice');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsGettingAdvice(false);
    }
  };

  const handleCustomize = async () => {
    if (!selectedLocation || !baseContent) return;
    setIsCustomizing(true);
    try {
      const res = await fetch('/api/multi-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CUSTOMIZE_FOR_LOCATION',
          businessId,
          locationId: selectedLocation.id,
          baseContent
        })
      });
      const result = await res.json();
      if (result.success) {
        setCustomizedContent(result.data);
      } else {
        toast.error('Failed to customize content');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsCustomizing(false);
    }
  };

  if (businessLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">
              Franchise &amp; Branch Distribution
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Multi-Location Hub
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
              Geo-Targeted
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground">
            Enforce corporate brand alignment, localized hashtags, and regional analytics across physical branches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-xl px-3.5 text-xs font-semibold gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>AI Strategist</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Regional Strategist
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Generate cross-location syndication strategies and regional performance optimizations.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="query" className="text-xs font-medium text-foreground">Strategic Query</Label>
                  <Textarea
                    id="query"
                    placeholder="e.g., How can I tailor weekend promotion campaigns for urban vs suburban branches?"
                    value={adviceQuery}
                    onChange={(e) => setAdviceQuery(e.target.value)}
                    className="text-xs min-h-[90px] rounded-xl bg-secondary/30 border-border/80"
                  />
                </div>
                {adviceResult && (
                  <div className="p-3 bg-secondary/40 rounded-xl border border-border/80 max-h-[220px] overflow-y-auto text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {adviceResult}
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button
                  onClick={handleGetAdvice}
                  disabled={isGettingAdvice || !adviceQuery}
                  size="sm"
                  className="h-9 rounded-xl px-4 text-xs font-semibold gap-1.5 shadow-xs"
                >
                  {isGettingAdvice ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span>Generate Strategy</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 rounded-xl px-4 text-xs font-semibold gap-1.5 shadow-xs active:scale-95">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Location</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Add Physical Branch</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Register a physical store, branch, or franchise territory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">Location Name</Label>
                  <Input
                    id="name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="e.g. Downtown Flagship Store"
                    className="h-9 text-xs rounded-xl bg-secondary/30 border-border/80"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="address" className="text-xs font-medium">Address / City</Label>
                  <div className="relative flex items-center">
                    <Input
                      id="address"
                      value={newLocation.address}
                      onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                      placeholder="e.g. Austin, TX"
                      className="h-9 text-xs pr-9 rounded-xl bg-secondary/30 border-border/80"
                    />
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating}
                      className="absolute right-2.5 text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors"
                      title="Detect current GPS location"
                    >
                      {isLocating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="type" className="text-xs font-medium">Industry Category</Label>
                  <Select
                    value={newLocation.type}
                    onValueChange={(value) => setNewLocation({ ...newLocation, type: value })}
                  >
                    <SelectTrigger className="h-9 text-xs rounded-xl bg-secondary/30 border-border/80">
                      <SelectValue placeholder="Select Business Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-card border-border">
                      {businessTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddLocation} disabled={isAddingLocation} size="sm" className="h-9 rounded-xl px-4 text-xs font-semibold">
                  {isAddingLocation && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Register Location
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Total Locations</p>
            <p className="text-2xl font-mono font-bold text-foreground">{analytics.locationCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Total Engagement</p>
            <p className="text-2xl font-mono font-bold text-foreground">{analytics.totalEngagement.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">Total Leads</p>
            <p className="text-2xl font-mono font-bold text-foreground">{analytics.totalLeads.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="h-9 p-1 bg-secondary/50 rounded-xl border border-border/80">
          <TabsTrigger value="list" className="h-7 px-3 text-xs font-semibold rounded-lg gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>Locations ({locations.length})</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="h-7 px-3 text-xs font-semibold rounded-lg gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            <span>Global Brand Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <Dialog key={loc.id}>
                <DialogTrigger asChild>
                  <div
                    className="group p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 shadow-xs transition-all cursor-pointer space-y-4"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setCustomizedContent('');
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono border-border">
                        {getBusinessTypeLabel(loc.businessType)}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {loc.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0 text-primary" />
                        <span className="truncate">{loc.location || 'Address not set'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-border/60">
                      <span className="text-muted-foreground text-[11px] font-mono">Sync Status</span>
                      <Badge variant="default" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        Active
                      </Badge>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">Localize Copy: {loc.name}</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Adapt global social media copy with regional dialect, addresses, and hashtags.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Master Copy</Label>
                      <Textarea
                        placeholder="Paste base marketing message here..."
                        value={baseContent}
                        onChange={(e) => setBaseContent(e.target.value)}
                        className="text-xs min-h-[90px] rounded-xl bg-secondary/30 border-border/80"
                      />
                    </div>
                    {customizedContent && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-primary flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          AI Localized Variation
                        </Label>
                        <div className="p-3 bg-secondary/40 rounded-xl border border-border/80 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                          {customizedContent}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBaseContent('');
                        setCustomizedContent('');
                      }}
                      className="h-8 rounded-lg text-xs"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleCustomize}
                      disabled={isCustomizing || !baseContent}
                      size="sm"
                      className="h-8 rounded-lg text-xs font-semibold gap-1.5"
                    >
                      {isCustomizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      <span>Localize for Branch</span>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}

            {locations.length === 0 && (
              <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-border/80 bg-card/40">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-xs font-bold text-foreground">No branch locations registered</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Add physical branches to start localizing content automatically.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-foreground">Master Brand Voice</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Baseline tone and core principles enforced across all regional branches.
              </p>
            </div>

            <div className="space-y-1.5">
              <Textarea
                className="w-full text-xs p-3 rounded-xl border-border/80 bg-secondary/30 min-h-[110px]"
                placeholder="Describe your brand voice and mandatory guidelines..."
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button size="sm" className="h-9 px-4 rounded-xl text-xs font-semibold shadow-xs" onClick={handleSyncSettings}>
                Save &amp; Sync Across Branches
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
