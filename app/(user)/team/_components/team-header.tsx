"use client";
import { TeamHeaderButtons } from './team-header-buttons';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function TeamHeader({ userRole }: { userRole: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8"
    >
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-100 dark:border-blue-800/50 shadow-inner">
          <Users className="h-7 w-7 stroke-[2.5px]" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Team Control
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage members, roles, and platform permissions
          </p>
        </div>
      </div>

      <TeamHeaderButtons userRole={userRole} />
    </motion.div>
  );
}
