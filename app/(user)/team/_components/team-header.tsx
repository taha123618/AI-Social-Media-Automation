"use client";
import { TeamHeaderButtons } from './team-header-buttons';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function TeamHeader({ userRole }: { userRole: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-6 mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Team &amp; Access Control
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage organization members, workspace seats, and security permissions.
          </p>
        </div>
      </div>

      <TeamHeaderButtons userRole={userRole} />
    </motion.div>
  );
}
