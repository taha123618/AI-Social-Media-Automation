'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Smile, Image as ImageIcon, Hash, X, LayoutList, Sparkles, Wand2, PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';

interface MediaFile {
  file?: File;
  preview: string;
  id: string;
}

interface SocialEditorProps {
  content: string;
  onContentChange: (value: string) => void;
  selectedAccount?: {
    username: string;
    profileImageUrl?: string | null;
    platform: string;
    avatar?: string | null;
  };
  postType: 'POST' | 'REEL' | 'STORY';
  onPostTypeChange: (type: 'POST' | 'REEL' | 'STORY') => void;
  characterLimit: number;
  onOpenMedia: () => void;
  onOpenAI: () => void;
  onOpenCommentEditor: () => void;
  onOpenLabels?: () => void;
  onOpenAIImage?: () => void;
  firstComment?: string;
  onFirstCommentChange?: (val: string) => void;
  mediaFiles?: MediaFile[];
  onRemoveMedia?: (id: string) => void;
  disabled?: boolean;
  onConnectClick?: () => void;
}

export function SocialEditor({
  content,
  onContentChange,
  firstComment = '',
  onFirstCommentChange,
  selectedAccount,
  postType,
  onPostTypeChange,
  characterLimit,
  onOpenMedia,
  onOpenAI,
  onOpenCommentEditor,
  onOpenLabels,
  onOpenAIImage,
  mediaFiles = [],
  onRemoveMedia,
  disabled = false,
  onConnectClick
}: SocialEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'FACEBOOK': return <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 w-10 h-10"><path d="M12 2.04c-5.5 0-10 4.48-10 10 0 4.99 3.66 9.12 8.44 9.88v-6.99h-2.54V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.9h-2.33v6.99C18.34 21.12 22 17.03 22 12c0-5.52-4.5-10-10-10z" /></svg>;
      case 'INSTAGRAM': return '📷';
      case 'TWITTER': return '🐦';
      case 'LINKEDIN': return '💼';
      default: return '🌐';
    }
  };

  const onEmojiSelect = (emojiObject: EmojiClickData) => {
    onContentChange(content + emojiObject.emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const extractHashtagsAndText = (text: string) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    const tags: string[] = [];
    const plain: string[] = [];

    // basic hashtag parsing for rendering
    let currentHtml = [];
    for (let i = 0; i < words.length; i++) {
      if (words[i].startsWith('#') && words[i].length > 1) {
        tags.push(words[i]);
        currentHtml.push(<span key={i} className="text-blue-500">{words[i]}</span>);
      } else {
        currentHtml.push(words[i]);
      }
    }
    return currentHtml;
  };

  return (
    <div className="bg-white dark:bg-slate-900  rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px] flex flex-col pt-3 relative">

      {disabled && (
        <div className="absolute inset-0 dark:bg-slate-900/70 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <Button
            onClick={onConnectClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-5 rounded-lg shadow-md"
          >
            Connect Social Account
          </Button>
        </div>
      )}

      {/* Header Avatar Section */}
      <div className="px-4 py-2 flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/api/social/proxy-image?url=${encodeURIComponent(selectedAccount?.profileImageUrl || selectedAccount?.avatar || '')}`} />
            <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">
              {selectedAccount?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-sm">
            {getPlatformIcon(selectedAccount?.platform)}
          </div>
        </div>
      </div>

      {/* Facebook page options */}
      {selectedAccount?.platform === 'FACEBOOK' && (
        <div className="mx-4 mt-3 mb-2 p-3 border dark:border-slate-800 border-slate-200 rounded-md bg-white dark:bg-slate-900 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold dark:text-white text-slate-800">
            {getPlatformIcon('FACEBOOK')}
            {selectedAccount?.platform.toLowerCase()} page options
          </div>
          <RadioGroup
            value={postType}
            onValueChange={(val) => onPostTypeChange(val as any)}
            className="flex items-center gap-4 mt-2"
            disabled={disabled}
          >
            {['POST', 'REEL', 'STORY'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`type-${type}`} className="h-4 w-4 text-blue-600 border-slate-300" disabled={disabled} />
                <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer capitalize dark:text-white text-slate-700">
                  {type.toLowerCase()}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Textarea Area */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-2 relative">
        <textarea
          ref={textareaRef}
          value={content}
          disabled={disabled}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full flex-1 bg-transparent dark:text-white text-black resize-none focus:outline-none text-[15px] leading-relaxed absolute inset-4 z-10"
        />
        {/* syntax highlighting overlay */}
        <div className="w-full flex-1 bg-transparent text-[15px] leading-relaxed whitespace-pre-wrap pointer-events-none relative z-0">
          {extractHashtagsAndText(content)}
          {!content && <span className="text-slate-400">What's on your mind?</span>}
        </div>
      </div>

      {/* Media Grid */}
      {mediaFiles.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {mediaFiles.map((media) => (
              <div key={media.id} className="relative group w-24 h-24 rounded-md overflow-hidden border border-slate-200">
                <Image src={media.preview} alt="Media" fill className="object-cover" />
                {onRemoveMedia && (
                  <div className="absolute top-1 right-1 bg-white/80 rounded-full p-1 cursor-pointer hover:bg-white z-20" onClick={(e) => {
                    if (!disabled) onRemoveMedia(media.id);
                  }}>
                    <X className="h-3 w-3 text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Toolbar */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100/0">
        <div className="flex items-center gap-1.5 text-slate-500">

          <Popover>
            <PopoverTrigger asChild>
              <Button disabled={disabled} variant="ghost" size="sm" className="h-8 w-8 hover:bg-slate-100 rounded-full text-slate-600 disabled:opacity-50">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-xl rounded-xl z-[99]" align="start">
              <EmojiPicker onEmojiClick={onEmojiSelect} />
            </PopoverContent>
          </Popover>

          <Button disabled={disabled} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full text-slate-600 disabled:opacity-50" onClick={onOpenMedia}>
            <ImageIcon className="h-5 w-5" />
          </Button>

          <Button disabled={disabled} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full text-slate-600 disabled:opacity-50" onClick={onOpenLabels}>
            <Hash className="h-5 w-5" />
          </Button>

          <Button disabled={disabled} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full text-slate-600 disabled:opacity-50 relative" onClick={onOpenCommentEditor}>
            <span className="text-[14px] font-medium tracking-tight bg-slate-100 px-[3px] rounded">(x)</span>
            {firstComment && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white dark:border-slate-900">
                1
              </span>
            )}
          </Button>
          <Button disabled={disabled} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full text-slate-600 disabled:opacity-50">
            <LayoutList className="h-5 w-5" />
          </Button>

          <Button disabled={disabled} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full text-slate-600 disabled:opacity-50" onClick={onOpenAI}>
            <Sparkles className="h-5 w-5" />
          </Button>
          <Button disabled={disabled} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full text-slate-600 disabled:opacity-50" onClick={onOpenAIImage}>
            <Wand2 className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-1 text-[13px] text-slate-500 font-medium">
          {content.length} <PlusCircle className="h-4 w-4 ml-1 text-blue-500 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
