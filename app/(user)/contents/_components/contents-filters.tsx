'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

export function ContentsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [platformFilter, setPlatformFilter] = useState(searchParams.get('platform') || 'all');
  const [intentFilter, setIntentFilter] = useState(searchParams.get('intent') || 'all');

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

      // Reset to page 1 when filters change
      newParams.delete('page');

      return newParams.toString();
    },
    [searchParams]
  );

  // Sync with URL on initial load or back/forward navigation
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const platform = searchParams.get('platform') || 'all';
    const intent = searchParams.get('intent') || 'all';

    if (search !== searchTerm) setSearchTerm(search);
    if (status !== statusFilter) setStatusFilter(status);
    if (platform !== platformFilter) setPlatformFilter(platform);
    if (intent !== intentFilter) setIntentFilter(intent);
  }, [searchParams]);

  // Update URL when debounced search term changes
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    // Only push if the debounced value is different from what's currently in the URL
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

  const clearFilters = () => {
    setSearchTerm('');
    router.push('?', { scroll: false });
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'GENERATED', label: 'Generated' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
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

  const intentOptions = [
    { value: 'all', label: 'All Intents' },
    { value: 'SALES', label: 'Sales' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'EVENT', label: 'Event' },
    { value: 'ENGAGEMENT', label: 'Engagement' },
    { value: 'BRAND_AWARENESS', label: 'Brand Awareness' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="py-10"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="relative flex-1 group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500 font-bold" />
            <input
              type="text"
              placeholder="Filter by title, intent, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-xl pl-14 pr-12 text-sm font-black text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-white"
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
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {[
            { name: 'status', label: 'Status', value: statusFilter, setter: setStatusFilter, options: statusOptions },
            { name: 'platform', label: 'Platform', value: platformFilter, setter: setPlatformFilter, options: platformOptions },
            { name: 'intent', label: 'Intent', value: intentFilter, setter: setIntentFilter, options: intentOptions }
          ].map((filter, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute inset-0 bg-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <select
                value={filter.value}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                className="appearance-none relative h-14 min-w-[160px] rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-sm px-6 pr-12 text-xs font-black text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-300 cursor-pointer uppercase tracking-widest shadow-inner sm:shadow-none"
              >
                {filter.options.map(option => (
                  <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900 font-bold">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
            </div>
          ))}

          <button
            onClick={clearFilters}
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-sm text-slate-500 hover:border-rose-600/50 hover:bg-rose-600 hover:text-white hover:shadow-2xl hover:shadow-rose-500/25 transition-all duration-300 dark:border-slate-800/60 dark:bg-slate-900/40"
            title="Clear all filters"
          >
            <Filter className="h-6 w-6 transition-transform group-hover:rotate-12" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
