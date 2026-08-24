'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Calendar, Filter, ChevronDown, List, LayoutGrid, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

export function ScheduleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [platformFilter, setPlatformFilter] = useState(searchParams.get('platform') || 'all');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>((searchParams.get('view') as 'calendar' | 'list') || 'calendar');

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

  // Sync with URL
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const platform = searchParams.get('platform') || 'all';
    const dFrom = searchParams.get('dateFrom') || '';
    const dTo = searchParams.get('dateTo') || '';
    const view = (searchParams.get('view') as 'calendar' | 'list') || 'calendar';

    if (search !== searchTerm) setSearchTerm(search);
    if (status !== statusFilter) setStatusFilter(status);
    if (platform !== platformFilter) setPlatformFilter(platform);
    if (dFrom !== dateFrom) setDateFrom(dFrom);
    if (dTo !== dateTo) setDateTo(dTo);
    if (view !== viewMode) setViewMode(view);
  }, [searchParams]);

  // Update URL for search
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      const query = createQueryString({ search: debouncedSearch });
      router.push(`?${query}`, { scroll: false });
    }
  }, [debouncedSearch, createQueryString, router, searchParams]);

  const handleFilterChange = (name: string, value: string) => {
    const currentValue = searchParams.get(name) || 'all';
    if (value !== currentValue) {
      const query = createQueryString({ [name]: value });
      router.push(`?${query}`, { scroll: false });
    }
  };

  const handleDateChange = (name: string, value: string) => {
    const currentValue = searchParams.get(name) || '';
    if (value !== currentValue) {
      const query = createQueryString({ [name]: value });
      router.push(`?${query}`, { scroll: false });
    }
  };

  const handleViewChange = (mode: 'calendar' | 'list') => {
    const currentView = searchParams.get('view') || 'calendar';
    if (mode !== currentView) {
      const query = createQueryString({ view: mode });
      router.push(`?${query}`, { scroll: false });
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'POSTED', label: 'Posted' },
    { value: 'FAILED', label: 'Failed' }
  ];

  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
    { value: 'TWITTER', label: 'Twitter' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'YOUTUBE', label: 'YouTube' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 pt-10"
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110 group-focus-within:rotate-3 font-bold" />
          <input
            type="text"
            placeholder="Search scheduled deployments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 w-full rounded-[1.25rem] border border-slate-200/60 bg-white/50 backdrop-blur-md pl-14 pr-12 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 shadow-sm"
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

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group min-w-[180px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="h-14 w-full appearance-none rounded-[1.25rem] border border-slate-200/60 bg-white/50 backdrop-blur-md pl-12 pr-12 text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="dark:bg-slate-900 dark:text-slate-300">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-all group-focus-within:rotate-180" />
          </div>

          <div className="relative group min-w-[180px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LayoutGrid className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <select
              value={platformFilter}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
              className="h-14 w-full appearance-none rounded-[1.25rem] border border-slate-200/60 bg-white/50 backdrop-blur-md pl-12 pr-12 text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
            >
              {platformOptions.map(option => (
                <option key={option.value} value={option.value} className="dark:bg-slate-900 dark:text-slate-300">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-all group-focus-within:rotate-180" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center justify-between py-8 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-wrap items-center gap-6">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-100 dark:border-blue-800/50 shadow-inner">
            <Calendar className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 focus:outline-none transition-all cursor-pointer"
              />
            </div>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateChange('dateTo', e.target.value)}
                className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 focus:outline-none transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="relative flex items-center p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-inner group">
          <button
            onClick={() => handleViewChange('calendar')}
            className={`relative z-10 flex items-center gap-3 rounded-[1rem] px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              viewMode === 'calendar'
              ? 'text-blue-600 font-black'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => handleViewChange('list')}
            className={`relative z-10 flex items-center gap-3 rounded-[1rem] px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              viewMode === 'list'
              ? 'text-blue-600 font-black'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold'
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>

          {/* Sliding Indicator */}
          <motion.div
            layoutId="activeTab"
            className="absolute h-[calc(100%-12px)] w-[calc(50%-9px)] bg-white dark:bg-slate-700 rounded-[0.875rem] shadow-2xl shadow-blue-500/10 border border-slate-100 dark:border-slate-600"
            initial={false}
            animate={{
              x: viewMode === 'calendar' ? 0 : 'calc(100% + 6px)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
