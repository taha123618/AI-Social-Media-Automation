'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ImageIcon, Loader2, Download, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { pollJobStatus } from '@/lib/social-ai-utils';

interface AIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

export function AIImageModal({ isOpen, onClose, onSelect }: AIImageModalProps) {
  const { businessId } = useCurrentBusiness();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'SQUARE' | 'LANDSCAPE'>('SQUARE');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const response = await fetch('/api/social/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(businessId && { 'x-business-id': businessId })
        },
        body: JSON.stringify({
          action: 'generate-image',
          input: { prompt, aspectRatio }
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.imageUrl) {
          setGeneratedImage(data.imageUrl);
          toast.success('Image generated successfully!');
          setIsGenerating(false);
        }
        // TODO: implement Social Queue work
        else if (data.jobId) {
          toast.info('Image generation queued...');
          pollJobStatus({
            jobId: data.jobId,
            businessId,
            onSuccess: (result) => {
              if (result.imageUrl) {
                setGeneratedImage(result.imageUrl);
                toast.success('Image generated successfully!');
              }
            },
            onFinished: () => setIsGenerating(false)
          });
        }
      } else {
        throw new Error(data.error || 'Failed to generate image');
        setIsGenerating(false);
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsGenerating(false);
    }
  };

  const handleSelect = () => {
    if (generatedImage) {
      onSelect(generatedImage);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-linear-to-br from-white via-white to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-purple-900/20 border border-purple-200/50 dark:border-purple-800/50 rounded-2xl shadow-2xl backdrop-blur-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            <motion.div
              className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            AI Image Studio
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
            Transform your ideas into stunning visuals with AI. Describe what you want to create.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Creative Vision</label>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A minimalist workspace with floating holographic displays, soft purple ambient lighting, ultra-modern architecture, photorealistic, 8k resolution..."
              className="w-full h-36 p-4 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
            />
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Photorealistic</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">8K Quality</span>
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">Professional</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-white" />
              </div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Canvas Format</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant={aspectRatio === 'SQUARE' ? 'default' : 'outline'}
                  className={`w-full h-16 rounded-xl transition-all ${aspectRatio === 'SQUARE'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                    }`}
                  onClick={() => setAspectRatio('SQUARE')}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 border-2 border-current rounded" />
                    <span className="text-xs font-medium">Square (1:1)</span>
                  </div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant={aspectRatio === 'LANDSCAPE' ? 'default' : 'outline'}
                  className={`w-full h-16 rounded-xl transition-all ${aspectRatio === 'LANDSCAPE'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                    }`}
                  onClick={() => setAspectRatio('LANDSCAPE')}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-6 border-2 border-current rounded" />
                    <span className="text-xs font-medium">Wide (16:9)</span>
                  </div>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="aspect-video bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-800 dark:to-purple-900/30 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-700 flex items-center justify-center overflow-hidden relative shadow-inner"
          >
            {isGenerating ? (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-purple-600 animate-pulse" />
                </motion.div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-400 animate-pulse">Creating your vision...</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This usually takes 10-15 seconds</p>
                </div>
              </motion.div>
            ) : generatedImage ? (
                <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full group relative"
              >
                  <img src={generatedImage} alt="Generated" className="w-full h-full object-cover rounded-xl" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4"
                  >
                    <div className="flex gap-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/90 backdrop-blur-sm text-slate-800 rounded-full shadow-lg hover:bg-white"
                          onClick={handleGenerate}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.5 }}
                  />
              </motion.div>
            ) : (
                  <motion.div
                    className="flex flex-col items-center gap-3 text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-purple-400" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Your AI-generated image will appear here</span>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Enter a description above to get started</p>
                    </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        <DialogFooter className="gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium rounded-xl px-6"
          >
            Cancel
          </Button>
          <AnimatePresence mode="wait">
            {!generatedImage ? (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl px-8 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Image
                </Button>
              </motion.div>
            ) : (
                <motion.div
                  key="use"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSelect}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl px-8 shadow-lg shadow-green-500/25 transition-all"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use This Image
                  </Button>
                </motion.div>
            )}
          </AnimatePresence>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
