'use client';
import { motion } from 'framer-motion';

export function SettingsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-border/70 pb-6 mb-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
        <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace Operations
        </p>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        System <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Configuration</span>
      </h1>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
        Manage workspace profiles, API keys, Webhooks, CRM integrations, and automated posting schedules.
      </p>
    </motion.div>
  );
}
