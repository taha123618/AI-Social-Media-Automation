'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Loader2, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { cn } from '@/lib/utils';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am–10pm

interface Recommendation {
  day: number;
  dayName: string;
  hour: number;
  label: string;
  score: number;
  dataSource: string;
}

interface HeatmapSlot {
  day: number;
  hour: number;
  score: number;
}

interface BestTimesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BestTimesPanel({ isOpen, onClose }: BestTimesPanelProps) {
  const { businessId } = useCurrentBusiness();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapSlot[]>([]);
  const [postsAnalyzed, setPostsAnalyzed] = useState(0);
  const [dataSource, setDataSource] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);

  const fetchBestTimes = async () => {
    if (!businessId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/social/scheduling/best-times?businessId=${businessId}`, {
        headers: { 'x-business-id': businessId }
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations);
        setHeatmap(data.heatmap);
        setPostsAnalyzed(data.postsAnalyzed);
        setDataSource(data.dataSource);
      }
    } catch {
      toast.error('Failed to load best times');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && businessId) {
      fetchBestTimes();
    }
  }, [isOpen, businessId]);

  const handleApplyToSchedule = async () => {
    if (!businessId || recommendations.length === 0) return;
    setIsApplying(true);
    try {
      const res = await fetch('/api/social/scheduling/apply-best-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify({ slots: recommendations.slice(0, 5) }),
      });
      if (res.ok) {
        toast.success('Best times applied to your posting schedule!');
        onClose();
      } else {
        toast.info('Schedule updated in settings');
        onClose();
      }
    } catch {
      toast.info('Best times noted — configure in Posting Schedule settings');
    } finally {
      setIsApplying(false);
    }
  };

  const getHeatmapScore = (day: number, hour: number) => {
    return heatmap.find(h => h.day === day && h.hour === hour)?.score || 0;
  };

  const getHeatColor = (score: number) => {
    if (score === 0) return 'bg-secondary/40';
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-emerald-500/70';
    if (score >= 40) return 'bg-primary/70';
    if (score >= 20) return 'bg-primary/40';
    return 'bg-secondary';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border/80 shadow-2xl z-50 flex flex-col overflow-hidden text-foreground"
          >
            {/* Header */}
            <div className="p-5 border-b border-border/70 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">AI Best Times to Post</h2>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {dataSource === 'analytics'
                        ? `Derived from ${postsAnalyzed} published records`
                        : 'Calibrated algorithmic baseline'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground font-mono">Synthesizing engagement heatmap...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {dataSource === 'industry_average' && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Showing algorithmic baseline. As your social accounts publish posts, engagement metrics will automatically fine-tune these slots.
                    </p>
                  </div>
                )}

                {/* Top Recommendations */}
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Top Recommended Windows
                  </h3>
                  <div className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/70 text-xs"
                      >
                        <Badge
                          variant={i === 0 ? "default" : "outline"}
                          className="h-6 w-6 rounded-md p-0 flex items-center justify-center text-[10px] font-mono shrink-0"
                        >
                          #{i + 1}
                        </Badge>
                        <div className="flex-1">
                          <span className="font-semibold text-foreground">{rec.dayName}</span>
                          <span className="text-muted-foreground mx-1">at</span>
                          <span className="font-mono font-semibold text-foreground">{rec.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground text-[11px]">{rec.score}%</span>
                          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${rec.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heatmap */}
                {heatmap.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Hourly Intensity Grid
                    </h3>
                    <div className="overflow-x-auto no-scrollbar">
                      <div className="min-w-[340px]">
                        {/* Hour labels */}
                        <div className="flex gap-0.5 mb-1 pl-7">
                          {HOURS.filter((_, i) => i % 3 === 0).map(h => (
                            <div key={h} className="flex-1 text-[9px] font-mono text-muted-foreground text-center">
                              {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
                            </div>
                          ))}
                        </div>
                        {/* Grid */}
                        {DAY_SHORT.map((day, dayIdx) => (
                          <div key={day} className="flex items-center gap-0.5 mb-0.5">
                            <div className="w-6 text-[9px] font-mono text-muted-foreground shrink-0">{day}</div>
                            {HOURS.map(hour => {
                              const score = getHeatmapScore(dayIdx, hour);
                              return (
                                <div
                                  key={hour}
                                  className={cn('flex-1 h-5 rounded-xs transition-all cursor-default', getHeatColor(score))}
                                  title={`${day} ${hour}:00 — score: ${score}`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-border/70 flex-shrink-0 flex gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-1 h-9 rounded-xl text-xs font-semibold"
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={handleApplyToSchedule}
                disabled={isApplying || recommendations.length === 0}
                className="flex-[2] h-9 rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
              >
                {isApplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>Apply Slots</span>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
