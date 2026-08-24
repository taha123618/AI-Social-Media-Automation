'use client';

import { useState, useEffect } from 'react';
import { X, Loader, Save, Sparkles, Zap, Target, Brain, Gauge, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { createContentDraft, updateContentDraft, generateContentWithAI } from '../actions/mutations';
import { toast } from 'sonner';
import { ContentIntent, Platform } from '@/app/generated/prisma/enums';

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
  const [brandAlignmentScore, setBrandAlignmentScore] = useState<number | null>(null);

  // Use useEffect to ensure we always capture the latest initialData if the modal remains mounted
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setIntent(initialData.intent || 'ENGAGEMENT');
      setPlatforms(initialData.platforms || ['LINKEDIN']);
      setCustomPrompt(initialData.customPrompt || '');

      // Load content from multiple possible sources
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
    if (!title) return toast.error('Title is required');
    if (platforms.length === 0) return toast.error('At least one platform is required');

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await updateContentDraft(initialData.id, {
          title,
          intent,
          platforms,
          customPrompt,
          contentText,
        });
        toast.success('Content draft updated');
      } else {
        await createContentDraft({
          title,
          intent,
          platforms,
          customPrompt,
          businessId,
          contentText, // Will add it to createContentDraft too for consistency
        } as any);
        toast.success('Content draft created');
      }
      onClose();
      window.dispatchEvent(new CustomEvent('drafts-updated'));
    } catch (error) {
      toast.error('Failed to create/update content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!topic.trim()) return toast.error('Please enter a topic for AI generation');
    if (platforms.length === 0) return toast.error('At least one platform is required');

    setIsGenerating(true);
    try {
      const result = await generateContentWithAI({
        businessId,
        intent,
        platforms,
        topic: topic.trim(),
        customInstructions: customPrompt
      });

      toast.success('AI content generated successfully!');
      // Close modal and refresh content list with React Query cache invalidate
      onClose();
      window.dispatchEvent(new CustomEvent('drafts-updated'));
    } catch (error) {
      toast.error('Failed to generate AI content');
      console.error('AI Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateBrandAlignment = () => {
    const factors = [
      brandProfile?.brandTone ? 25 : 0,
      brandProfile?.usp ? 25 : 0,
      customPrompt ? 25 : 0,
      platforms.length > 0 ? 25 : 0
    ];
    return factors.reduce((sum, factor) => sum + factor, 0);
  };

  useEffect(() => {
    setBrandAlignmentScore(calculateBrandAlignment());
  }, [brandProfile, customPrompt, platforms]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {initialData ? 'Edit' : 'Create'} Content
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">Brand Aligned</span>
                </div>
                {brandAlignmentScore !== null && (
                  <div className="flex items-center gap-1">
                    <Gauge className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{brandAlignmentScore}% Alignment</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Generation Mode Toggle */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setGenerationMode('manual')}
              className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${generationMode === 'manual'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
            >
              Manual Draft
            </button>
            <button
              type="button"
              onClick={() => setGenerationMode('ai')}
              className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${generationMode === 'ai'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
            >
              <Zap className="h-4 w-4" />
              AI Generation
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {generationMode === 'manual'
              ? 'Write your own content with brand guidance'
              : 'Generate brand-aligned content with AI assistance'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Content Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title of your post"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            {generationMode === 'ai' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Topic for AI Generation</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What should the AI write about?"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Goal / Intent</label>
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value as ContentIntent)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950 outline-none"
              >
                <option value="ENGAGEMENT">Engagement</option>
                <option value="SALES">Sales</option>
                <option value="EDUCATION">Education</option>
                <option value="BRAND_AWARENESS">Brand Awareness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'FACEBOOK'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p as Platform)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${platforms.includes(p as Platform)
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-800'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Custom Prompt / Instructions</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Give specific instructions to AI..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Draft Content Text</label>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Write your draft content here..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 py-3 font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={generationMode === 'ai' ? handleAIGenerate : handleSubmit}
              disabled={generationMode === 'ai' ? isGenerating || !topic.trim() : isSubmitting}
              className={`flex-1 rounded-2xl py-3 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${generationMode === 'ai'
                ? 'bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-95 disabled:opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50'}`}
            >
              {generationMode === 'ai' ? (
                isGenerating ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Generate with AI
                  </>
                )
              ) : (
                isSubmitting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {initialData ? 'Update Draft' : 'Create Draft'}
                  </>
                )
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
