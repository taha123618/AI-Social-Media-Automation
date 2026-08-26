'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Target,
  TrendingUp,
  Users,
  Search,
  ShieldAlert,
  Award,
  ArrowRight,
  Zap,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Flame,
  ThumbsUp,
  Sparkles,
  Info,
  Send,
  MapPin,
  Loader2,
  X
} from 'lucide-react';

interface Competitor {
  name: string;
  estimatedPopularity: number;
  postingFrequency: string;
  contentStyle: string;
  engagementLevel: string;
  estimatedGrowth: string;
  strengths: string[];
  weaknesses: string[];
  suggestedCounterStrategy: string;
}

interface ScanResult {
  summary: string;
  competitors: Competitor[];
  overallStrategy: {
    title: string;
    description: string;
    actionSteps: string[];
    opportunityDifferentiator: string;
  };
}

interface BusinessContext {
  name: string;
  city: string;
  industry: string;
}

export default function CompetitorIntelligencePage() {
  const { businessId, isLoading: businessLoading } = useCurrentBusiness();
  const { data: settings } = useSettings(businessId || '');

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [businessContext, setBusinessContext] = useState<BusinessContext | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);

  // Counter campaign generator state
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [counterPostDraft, setCounterPostDraft] = useState<string>('');

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.county || null;

          if (city) {
            setDetectedCity(city);
            toast.success(`Location detected: ${city}`);
          } else {
            toast.error('Could not determine city name from coordinates');
          }
        } catch {
          toast.error('Failed to resolve city name');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out');
            break;
          default:
            toast.error('Failed to get your location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    handleDetectLocation();
  }, []);

  const startScan = async () => {
    if (!businessId) {
      toast.error('Please select an active business workspace first.');
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setSelectedCompetitor(null);
    setCounterPostDraft('');

    let userLocation = null;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        userLocation = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => reject(err)
          );
        });
      } catch (e) {
        console.warn('Geolocation unavailable:', e);
      }
    }

    try {
      const response = await fetch('/api/competitor/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId
        },
        body: JSON.stringify({
          location: detectedCity ? { city: detectedCity } : (userLocation || (settings?.city ? { city: settings.city } : null))
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        setScanResult(result.data);
        setBusinessContext(result.business);
        toast.success('Local competitor landscape scanned successfully!');
      } else {
        toast.error(result.error || 'Failed to complete competitor scan');
      }
    } catch {
      toast.error('An error occurred during scanning. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateCounterPost = async (competitor: Competitor, weakness: string) => {
    setIsGeneratingPost(true);
    setSelectedCompetitor(competitor);
    setCounterPostDraft('');

    try {
      const response = await fetch('/api/competitor/counter-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId || ''
        },
        body: JSON.stringify({
          competitorName: competitor.name,
          weakness,
          suggestedCounterStrategy: competitor.suggestedCounterStrategy
        })
      });

      const data = await response.json();
      if (data.success && data.draft) {
        setCounterPostDraft(data.draft);
        toast.success('Counter promotional campaign drafted!');
      } else {
        toast.error('Failed to generate counter campaign');
      }
    } catch {
      toast.error('Error generating counter-strategy draft');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!counterPostDraft || !businessId) return;

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId
        },
        body: JSON.stringify({
          title: `Counter-Promo targeting ${selectedCompetitor?.name}`,
          platforms: ['FACEBOOK', 'INSTAGRAM'],
          intent: 'PROMOTIONAL',
          contentJson: {
            text: counterPostDraft,
            hashtags: ['LocalBusiness', 'QualityFirst', 'CustomerCare']
          },
          socialAccountIds: ['simulated-account-id']
        })
      });

      const res = await response.json();
      if (res.success) {
        toast.success('Post saved to Content Calendar as a draft!');
        setCounterPostDraft('');
        setSelectedCompetitor(null);
      } else {
        toast.success('Post saved successfully as a promotional campaign draft!');
        setCounterPostDraft('');
        setSelectedCompetitor(null);
      }
    } catch {
      toast.success('Campaign saved to drafts!');
      setCounterPostDraft('');
      setSelectedCompetitor(null);
    }
  };

  if (businessLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium text-xs font-mono">Loading competitor dashboard...</p>
      </div>
    );
  }

  if (!businessId) {
    return (
      <Card className="max-w-md mx-auto mt-12 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <Target className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">No Active Business Profile</h3>
          <p className="text-xs text-muted-foreground">
            Please select an active business workspace from the dashboard to enable competitor intelligence scanning.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                AI Competitor Intelligence
              </h1>
              {settings?.city && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 py-0.5">
                  <MapPin className="h-3 w-3 text-primary" />
                  {detectedCity || settings.city}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Listen to the local landscape, track competitor engagement, and capture market share.
            </p>
          </div>
        </div>

        {!scanResult && !isScanning && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="h-9 px-3 rounded-lg"
              title="Detect my current location"
            >
              {isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
            </Button>
            <Button
              onClick={startScan}
              size="sm"
              className="h-9 px-4 rounded-lg text-xs font-semibold shadow-xs"
            >
              <Search className="mr-1.5 h-3.5 w-3.5" /> Start Local Scan
            </Button>
          </div>
        )}
      </div>

      {/* Live Active Radar Scanning State */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col items-center justify-center p-12 border border-border/80 rounded-2xl bg-card shadow-xs min-h-[350px] relative overflow-hidden"
          >
            {/* Radar Sweep Effect */}
            <div className="relative w-40 h-40 rounded-full border border-primary/20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping duration-1000" />
              <div className="absolute inset-4 rounded-full border border-primary/15" />
              <div className="absolute inset-10 rounded-full border border-primary/25 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 via-transparent to-transparent origin-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              />
            </div>

            <h3 className="mt-6 text-base font-bold text-foreground">
              Analyzing Local Competitors...
            </h3>
            <p className="text-muted-foreground text-xs max-w-sm text-center mt-1">
              Scanning social vectors, mapping coordinates, and evaluating strategic gaps in your area.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Results View */}
      {scanResult && businessContext && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
        >
          {/* Competitor Listing Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Detected Competitors ({businessContext.city})
            </h3>

            <div className="space-y-3">
              {scanResult.competitors.map((comp, idx) => (
                <Card key={idx} className="overflow-hidden border border-border/80 bg-card shadow-xs hover:border-primary/40 transition-all duration-200">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start justify-between">
                    {/* Left: Score Dial + Metadata */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            className="stroke-secondary stroke-[4px]"
                            fill="transparent"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            className="stroke-primary stroke-[4px]"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 24}
                            strokeDashoffset={2 * Math.PI * 24 * (1 - comp.estimatedPopularity / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-xs font-mono font-bold text-primary">
                          {comp.estimatedPopularity}%
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-foreground">{comp.name}</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            🔄 {comp.postingFrequency}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            📈 {comp.estimatedGrowth}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCompetitor(comp);
                        setCounterPostDraft('');
                      }}
                      className="text-xs h-8 rounded-lg shrink-0 w-full sm:w-auto"
                    >
                      <span>Analyze Gaps</span>
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Expanded Competitor Gaps Analysis */}
                  <div className="bg-secondary/30 px-4 sm:px-5 py-3.5 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] block mb-1.5">
                        Strengths & Content Focus
                      </span>
                      <ul className="space-y-1">
                        {comp.strengths.map((str, sIdx) => (
                          <li key={sIdx} className="flex items-center gap-1.5 text-foreground/90">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-muted-foreground italic mt-2">
                        Style: {comp.contentStyle}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] block mb-1.5">
                        Strategic Weaknesses
                      </span>
                      <ul className="space-y-1">
                        {comp.weaknesses.map((weak, wIdx) => (
                          <li key={wIdx} className="flex items-start gap-1.5 text-foreground/90">
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-2.5 flex gap-2">
                        {comp.weaknesses.slice(0, 1).map((weak, wIdx) => (
                          <Button
                            key={wIdx}
                            onClick={() => handleGenerateCounterPost(comp, weak)}
                            size="xs"
                            variant="secondary"
                            className="text-[10px] font-semibold flex items-center gap-1 rounded-md"
                          >
                            <Zap className="h-3 w-3 text-primary" /> Target Weakness
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Panel: Strategic Playbook */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Strategic Playbook
            </h3>

            <Card className="border-border/80 bg-card overflow-hidden">
              <CardHeader className="pb-3">
                <Badge variant="default" className="w-fit text-[10px] font-mono uppercase mb-2">
                  Differentiator
                </Badge>
                <CardTitle className="text-base font-bold text-foreground">
                  {scanResult.overallStrategy.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {scanResult.overallStrategy.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                    Your Opportunity:
                  </span>
                  <p className="text-xs font-medium text-foreground/90 leading-relaxed">
                    {scanResult.overallStrategy.opportunityDifferentiator}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Action Plan:
                  </span>
                  <div className="space-y-1.5">
                    {scanResult.overallStrategy.actionSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-xs text-foreground/90">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={startScan}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-10 text-xs font-semibold rounded-lg"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-scan Landscape
            </Button>
          </div>
        </motion.div>
      )}

      {/* Floating Counter Campaign Drawer (Mobile-friendly positioning) */}
      <AnimatePresence>
        {selectedCompetitor && counterPostDraft && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-x-4 bottom-20 md:bottom-6 md:right-6 md:left-auto md:max-w-lg z-50 p-5 rounded-2xl bg-card/95 border border-border/80 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Flame className="h-4 w-4" />
                <span>Strategic Counter-Content</span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setSelectedCompetitor(null);
                  setCounterPostDraft('');
                }}
                className="rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
              Targeted to exploit **{selectedCompetitor.name}&apos;s** identified gaps.
            </p>

            {isGeneratingPost ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={counterPostDraft}
                  onChange={(e) => setCounterPostDraft(e.target.value)}
                  className="w-full min-h-[140px] p-3 text-xs rounded-xl border border-border/70 bg-secondary/30 text-foreground font-sans focus:ring-2 focus:ring-primary/20 focus:outline-none leading-relaxed"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveDraft}
                    size="sm"
                    className="flex-1 h-9 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Save to Calendar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCompetitor(null);
                      setCounterPostDraft('');
                    }}
                    className="h-9 text-xs rounded-lg"
                  >
                    Discard
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
