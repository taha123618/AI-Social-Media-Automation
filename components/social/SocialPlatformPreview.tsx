'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Bookmark,
  Send, Maximize2, Music2, X,
  Sparkles
} from 'lucide-react';
import { Platform } from '@/app/generated/prisma/enums';

interface PostPreviewProps {
  platform: Platform;
  content: string;
  firstComment?: string;
  mediaUrls: string[];
  accountName: string;
  accountAvatar?: string;
  postType?: 'POST' | 'REEL' | 'STORY';
}

export function SocialPlatformPreview({
  platform,
  content,
  firstComment,
  mediaUrls,
  accountName,
  accountAvatar,
  postType = 'POST'
}: PostPreviewProps | any) {

  if (!platform || platform === 'DRAFT') {
    return <GenericDraftPreview {...{ content, mediaUrls, accountName, accountAvatar }} />;
  }

  if (platform === Platform.INSTAGRAM) {
    if (postType === 'REEL') return <InstagramReelPreview {...{ content, firstComment, mediaUrls, accountName, accountAvatar }} />;
    if (postType === 'STORY') return <InstagramStoryPreview {...{ content, mediaUrls, accountName, accountAvatar }} />;
    return <InstagramFeedPreview {...{ content, firstComment, mediaUrls, accountName, accountAvatar }} />;
  }

  if (platform === Platform.FACEBOOK) {
    return <FacebookFeedPreview {...{ content, mediaUrls, accountName, accountAvatar }} />;
  }

  // Default fallback
  return <GenericDraftPreview {...{ content, mediaUrls, accountName, accountAvatar }} />;
}

