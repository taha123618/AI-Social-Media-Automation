'use client';

import { X, Copy, Check, Calendar, Clock, Sparkles, Edit3, Send } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaLinkedin, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ContentDraft } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ContentDetailsModalProps {
  content: ContentDraft;
  onClose: () => void;
}

const PLATFORM_ICONS: Record<string, any> = {
  TWITTER: FaXTwitter,
  LINKED_IN: FaLinkedin,
  LINKEDIN: FaLinkedin,
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

  const rawText = typeof content.generatedContent === 'string'
    ? content.generatedContent
    : (content.generatedContent as any)?.text || JSON.stringify(content.generatedContent, null, 2);

  const wordCount = rawText ? rawText.trim().split(/\s+/).length : 0;
  const charCount = rawText ? rawText.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden text-foreground"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border/60 flex items-start justify-between shrink-0 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="secondary" className="text-[10px] uppercase font-mono font-bold tracking-wider bg-primary/10 text-primary border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" />
                {content.status}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                {content.intent}
              </Badge>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              {content.title || 'Untitled Post'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 relative z-10 custom-scrollbar">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/70">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center text-primary shadow-xs">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">Created Date</div>
                <div className="text-xs font-semibold text-foreground" suppressHydrationWarning>
                  {format(new Date(content.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center text-primary shadow-xs">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">Scheduled Slot</div>
                <div className="text-xs font-semibold text-foreground" suppressHydrationWarning>
                  {content.scheduledFor ? format(new Date(content.scheduledFor), 'MMM d, h:mm a') : 'Not Scheduled'}
                </div>
              </div>
            </div>
          </div>

          {/* Copyable Content Card */}
          <div className="relative rounded-xl border border-border/80 bg-secondary/20 p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground">
                {wordCount} words • {charCount} characters
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2.5 text-xs rounded-lg gap-1.5 bg-card/80 backdrop-blur-xs hover:bg-card shadow-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-foreground font-sans selection:bg-primary/20">
              {rawText}
            </p>
          </div>

          {/* Target Channels */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 font-mono">
              Target Channels
            </h4>
            <div className="flex flex-wrap gap-2">
              {content.platforms.map((platform) => {
                const Icon = PLATFORM_ICONS[platform] || Sparkles;
                return (
                  <div
                    key={platform}
                    className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-1.5 shadow-xs"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">{platform}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-card/50 flex items-center justify-between shrink-0 relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('edit-content', { detail: { content: JSON.parse(JSON.stringify(content)) } }));
              onClose();
            }}
            className="h-9 px-4 text-xs rounded-xl gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Copy</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-scheduler', { detail: { content } }));
              onClose();
            }}
            className="h-9 px-5 text-xs font-semibold rounded-xl gap-1.5 shadow-sm active:scale-95"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Schedule Publication</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
