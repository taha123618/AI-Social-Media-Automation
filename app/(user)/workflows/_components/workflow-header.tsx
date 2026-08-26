'use client';
import { Plus, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function WorkflowHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Mastra Multi-Agent Orchestration
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Workflow <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Engine</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
          Automate multi-channel social publishing, RAG research routines, and predictive analytics pipelines.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-semibold rounded-lg gap-1.5"
        >
          <Play className="h-3.5 w-3.5 text-primary" />
          <span>Execute All Active</span>
        </Button>
        <Button
          size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent('open-create-workflow'))}
          className="text-xs font-semibold rounded-lg gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Workflow</span>
        </Button>
      </div>
    </motion.div>
  );
}