function GenericDraftPreview({ content, firstComment, mediaUrls, accountName, accountAvatar }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-md mx-auto relative group">
      {/* Draft Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Draft Preview
        </div>
      </div>

      {/* Header */}
      <div className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
          {accountAvatar ? (
            <img src={accountAvatar} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <Sparkles className="h-5 w-5 text-blue-500" />
          )}
        </div>
        <div className="space-y-0.5">
          <div className="text-sm font-black text-slate-900 dark:text-white capitalize">{accountName || 'New Post'}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Optimizing for best reach...</div>
        </div>
      </div>

      {/* Media Rendering */}
      {mediaUrls.length > 0 && (
        <div className="aspect-square bg-slate-50 dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800 relative">
          <img src={mediaUrls[0]} alt="Draft Preview" className="w-full h-full object-cover" />
          {mediaUrls.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[10px] font-black border border-white/20">
              +{mediaUrls.length - 1} MEDIA
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="p-6 space-y-4">
        <p className="text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {content || 'Your content will appear here...'}
        </p>

        {firstComment && (
          <div className="py-3 px-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
            <div className="flex items-center gap-2 mb-1.5">
              <MessageCircle className="h-3 w-3 text-blue-500" />
              <span className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">First Comment</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
              {firstComment}
            </p>
          </div>
        )}

        <div className="flex items-center gap-6 pt-2 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-400">
            <Heart className="h-5 w-5" />
            <span className="text-xs font-bold">0</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs font-bold">0</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Share2 className="h-5 w-5" />
            <span className="text-xs font-bold">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramFeedPreview({ content, firstComment, mediaUrls, accountName, accountAvatar }: any) {
  return (
    <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1.5px]">
            <div className="w-full h-full rounded-full bg-white dark:bg-black p-[1px]">
              {accountAvatar ? (
                <img src={accountAvatar} alt={accountName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                  {accountName?.[0]}
                </div>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold dark:text-white">{accountName}</span>
        </div>
        <MoreHorizontal className="h-5 w-5 dark:text-white" />
      </div>

      {/* Media */}
      <div className="aspect-square bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
        {mediaUrls.length > 0 ? (
          <img src={mediaUrls[0]} alt="Post" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-400 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-800" />
            <span className="text-xs">No media attached</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 dark:text-white" />
            <MessageCircle className="h-6 w-6 dark:text-white" />
            <Send className="h-6 w-6 dark:text-white" />
          </div>
          <Bookmark className="h-6 w-6 dark:text-white" />
        </div>

        <div className="text-sm font-semibold mb-1 dark:text-white">1,234 likes</div>
        <div className="text-sm dark:text-white">
          <span className="font-semibold mr-2">{accountName}</span>
          <span className="whitespace-pre-wrap">{content || 'Caption goes here...'}</span>
        </div>

        {firstComment && (
          <div className="mt-3 py-2 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-3 w-3 text-blue-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Comment</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap line-clamp-3">
              {firstComment}
            </p>
          </div>
        )}

        <div className="text-[10px] text-slate-500 uppercase mt-2">Just now</div>
      </div>
    </div>
  );
}

function InstagramReelPreview({ content, mediaUrls, accountName, accountAvatar }: any) {
  return (
    <div className="aspect-[9/16] bg-black rounded-3xl overflow-hidden relative shadow-2xl max-w-[320px] mx-auto border-[8px] border-slate-800">
      {/* Video Mock */}
      <div className="absolute inset-0 flex items-center justify-center">
        {mediaUrls[0] ? (
          <img src={mediaUrls[0]} alt="Reel" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="text-slate-500 font-medium">Reel Preview</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Interface Overlays */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-center text-white">
          <span className="font-bold">Reels</span>
          <Maximize2 className="h-6 w-6" />
        </div>

        <div className="flex justify-between items-end">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-300 border border-white/20">
                {accountAvatar && <img src={accountAvatar} className="w-full h-full rounded-full object-cover" />}
              </div>
              <span className="text-white text-sm font-bold">{accountName}</span>
              <button className="text-xs border border-white px-2 py-0.5 rounded-md text-white">Follow</button>
            </div>
            <p className="text-white text-sm line-clamp-2 mb-3">{content || 'Reel description...'}</p>
            <div className="flex items-center gap-2 text-white">
              <Music2 className="h-4 w-4" />
              <span className="text-xs truncate">{accountName} • Original Audio</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 text-white pb-2">
            <div className="flex flex-col items-center gap-1">
              <Heart className="h-8 w-8" />
              <span className="text-[10px]">12.5K</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="h-8 w-8" />
              <span className="text-[10px]">456</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Send className="h-8 w-8" />
              <span className="text-[10px]">1.2K</span>
            </div>
            <MoreHorizontal className="h-6 w-6" />
            <div className="w-8 h-8 rounded-lg bg-slate-600 border-2 border-white/40 overflow-hidden">
              {mediaUrls[0] && <img src={mediaUrls[0]} className="w-full h-full object-cover" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramStoryPreview({ mediaUrls, accountName, accountAvatar }: any) {
  return (
    <div className="aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl max-w-[320px] mx-auto border-[8px] border-slate-800">
      {mediaUrls[0] ? (
        <img src={mediaUrls[0]} alt="Story" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500">Story Preview</div>
      )}

      {/* Header Overlay */}
      <div className="absolute top-0 inset-x-0 p-4 pt-6 bg-gradient-to-b from-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-4 h-[2px] bg-white rounded-full flex-1" />
          <div className="w-4 h-[2px] bg-white/40 rounded-full flex-1" />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-white/20">
              {accountAvatar && <img src={accountAvatar} className="w-full h-full rounded-full object-cover" />}
            </div>
            <span className="text-white text-sm font-bold">{accountName}</span>
            <span className="text-white/60 text-xs">1h</span>
          </div>
          <div className="flex gap-4">
            <MoreHorizontal className="h-5 w-5 text-white" />
            <X className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Footer Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-4 pb-8 bg-gradient-to-t from-black/40 to-transparent flex items-center gap-4">
        <div className="flex-1 border border-white/40 rounded-full py-2 px-4 text-white text-sm">
          Send message
        </div>
        <Heart className="h-6 w-6 text-white" />
        <Send className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}

function FacebookFeedPreview({ content, mediaUrls, accountName, accountAvatar }: any) {
  console.log(accountAvatar);
  const extractHashtagsAndText = (text: string) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < words.length; i++) {
      if (words[i].startsWith('#') && words[i].length > 1) {
        elements.push(<span key={i} className="text-[#1877F2]">{words[i]}</span>);
      } else {
        elements.push(words[i]);
      }
    }
    return elements;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden max-w-[500px] mx-auto pb-2">
      {/* Header */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5 relative ">
          <div className=" w-12 h-12 rounded-full bg-slate-200 overflow-hidden  border border-slate-100">
            {accountAvatar ? (
              <img src={`/api/social/proxy-image?url=${encodeURIComponent(accountAvatar)}`} className="w-full h-full object-cover" loading='lazy' />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#E4E6EB] text-slate-700 font-bold text-sm">
                {accountName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-[35px] h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#1877F2] h-10 w-10"><path d="M12 2.04c-5.5 0-10 4.48-10 10 0 4.99 3.66 9.12 8.44 9.88v-6.99h-2.54V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.9h-2.33v6.99C18.34 21.12 22 17.03 22 12c0-5.52-4.5-10-10-10z" /></svg>
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-[15px] text-[#050505] tracking-tight hover:underline cursor-pointer flex items-center gap-1">
              {accountName}
            </div>
            <div className="text-[13px] text-[#65676B] flex items-center gap-1">
              Just now ·
              <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.019 14.502c-3.141 0-5.83-2.195-6.529-5.112h2.646c.106 1.341.684 2.56 1.621 3.483l.87 1.025c.371.439.818.825 1.319 1.15.024-.183.05-.36.073-.541v-3.072h1.614v3.52c-.528.328-1.08.544-1.614.547zm3.176-1.5c-1.047-.792-1.782-1.89-2.155-3.111h3.313c-.456 1.303-1.121 2.45-1.93 3.398l.613-.377a6.49 6.49 0 0 0 .16-.09z" /></svg>
            </div>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer text-[#65676B]">
          <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M10 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /></svg>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 text-[15px] leading-[1.3333] text-[#050505] whitespace-pre-wrap break-words">
        {extractHashtagsAndText(content) || 'What\'s on your mind?'}
      </div>

      {/* Media */}
      <div className="w-full bg-[#f0f2f5] border-y border-slate-200">
        {mediaUrls.length > 0 ? (
          <img src={mediaUrls[0]} alt="Post media" className="w-full object-contain max-h-[600px] bg-black" />
        ) : null}
      </div>

      {/* Interactions counts */}
      <div className="px-4 py-2.5 flex justify-between items-center text-[15px] text-[#65676B]">
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 bg-[#1877F2] rounded-full flex items-center justify-center text-white ring-2 ring-white z-10"><svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M14.5 5.5h-4.3c.3-.6.5-1.4.5-2.2 0-1.5-1-2.2-2.2-2.2-.4 0-.8.1-1.1.4-.4.3-.7.7-.8 1.3L5.4 6H2c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2.5c.3 0 .6-.2.8-.4h6.4c1 0 1.9-.7 2.1-1.7l1.1-6c.2-.9-.5-1.8-1.4-1.8z" /></svg></div>
            <div className="w-4 h-4 bg-[#F5C33B] rounded-full flex items-center justify-center text-white ring-2 ring-white z-0"><span className="text-[10px]">😮</span></div>
          </div>
          <span>116</span>
        </div>
        <div className="flex gap-3 hover:underline cursor-pointer">
          <span>0 comments</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4">
        <div className="flex border-t border-[#ced0d4] py-1">
          <button className="flex-1 h-8 rounded flex items-center justify-center gap-2 text-[15px] font-semibold text-[#65676B] hover:bg-[#F2F2F2] transition-colors">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M10 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /></svg> Like
          </button>
          <button className="flex-1 h-8 rounded flex items-center justify-center gap-2 text-[15px] font-semibold text-[#65676B] hover:bg-[#F2F2F2] transition-colors">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M10 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /></svg> Comment
          </button>
          <button className="flex-1 h-8 rounded flex items-center justify-center gap-2 text-[15px] font-semibold text-[#65676B] hover:bg-[#F2F2F2] transition-colors">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M10 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /></svg> Share
          </button>
        </div>
      </div>
    </div>
  );
}
