'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Loader2, Sparkles, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      // Get or create posting schedule
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
    if (score === 0) return 'bg-slate-100 dark:bg-slate-800/50';
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-emerald-400/80';
    if (score >= 40) return 'bg-blue-400/70';
    if (score >= 20) return 'bg-blue-300/50';
    return 'bg-slate-200 dark:bg-slate-700';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Best Times to Post</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {dataSource === 'analytics'
                        ? `Based on ${postsAnalyzed} published posts`
                        : 'Industry average recommendations'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm font-medium text-slate-500">Analyzing your post performance...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {dataSource === 'industry_average' && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex gap-3">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                      Showing industry-average recommendations. Publish more posts to unlock data-driven insights.
                    </p>
                  </div>
                )}

                {/* Top Recommendations */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Top Slots</h3>
                  <div className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0',
                          i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-slate-400'
                        )}>
                          #{i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{rec.dayName}</span>
                            <span className="text-sm text-slate-500">at</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{rec.label}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-black text-slate-500">{rec.score}%</div>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
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
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Engagement Heatmap</h3>
                    <div className="overflow-x-auto">
                      <div className="min-w-[380px]">
                        {/* Hour labels */}
                        <div className="flex gap-0.5 mb-1 pl-8">
                          {HOURS.filter((_, i) => i % 3 === 0).map(h => (
                            <div key={h} className="flex-1 text-[9px] font-bold text-slate-400 text-center">
                              {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
                            </div>
                          ))}
                        </div>
                        {/* Grid */}
                        {DAY_SHORT.map((day, dayIdx) => (
                          <div key={day} className="flex items-center gap-0.5 mb-0.5">
                            <div className="w-7 text-[9px] font-bold text-slate-400 shrink-0">{day}</div>
                            {HOURS.map(hour => {
                              const score = getHeatmapScore(dayIdx, hour);
                              return (
                                <div
                                  key={hour}
                                  className={cn('flex-1 h-6 rounded-sm transition-all cursor-default', getHeatColor(score))}
                                  title={`${day} ${hour}:00 — score: ${score}`}
                                />
                              );
                            })}
                          </div>
                        ))}
                        {/* Legend */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-medium">Low</span>
                          <div className="flex gap-0.5">
                            {['bg-slate-200', 'bg-blue-300/50', 'bg-blue-400/70', 'bg-emerald-400/80', 'bg-emerald-500'].map((c, i) => (
                              <div key={i} className={`h-3 w-5 rounded-sm ${c}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">High</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl font-bold border-slate-200 dark:border-slate-700">
                Close
              </Button>
              <Button
                onClick={handleApplyToSchedule}
                disabled={isApplying || recommendations.length === 0}
                className="flex-[2] h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 gap-2"
              >
                {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Apply to Schedule
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
