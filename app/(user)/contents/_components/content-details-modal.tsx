'use client';

import { X, Copy, Check, Calendar, Clock, Sparkles } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaLinkedin, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ContentDraft } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ContentDetailsModalProps {
  content: ContentDraft;
  onClose: () => void;
}

const icons: Record<string, any> = {
  TWITTER: FaXTwitter,
  LINKED_IN: FaLinkedin,
  INSTAGRAM: FaInstagram,
  FACEBOOK: FaFacebook,
  YOUTUBE: FaYoutube,
};

export function ContentDetailsModal({ content, onClose }: ContentDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = typeof content.generatedContent === 'string'
      ? content.generatedContent
      : (content.generatedContent as any)?.text || JSON.stringify(content.generatedContent);
    navigator.clipboard.writeText(text || '');
    setCopied(true);
    toast.success('Content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex h-[80vh] flex-col">
          {/* Header */}
          <div className="p-8 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Sparkles className="h-3 w-3" />
                    {content.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{content.intent}</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {content.title || 'Untitled Content'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
            <div className="space-y-8">
              {/* Info Bar */}
              <div className="grid grid-cols-2 gap-4 rounded-3xl bg-slate-50 p-6 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center dark:bg-slate-900 shadow-sm">
                    <Calendar className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created</div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300" suppressHydrationWarning>
                      {format(new Date(content.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center dark:bg-slate-900 shadow-sm">
                    <Clock className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled For</div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300" suppressHydrationWarning>
                      {content.scheduledFor ? format(new Date(content.scheduledFor), 'MMM d, h:mm a') : 'Not Scheduled'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="relative group">
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-sm px-4 py-2 text-xs font-bold text-slate-700 shadow-lg hover:bg-white transition-all dark:bg-slate-800/90 dark:text-white"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </button>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                  <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                    {typeof content.generatedContent === 'string'
                      ? content.generatedContent
                      : (content.generatedContent as any)?.text || JSON.stringify(content.generatedContent, null, 2)}
                  </p>
                </div>
              </div>

              {/* Platforms */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Target Platforms</h4>
                <div className="flex flex-wrap gap-3">
                  {content.platforms.map(platform => {
                    const Icon = icons[platform] || Sparkles;
                    return (
                      <div key={platform} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{platform}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 p-8 dark:border-slate-800 flex gap-4">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('edit-content', { detail: { content: JSON.parse(JSON.stringify(content)) } }));
                onClose();
              }}
              className="flex-1 rounded-2xl border border-slate-200 py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
            >
              Edit Content
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-scheduler', { detail: { content } }));
                onClose();
              }}
              className="flex-[2] rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
            >
              Schedule Publication
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
