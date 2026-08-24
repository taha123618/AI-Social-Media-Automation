'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

export function WorkflowFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const debouncedSearch = useDebounce(searchTerm, 500);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([name, value]) => {
        if (value === null || value === 'all' || value === '') {
          newParams.delete(name);
        } else {
          newParams.set(name, value);
        }
      });

      return newParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    if (search !== searchTerm) setSearchTerm(search);
    if (status !== statusFilter) setStatusFilter(status);
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      const query = createQueryString({ search: debouncedSearch });
      router.push(`?${query}`, { scroll: false });
    }
  }, [debouncedSearch, createQueryString, router, searchParams]);

  const handleFilterChange = (value: string) => {
    const currentStatus = searchParams.get('status') || 'all';
    if (value !== currentStatus) {
      const query = createQueryString({ status: value });
      router.push(`?${query}`, { scroll: false });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="pb-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors font-bold" />
          <input
            type="text"
            placeholder="Search workflows by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-xl pl-14 pr-12 text-sm font-black text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-white shadow-sm"
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4 stroke-[3px]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="relative group min-w-[160px]">
          <Activity className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="appearance-none relative h-14 w-full rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-sm pl-12 pr-12 text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-300 cursor-pointer shadow-sm"
          >
            <option value="all">All States</option>
            <option value="active">Active Only</option>
            <option value="inactive">Paused Only</option>
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
        </div>
      </div>
    </motion.div>
  );
}
