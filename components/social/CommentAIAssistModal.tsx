'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Loader2, MessageSquareText, History, Copy, Clock, Check
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface CommentAIHistoryItem {
  id: string;
  prompt: string;
  response: string;
  tone: string | null;
  createdAt: string;
}

interface CommentAIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, tone: string) => void;
  isProcessing: boolean;
  businessId?: string;
}

const COMMENT_TONES = [
  { id: 'Engaging', label: 'Engaging', icon: '🤝' },
  { id: 'Helpful', label: 'Helpful', icon: '💡' },
  { id: 'Supportive', label: 'Supportive', icon: '💖' },
  { id: 'Witty', label: 'Witty', icon: '😜' },
  { id: 'Professional', label: 'Professional', icon: '👔' },
];

export function CommentAIAssistModal({
  isOpen,
  onClose,
  onGenerate,
  isProcessing,
  businessId
}: CommentAIAssistModalProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('Engaging');
  const [activeTab, setActiveTab] = useState('generate');
  const [history, setHistory] = useState<CommentAIHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!businessId) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/social/ai/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId
        },
        body: JSON.stringify({ action: 'get-history', input: {} })
      });
      const data = await response.json();
      if (data.success && data.history) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to fetch comment AI history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchHistory();
    }
  }, [isOpen, activeTab, fetchHistory]);

  // Handle modal close cleanup
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('generate');
      setPrompt('');
      setCopiedId(null);
    }
  }, [isOpen]);

  const handleGenerate = () => {
    onGenerate(prompt, selectedTone);
  };

  const handleCopyHistory = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseHistory = (text: string) => {
    // Instead of generating, we want to just pass it up.
    // If we just want to insert it, we can trigger the custom event since there isn't a direct callback for using history text.
    window.dispatchEvent(new CustomEvent('ai-comment-generated', {
      detail: { content: text }
    }));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[600px] max-h-[90vh]">
        <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MessageSquareText className="h-5 w-5 text-blue-600 animate-pulse" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Comment Assist</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 border-b border-slate-100 dark:border-slate-800">
            <TabsList className="bg-transparent p-0 h-12 w-full justify-start gap-6 border-none">
              <TabsTrigger
                value="generate"
                className="px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none font-semibold text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all gap-2 h-full"
              >
                <Sparkles className="h-4 w-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none font-semibold text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all gap-2 h-full"
              >
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="generate" className="flex-1 m-0 p-6 flex flex-col gap-5 overflow-y-auto">
            {/* Main Generate Input */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tell AI how you want to reply
              </Label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Write a supportive reply thanking them for the feedback..."
                className="w-full h-32 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white placeholder:text-slate-400 resize-none transition-all"
              />
            </div>

            {/* Tone Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tone</Label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger className="w-full h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                  {COMMENT_TONES.map((tone) => (
                    <SelectItem key={tone.id} value={tone.id} className="cursor-pointer">
                      <span className="flex items-center gap-2">
                        <span>{tone.icon}</span>
                        <span className="font-medium">{tone.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-50 dark:border-slate-800">
              <Button
                disabled={isProcessing || !prompt.trim()}
                onClick={handleGenerate}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Reply...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Reply
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
            {isLoadingHistory ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <History className="h-6 w-6 text-slate-400" />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">No comment history yet</p>
                <p className="text-sm mt-1">Your AI-generated comments will appear here.</p>
              </div>
            ) : (
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {item.tone || 'General'}
                          </span>
                          <span className="flex items-center text-xs text-slate-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                            onClick={() => handleCopyHistory(item.response, item.id)}
                            title="Copy text"
                          >
                            {copiedId === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 line-clamp-1 italic">
                        "{item.prompt}"
                      </p>
                      <div className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap border border-slate-100 dark:border-slate-800/50">
                        {item.response}
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full mt-3 h-9 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg border border-slate-200 dark:border-slate-700"
                        onClick={() => handleUseHistory(item.response)}
                      >
                        Use this reply
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
