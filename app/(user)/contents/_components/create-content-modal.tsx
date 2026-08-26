'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Save, Sparkles, Zap, ShieldCheck, PenLine, ChevronRight, Hash, Layers } from 'lucide-react';
import { FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import { createContentDraft, updateContentDraft, generateContentWithAI } from '../actions/mutations';
import { toast } from 'sonner';
import { ContentIntent, Platform } from '@/app/generated/prisma/enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CreateContentModalProps {
  onClose: () => void;
  businessId: string;
  initialData?: any;
  brandProfile?: {
    brandTone?: string;
    usp?: string;
    colorPalette?: string[];
  };
}

const PLATFORM_META: Record<string, { label: string; icon: any; color: string; activeClass: string }> = {
  LINKEDIN: {
    label: 'LinkedIn',
    icon: FaLinkedin,
    color: '#0a66c2',
    activeClass: 'bg-[#0a66c2]/15 text-[#0a66c2] border-[#0a66c2]/40 shadow-xs'
  },
  TWITTER: {
    label: 'X (Twitter)',
    icon: FaXTwitter,
    color: '#000000',
    activeClass: 'bg-foreground/15 text-foreground border-foreground/30 shadow-xs'
  },
  INSTAGRAM: {
    label: 'Instagram',
    icon: FaInstagram,
    color: '#e4405f',
    activeClass: 'bg-[#e4405f]/15 text-[#e4405f] border-[#e4405f]/40 shadow-xs'
  },
  FACEBOOK: {
    label: 'Facebook',
    icon: FaFacebook,
    color: '#1877f2',
    activeClass: 'bg-[#1877f2]/15 text-[#1877f2] border-[#1877f2]/40 shadow-xs'
  },
};

