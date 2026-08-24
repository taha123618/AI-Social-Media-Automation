'use client';

import React, { useState, useRef } from 'react';
import {
  X, MessageSquare, Save, History,
  Sparkles, Smile, Info
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface CommentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: string;
  onCommentChange: (value: string) => void;
  platformLimits: Record<string, number>;
  onOpenAI?: () => void;
}

const EMOJIS = ['🔥', '✨', '🙌', '🚀', '💯', '👏', '🤔', '😎', '🎉', '❤️', '💼', '📈', '🤝', '💰', '💡', '😊', '😂', '🤣', '😍', '🤩'];

export function CommentEditorModal({
  isOpen,
  onClose,
  comment,
  onCommentChange,
  platformLimits,
  onOpenAI
}: CommentEditorModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const minLimit = Math.min(...Object.values(platformLimits)) || 2200;
  const isOverLimit = comment.length > minLimit;

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = comment.substring(0, start) + text + comment.substring(end);
    onCommentChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl">
        <DialogHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight">First Comment</DialogTitle>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Strategy: Higher Engagement</div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Posting hashtags or links in the <span className="text-slate-900 dark:text-white font-bold">first comment</span> instead of the caption often leads to cleaner posts and better reach on Instagram and LinkedIn.
            </p>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Type your first comment here..."
              className="w-full h-48 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-medium text-slate-700 dark:text-white"
            />
            <div className={`absolute bottom-3 right-4 text-[10px] font-bold ${isOverLimit ? 'text-red-500' : 'text-slate-400'}`}>
              {comment.length} / {minLimit}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-xl">
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                  <div className="grid grid-cols-5 gap-1">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertText(emoji)}
                        className="h-9 w-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-xl hover:scale-110 active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                onClick={onOpenAI}
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-200 text-slate-400">
                Auto-Post Enabled
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20"
          >
            Save Comment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
