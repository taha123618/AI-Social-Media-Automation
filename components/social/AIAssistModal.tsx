'use client';

import React, { useState } from 'react';
import {
  X, Sparkles, RefreshCcw, SpellCheck, Maximize2, Minimize2, Zap,
  Image as ImageIcon, Loader2
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MediaFile {
  file?: File;
  preview: string;
  id: string;
}

interface AIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, tone: string, imageUrl?: string) => void;
  onAction: (action: string) => void;
  isProcessing: boolean;
  mediaFiles?: MediaFile[];
  businessId?: string;
  userId?: string;
}

const TONES = [
  { id: 'Neutral', label: 'Neutral', icon: '😐' },
  { id: 'Friendly', label: 'Friendly', icon: '😊' },
  { id: 'Formal', label: 'Formal', icon: '🎩' },
  { id: 'Edgy', label: 'Edgy', icon: '🤘' },
  { id: 'Engaging', label: 'Engaging', icon: '🤝' },
];

const QUICK_ACTIONS = [
  { id: 'rephrase', label: 'Rephrase', icon: RefreshCcw },
  { id: 'grammar', label: 'Fix Spelling and Grammar', icon: SpellCheck },
  { id: 'expand', label: 'Expand', icon: Maximize2 },
  { id: 'shorten', label: 'Shorten', icon: Minimize2 },
  { id: 'simplify', label: 'Simplify', icon: Zap },
];

export function AIAssistModal({
  isOpen,
  onClose,
  onGenerate,
  onAction,
  isProcessing,
  mediaFiles = [],
  businessId,
  userId
}: AIAssistModalProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('Neutral');
  const [view, setView] = useState<'generate' | 'actions'>('generate');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleGenerate = () => {
    onGenerate(prompt, selectedTone, selectedImageUrl || undefined);
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (businessId) formData.append('businessId', businessId);
      if (userId) formData.append('userId', userId);

      const response = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.data?.url) {
        setSelectedImageUrl(data.data.url);
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('[Vision Modal Upload Error]:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
        <DialogHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">AI Assist</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {view === 'generate' ? (
            <>
              {/* Vision Assistant Section */}
              <div className="space-y-3 p-3.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                    AI Vision Uploader
                  </Label>
                  {selectedImageUrl && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      Vision Active
                    </span>
                  )}
                </div>

                {/* Media Selector Grid from parent */}
                {mediaFiles && mediaFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-slate-400">Select an attached image to analyze:</p>
                    <div className="flex flex-wrap gap-2">
                      {mediaFiles.map((media) => {
                        const isSelected = selectedImageUrl === media.preview;
                        return (
                          <button
                            key={media.id}
                            type="button"
                            onClick={() => setSelectedImageUrl(isSelected ? null : media.preview)}
                            className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                            }`}
                          >
                            <img src={media.preview} alt="Attached thumbnail" className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                                <div className="bg-blue-600 text-white rounded-full p-0.5">
                                  <Sparkles className="h-2.5 w-2.5 fill-current" />
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Direct upload within modal */}
                <div className="flex items-center gap-3">
                  {selectedImageUrl ? (
                    <div className="flex items-center gap-3 w-full p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-250 dark:border-slate-800">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={selectedImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                          Ready for analysis
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          AI will describe visuals, offers & CTAs
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedImageUrl(null)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          <span>Uploading image...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 text-slate-400" />
                          <span>Analyze new image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleDirectUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tell AI what to write about</Label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    selectedImageUrl 
                      ? "Optional: Add custom context (e.g. mention our summer clearance event)"
                      : "e.g. Write about a social media strategy for a small-medium business"
                  }
                  className="w-full h-28 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none text-slate-700 dark:text-slate-100 text-sm"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tone</Label>
                <Select value={selectedTone} onValueChange={setSelectedTone}>
                  <SelectTrigger className="w-full h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{TONES.find(t => t.id === selectedTone)?.icon}</span>
                      <SelectValue placeholder="Select tone" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                    {TONES.map((tone) => (
                      <SelectItem key={tone.id} value={tone.id}>
                        <div className="flex items-center gap-2 text-sm">
                          <span>{tone.icon}</span>
                          <span>{tone.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setView('actions')}
                  className="flex-1 h-11 border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm"
                >
                  Quick Actions
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isProcessing || isUploading || (!prompt.trim() && !selectedImageUrl)}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 text-sm"
                >
                  {isProcessing ? 'Thinking...' : 'Generate New'}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-1">
                {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => onAction(action.id)}
                      className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group text-left"
                    >
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <action.icon className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600">
                        {action.label}
                      </span>
                    </button>
                ))}
              </div>

              <Button
                variant="ghost"
                onClick={() => setView('generate')}
                className="w-full text-blue-600 font-bold hover:bg-blue-50 dark:hover:bg-slate-800/50"
              >
                Back to Custom Prompt
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
