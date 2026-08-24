'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, BarChart3, Globe, Settings, RefreshCw, ChevronRight, Building2, Sparkles, MessageSquare, Plus, Loader2 } from 'lucide-react';
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
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
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
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          const coordStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setNewLocation((prev) => ({ ...prev, address: coordStr }));
          toast.success(`Location set to coordinates: ${coordStr}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error?.message);
        setIsLocating(false);
        if (error?.code === 3) {
          toast.error('Geolocation timed out. Please enter your location manually.');
        } else {
          toast.error('Could not get your location. Please enter it manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsCustomizing(false);
    }
  };

  if (businessLoading || isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Globe className="h-10 w-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Multi-Location Hub</h1>
            <p className="text-slate-500">Manage brand consistency and performance across all business locations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                <Sparkles className="h-4 w-4" />
                Get Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI Multi-Location Strategist
                </DialogTitle>
                <DialogDescription>
                  Ask our AI agent for strategic advice on managing your locations.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="query">What would you like to know?</Label>
                  <Textarea
                    id="query"
                    placeholder="e.g., How can I improve engagement at my underperforming locations?"
                    value={adviceQuery}
                    onChange={(e) => setAdviceQuery(e.target.value)}
                  />
                </div>
                {adviceResult && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 max-h-[300px] overflow-y-auto">
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{adviceResult}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleGetAdvice}
                  disabled={isGettingAdvice || !adviceQuery}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGettingAdvice ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Strategy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={(open) => {
            if (open) {
              handleGetCurrentLocation();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                  Enter the details of the new business location.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="e.g. Downtown Office"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address / City</Label>
                  <div className="relative flex items-center">
                    <Input
                      id="address"
                      value={newLocation.address}
                      onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                      placeholder="e.g. New York, NY"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating}
                      className="absolute right-3 text-slate-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
                      title="Detect current location"
                    >
                      {isLocating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Business Type</Label>
                  <Select
                    value={newLocation.type}
                    onValueChange={(value) => setNewLocation({ ...newLocation, type: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Business Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddLocation} disabled={isAddingLocation} className="bg-blue-600">
                  {isAddingLocation && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Add Location
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-600 font-semibold uppercase text-[10px] tracking-wider">Total Locations</CardDescription>
              <CardTitle className="text-3xl font-bold">{analytics.locationCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-600 font-semibold uppercase text-[10px] tracking-wider">Total Engagement</CardDescription>
              <CardTitle className="text-3xl font-bold">{analytics.totalEngagement.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-600 font-semibold uppercase text-[10px] tracking-wider">Total Leads</CardDescription>
              <CardTitle className="text-3xl font-bold">{analytics.totalLeads.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list" className="gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Global Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations?.map((loc) => (
              <Dialog key={loc.id}>
                <DialogTrigger asChild>
                  <Card
                    className="group hover:shadow-lg transition-all cursor-pointer border-slate-200"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setCustomizedContent('');
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">{getBusinessTypeLabel(loc.businessType)}</Badge>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <CardTitle>{loc.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {loc.location || 'Address not set'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-100">
                        <span className="text-slate-500">Status</span>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Customize Content for {loc.name}</DialogTitle>
                    <DialogDescription>
                      Adapt your global content to fit this specific location's local flavor.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Base Content</Label>
                      <Textarea
                        placeholder="Paste your global social media post here..."
                        value={baseContent}
                        onChange={(e) => setBaseContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    {customizedContent && (
                      <div className="space-y-2">
                        <Label className="text-blue-600 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI Customized Version
                        </Label>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm whitespace-pre-wrap">
                          {customizedContent}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBaseContent('');
                        setCustomizedContent('');
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleCustomize}
                      disabled={isCustomizing || !baseContent}
                      className="bg-blue-600"
                    >
                      {isCustomizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Adapt for Location
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}
            {locations.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No additional locations found</p>
                <Button variant="link" className="text-blue-600 mt-2">Create your first branch</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Brand Settings</CardTitle>
              <CardDescription>Changes here will be applied to all business locations unless overridden.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Master Brand Voice</label>
                <textarea
                  className="w-full p-3 rounded-xl border border-slate-200 min-h-[100px]"
                  placeholder="Describe your brand voice..."
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSyncSettings}>Save & Sync All</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
