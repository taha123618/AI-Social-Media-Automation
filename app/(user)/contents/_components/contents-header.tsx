'use client';

import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutopilotButton } from './autopilot-button';

export function ContentsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Contents Library
          </h1>
          <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/20">
            DRAFTS &amp; ASSETS
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
          Manage and organize all your brand-aligned content drafts, AI copy variants, and queue items.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <AutopilotButton
          onComplete={(draftsCreated) => {
            console.log(`Created ${draftsCreated} drafts`);
            window.dispatchEvent(new CustomEvent('drafts-updated'));
          }}
        />
        <Button
          size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent('open-create-content'))}
          className="h-9 px-4 rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Create Draft</span>
        </Button>
      </div>
    </motion.div>
  );
}
