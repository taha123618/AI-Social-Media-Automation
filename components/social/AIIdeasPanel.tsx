'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, RefreshCw, ChevronRight,
  Zap, Target, BookOpen, Users, TrendingUp, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const FOCUS_OPTIONS = [
  { id: 'offer', label: 'Offers & Deals', icon: Tag, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  { id: 'educational', label: 'Tips & Education', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  { id: 'engagement', label: 'Engagement', icon: Users, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
  { id: 'promo', label: 'Social Proof', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
];

const PLATFORM_OPTIONS = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 'GOOGLE_MY_BUSINESS', 'THREADS'];
const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: 'Instagram', FACEBOOK: 'Facebook', LINKEDIN: 'LinkedIn',
  TIKTOK: 'TikTok', GOOGLE_MY_BUSINESS: 'Google', THREADS: 'Threads',
};

const TONE_COLORS: Record<string, string> = {
  urgent: 'bg-red-50 text-red-600 border-red-100',
  inspiring: 'bg-purple-50 text-purple-600 border-purple-100',
  friendly: 'bg-green-50 text-green-600 border-green-100',
  professional: 'bg-blue-50 text-blue-600 border-blue-100',
  casual: 'bg-orange-50 text-orange-600 border-orange-100',
};

interface PostIdea {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  cta: string;
  tone: string;
  platform: string;
  offerType: string;
}

interface AIIdeasPanelProps {
  businessId: string;
  selectedPlatforms: string[];
  onSelectIdea: (caption: string, hashtags: string[]) => void;
}

export function AIIdeasPanel({ businessId, selectedPlatforms, onSelectIdea }: AIIdeasPanelProps) {
  const [ideas, setIdeas] = useState<PostIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState('offer');
  const [targetPlatform, setTargetPlatform] = useState(selectedPlatforms[0] || 'INSTAGRAM');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const generateIdeas = async () => {
    if (!businessId) return;
    setIsLoading(true);
    setIdeas([]);
    try {
      const res = await fetch('/api/social/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify({ focus: selectedFocus, platforms: [targetPlatform], count: 6 }),
      });
      const data = await res.json();
      if (data.success && data.ideas) {
        setIdeas(data.ideas);
      } else {
        toast.error(data.error || 'Failed to generate ideas');
      }
    } catch {
      toast.error('Could not connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseIdea = (idea: PostIdea) => {
    const hashtagText = idea.hashtags.map((h: string) => `#${h}`).join(' ');
    const fullCaption = `${idea.caption}\n\n${idea.cta}\n\n${hashtagText}`;
    onSelectIdea(fullCaption, idea.hashtags);
    toast.success('Caption loaded into editor!');
  };

  return (
    <div className="space-y-4">
      {/* Focus selector */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Content Focus</p>
        <div className="grid grid-cols-2 gap-2">
          {FOCUS_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedFocus(opt.id)}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
                selectedFocus === opt.id
                  ? `${opt.bg} ${opt.border}`
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              )}
            >
              <opt.icon className={cn('h-4 w-4 shrink-0', selectedFocus === opt.id ? opt.color : 'text-slate-400')} />
              <span className={cn('text-xs font-bold', selectedFocus === opt.id ? 'text-slate-900 dark:text-white' : 'text-slate-500')}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Platform selector */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Target Platform</p>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORM_OPTIONS.map(p => (
            <button
              key={p}
              onClick={() => setTargetPlatform(p)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all',
                targetPlatform === p
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300 hover:text-blue-600'
              )}
            >
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <Button
        onClick={generateIdeas}
        disabled={isLoading}
        className="w-full h-11 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg gap-2"
      >
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Generating ideas...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Generate Post Ideas</>
        )}
      </Button>

      {/* Ideas list */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </motion.div>
        )}

        {!isLoading && ideas.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">{ideas.length} Ideas Generated</p>
              <button onClick={generateIdeas} className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            </div>
            {ideas.map((idea, i) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900"
              >
                <button
                  onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{idea.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded border uppercase', TONE_COLORS[idea.tone?.toLowerCase()] || 'bg-slate-50 text-slate-500 border-slate-100')}>
                          {idea.tone}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">{idea.offerType}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 text-slate-400 transition-transform shrink-0', expandedId === idea.id && 'rotate-90')} />
                </button>

                <AnimatePresence>
                  {expandedId === idea.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {idea.caption}
                          </p>
                        </div>

                        {idea.cta && (
                          <div className="flex items-start gap-2">
                            <Target className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{idea.cta}</p>
                          </div>
                        )}

                        {idea.hashtags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {idea.hashtags.slice(0, 8).map((tag: string) => (
                              <span key={tag} className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <Button
                          onClick={() => handleUseIdea(idea)}
                          className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs gap-2"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          Use this idea
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