export function CreateContentModal({ onClose, businessId, initialData, brandProfile }: CreateContentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [intent, setIntent] = useState<ContentIntent>(initialData?.intent || 'ENGAGEMENT');
  const [platforms, setPlatforms] = useState<Platform[]>(initialData?.platforms || ['LINKEDIN']);
  const [customPrompt, setCustomPrompt] = useState(initialData?.customPrompt || '');
  const [contentText, setContentText] = useState(() => {
    if (initialData?.content) return initialData.content;
    if (initialData?.contentJson?.text) return initialData.contentJson.text;
    if (initialData?.contentJson?.caption) return initialData.contentJson.caption;
    return '';
  });
  const [topic, setTopic] = useState(initialData?.title || '');
  const [generationMode, setGenerationMode] = useState<'manual' | 'ai'>('manual');
  const [brandAlignmentScore, setBrandAlignmentScore] = useState<number>(75);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setIntent(initialData.intent || 'ENGAGEMENT');
      setPlatforms(initialData.platforms || ['LINKEDIN']);
      setCustomPrompt(initialData.customPrompt || '');

      const content = initialData.content ||
        initialData.contentJson?.text ||
        initialData.contentJson?.caption ||
        '';
      setContentText(content);
      setTopic(initialData.title || '');
    }
  }, [initialData]);

  const togglePlatform = (p: Platform) => {
    setPlatforms(platforms.includes(p) ? platforms.filter(x => x !== p) : [...platforms, p]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !contentText.trim()) {
      toast.error('Please enter a title or content');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await updateContentDraft(initialData.id, {
          title,
          contentText,
          intent,
          platforms,
          customPrompt
        });
        toast.success('Draft updated successfully');
      } else {
        await createContentDraft({
          businessId,
          title: title || topic || 'Untitled Draft',
          intent,
          platforms,
          customPrompt: customPrompt || contentText
        });
        toast.success('Draft created successfully');
      }
      window.dispatchEvent(new CustomEvent('drafts-updated'));
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for AI generation');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateContentWithAI({
        businessId,
        topic,
        intent,
        platforms,
        customInstructions: customPrompt
      });

      if (result.success && result.data) {
        setContentText(result.data.content || '');
        if (!title.trim()) setTitle(result.data.title || topic);
        toast.success('Content generated with brand grounding!');
      } else {
        toast.error(result.error || 'Failed to generate content');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateBrandAlignment = () => {
    const factors = [
      brandProfile?.brandTone ? 25 : 15,
      brandProfile?.usp ? 25 : 20,
      customPrompt ? 25 : 20,
      platforms.length > 0 ? 25 : 20
    ];
    return factors.reduce((sum, factor) => sum + factor, 0);
  };

  useEffect(() => {
    setBrandAlignmentScore(calculateBrandAlignment());
  }, [brandProfile, customPrompt, platforms]);

  const wordCount = contentText.trim() ? contentText.trim().split(/\s+/).length : 0;
  const charCount = contentText.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden"
      >
        {/* Top ambient accent glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border/60 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                {initialData ? 'Edit Content Draft' : 'Create Content Draft'}
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  v2.0
                </Badge>
              </h2>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-500 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  RAG Grounded
                </span>
                <span>•</span>
                <span className="font-mono text-primary font-medium">
                  {brandAlignmentScore}% Brand Match
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 relative z-10 custom-scrollbar">
          {/* Mode Switcher */}
          <div className="p-1 rounded-xl bg-secondary/50 border border-border/60 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setGenerationMode('manual')}
              className={cn(
                'py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2',
                generationMode === 'manual'
                  ? 'bg-card text-foreground shadow-xs border border-border/70'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <PenLine className="h-3.5 w-3.5" />
              <span>Manual Authoring</span>
            </button>
            <button
              type="button"
              onClick={() => setGenerationMode('ai')}
              className={cn(
                'py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2',
                generationMode === 'ai'
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Autonomous AI Swarm</span>
            </button>
          </div>

          <form id="content-modal-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Title / Topic */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {generationMode === 'ai' ? 'Campaign Topic or Seed Angle' : 'Draft Title'}
              </label>
              <Input
                type="text"
                value={generationMode === 'ai' ? topic : title}
                onChange={(e) => {
                  if (generationMode === 'ai') {
                    setTopic(e.target.value);
                    if (!title) setTitle(e.target.value);
                  } else {
                    setTitle(e.target.value);
                  }
                }}
                placeholder={generationMode === 'ai' ? "e.g. 5 lessons from building an AI-first marketing workflow..." : "e.g. Q3 Growth Retrospective"}
                className="h-10 text-xs rounded-xl bg-secondary/30 border-border/70 focus-visible:ring-primary/30"
              />
            </div>

            {/* Strategy & Platform Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Marketing Intent</label>
                <select
                  value={intent}
                  onChange={(e) => setIntent(e.target.value as ContentIntent)}
                  className="w-full h-10 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="ENGAGEMENT">Engagement & Discussion</option>
                  <option value="SALES">Product Direct Sales</option>
                  <option value="EDUCATION">Thought Leadership & Edu</option>
                  <option value="BRAND_AWARENESS">Brand Awareness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Publish Channels</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK'] as Platform[]).map((p) => {
                    const isSelected = platforms.includes(p);
                    const meta = PLATFORM_META[p] || { label: p, icon: Layers, activeClass: 'bg-primary text-primary-foreground' };
                    const Icon = meta.icon;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={cn(
                          'h-10 px-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5',
                          isSelected
                            ? meta.activeClass
                            : 'border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden sm:inline text-[11px]">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Instructions / Guardrails */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                AI Directives & Guardrails <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Specific tone nuances, forbidden competitor keywords, or call-to-action constraints..."
                rows={2}
                className="text-xs rounded-xl bg-secondary/30 border-border/70 resize-none focus-visible:ring-primary/30"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">Content Copy</label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {wordCount} words • {charCount} chars
                </span>
              </div>
              <Textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Draft copy will appear here or write your custom post..."
                rows={5}
                className="text-xs rounded-xl bg-secondary/30 border-border/70 resize-none font-sans leading-relaxed focus-visible:ring-primary/30"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-card/50 flex items-center justify-between shrink-0 relative z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs rounded-xl text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {generationMode === 'ai' ? (
              <Button
                type="button"
                size="sm"
                onClick={handleAIGenerate}
                disabled={isGenerating || !topic.trim()}
                className="h-9 px-4 text-xs font-semibold rounded-xl gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95 active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" />
                    <span>Generate Draft</span>
                  </>
                )}
              </Button>
            ) : null}

            <Button
              type="submit"
              form="content-modal-form"
              disabled={isSubmitting}
              size="sm"
              className="h-9 px-4 text-xs font-semibold rounded-xl gap-1.5 shadow-sm active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>{initialData ? 'Update Draft' : 'Save Draft'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
