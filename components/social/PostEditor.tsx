'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, List, Smile, Hash, AtSign, Sparkles,
  ChevronDown, Wand2, Type, Eraser, Loader2, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { MessageCircle, X } from 'lucide-react';
import { pollJobStatus } from '@/lib/social-ai-utils';

interface PostEditorProps {
  content: string;
  onContentChange: (value: string) => void;
  firstComment?: string;
  onFirstCommentChange?: (value: string) => void;
  platforms: any[];
}

const EMOJI_CATEGORIES = [
  { label: 'Popular', emojis: ['🔥', '✨', '🙌', '🚀', '💯', '👏', '🤔', '😎', '🎉', '❤️'] },
  { label: 'Business', emojis: ['💼', '📈', '🤝', '💰', '💡', '📊', '💻', '🗓️', '🎯', '📣'] },
  { label: 'Smileys', emojis: ['😊', '😂', '🤣', '😍', '🤩', '🥳', '😉', '😇', '😋', '😜'] },
];

const SUGGESTED_HASHTAGS = [
  '#SocialMedia', '#Marketing', '#DigitalMarketing', '#B2B', '#SaaS',
  '#GrowthHacking', '#BusinessStrategy', '#Entrepreneur', '#Innovation'
];

export function PostEditor({
  content,
  onContentChange,
  firstComment = '',
  onFirstCommentChange,
  platforms
}: PostEditorProps) {
  const { businessId } = useCurrentBusiness();
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiAssist, setShowAiAssist] = useState(false);
  const [showFirstComment, setShowFirstComment] = useState(!!firstComment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Sync visibility if data is loaded asynchronously
  useEffect(() => {
    if (firstComment && !showFirstComment) {
      setShowFirstComment(true);
    }
  }, [firstComment]);

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = content.substring(0, start) + text + content.substring(end);
    onContentChange(newText);

    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleAiAction = async (action: string) => {
    setIsAiProcessing(true);
    try {
      const response = await fetch('/api/social/ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(businessId && { 'x-business-id': businessId })
        },
        body: JSON.stringify({
          action: 'generate-content',
          input: {
            prompt: content,
            regenerationGoal: action,
            existingContent: content,
            platforms: platforms.map(p => p.platform)
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.text) {
          onContentChange(data.text);
          toast.success(`Content ${action.toLowerCase()}!`);
          setIsAiProcessing(false);
        } else if (data.jobId) {
          toast.info(`Task queued... processing`);
          pollJobStatus({
            jobId: data.jobId,
            businessId,
            onSuccess: (result) => {
              if (result.text) {
                onContentChange(result.text);
                toast.success(`Content ${action.toLowerCase()}!`);
              }
            },
            onFinished: () => setIsAiProcessing(false)
          });
        }
      } else {
        throw new Error(data.error || 'Failed to process AI request');
        setIsAiProcessing(false);
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsAiProcessing(false);
    } finally {
      setShowAiAssist(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => insertText('**')} title="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => insertText('_')} title="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" align="start">
              <div className="space-y-3">
                {EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.label}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">{cat.label}</div>
                    <div className="grid grid-cols-5 gap-1">
                      {cat.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertText(emoji)}
                          className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <Hash className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" align="start">
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_HASHTAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => insertText(tag + ' ')}
                    className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Popover open={showAiAssist} onOpenChange={setShowAiAssist}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all font-medium"
                disabled={isAiProcessing || !content.trim()}
              >
                {isAiProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Assist
                <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" align="end">
              <div className="space-y-1">
                {[
                  { id: 'improve', label: 'Improve Writing', icon: Wand2 },
                  { id: 'shorten', label: 'Make Shorter', icon: Type },
                  { id: 'emojis', label: 'Add Emojis', icon: Smile },
                  { id: 'professional', label: 'Make Professional', icon: Bold },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAiAction(item.label)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                  >
                    <item.icon className="h-4 w-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    {item.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative flex flex-col min-h-[400px]">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Start writing your amazing story..."
          className="w-full flex-1 p-6 bg-transparent resize-none focus:outline-none dark:text-white text-lg leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />

        {/* Floating Stats */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm dark:text-slate-300">
            {content.length} characters
          </Badge>
          {content.length > 2200 && (
            <Badge variant="destructive" className="animate-pulse">
              Over Instagram limit
            </Badge>
          )}
        </div>

        {/* First Comment Section */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800 flex items-center gap-1.5 py-1 px-3 rounded-xl font-bold">
                <MessageCircle className="h-3 w-3" />
                First Comment
              </Badge>
              {!showFirstComment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFirstComment(true)}
                  className="h-7 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-50"
                >
                  + Add Comment
                </Button>
              )}
            </div>
            {showFirstComment && (
              <button
                onClick={() => {
                  setShowFirstComment(false);
                  onFirstCommentChange?.('');
                }}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFirstComment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <textarea
                  ref={commentRef}
                  value={firstComment}
                  onChange={(e) => onFirstCommentChange?.(e.target.value)}
                  placeholder="Add hashtags or extra context for the first comment..."
                  className="w-full min-h-[100px] p-4 bg-white/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl resize-none focus:outline-none dark:text-white text-sm leading-relaxed placeholder:text-slate-200 dark:placeholder:text-slate-800 shadow-inner transition-all hover:bg-white dark:hover:bg-slate-950"
                />
                <div className="flex justify-end mt-2">
                  <span className={`text-[10px] font-bold ${firstComment.length > 2200 ? 'text-red-500' : 'text-slate-400'}`}>
                    {firstComment.length} / 2200
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Add platform specific indicators here if needed */}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <Eraser className="h-3 w-3" />
          <span>AUTOSAVED JUST NOW</span>
        </div>
      </div>
    </div>
  );
}
