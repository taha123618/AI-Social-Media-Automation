'use client';

import React from 'react';
import { 
  Smile, Hash, Variable, MessageSquare, 
  ChevronRight, Sparkles, TrendingUp, HelpCircle
} from 'lucide-react';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditorQuickActionsProps {
  onInsert: (text: string) => void;
  onOpenCommentEditor: () => void;
  children: React.ReactNode;
}

const EMOJIS = ['🔥', '✨', '🙌', '🚀', '💯', '👏', '🤔', '😎', '🎉', '❤️', '💼', '📈', '🤝', '💰', '💡', '😊', '😂', '🤣', '😍', '🤩'];
const HASHTAGS = ['#Marketing', '#Business', '#Growth', '#SaaS', '#Innovation', '#Strategy', '#Success', '#Tips', '#Design', '#SocialMedia'];
const VARIABLES = [
  { label: 'Business Name', value: '{business_name}' },
  { label: 'Website URL', value: '{website_url}' },
  { label: 'Location', value: '{location}' },
  { label: 'Phone Number', value: '{phone}' },
];

export function EditorQuickActions({
  onInsert,
  onOpenCommentEditor,
  children
}: EditorQuickActionsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden" align="end">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-6">
            
            {/* Emojis Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Smile className="h-3 w-3" />
                    Popular Emojis
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onInsert(emoji)}
                    className="h-9 w-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-xl hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Hashtags Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    Suggested Hashtags
                </span>
                <TrendingUp className="h-3 w-3 text-green-500" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HASHTAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onInsert(tag + ' ')}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-xs font-bold transition-all border border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-900/50"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Variables Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    Variable Manager
                </span>
              </div>
              <div className="space-y-1">
                {VARIABLES.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => onInsert(v.value)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-400 group-hover:bg-purple-600" />
                        {v.label}
                    </div>
                    <span className="text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Insert</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Section */}
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
               <Button 
                onClick={onOpenCommentEditor}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-2xl h-12 font-bold gap-3 flex items-center justify-center shadow-lg active:scale-95 transition-all"
               >
                 <MessageSquare className="h-5 w-5" />
                 Write First Comment
               </Button>
               <p className="mt-2 text-[10px] text-center text-slate-400 font-medium">Auto-posted immediately after the main post</p>
            </div>

          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
