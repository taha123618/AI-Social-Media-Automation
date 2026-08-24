'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Pagination, SearchParams } from '../types';

interface PaginationControlsProps {
  pagination: Pagination;
  currentParams: SearchParams;
}

export function PaginationControls({ pagination, currentParams }: PaginationControlsProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value);
      }
    });
    if (page > 1) {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
      <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
        Showing <span className="text-blue-600 dark:text-blue-400">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
        <span className="text-blue-600 dark:text-blue-400">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
        <span className="text-blue-600 dark:text-blue-400 font-bold underline decoration-blue-500/20 underline-offset-4">{pagination.total}</span> works
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={buildUrl(pagination.page - 1)}
          className={`group flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all ${
            pagination.hasPrev
            ? 'bg-white border border-slate-200/60 text-slate-700 hover:bg-white hover:text-blue-600 hover:shadow-xl hover:scale-105 dark:bg-slate-900/40 dark:border-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-blue-400'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 dark:bg-slate-800 dark:text-slate-600'
          }`}
          aria-disabled={!pagination.hasPrev}
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Prev
        </Link>

        <div className="hidden sm:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-1 shadow-inner border border-slate-200/50 dark:border-slate-700/50">
          {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
            // Simple logic for first 5 pages for now
            const page = i + 1;
            return (
              <Link
                key={page}
                href={buildUrl(page)}
                className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${page === pagination.page
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'
                  }`}
              >
                {page}
              </Link>
            );
          })}
        </div>

        <Link
          href={buildUrl(pagination.page + 1)}
          className={`group flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all ${
            pagination.hasNext
            ? 'bg-white border border-slate-200/60 text-slate-700 hover:bg-white hover:text-blue-600 hover:shadow-xl hover:scale-105 dark:bg-slate-900/40 dark:border-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-blue-400'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 dark:bg-slate-800 dark:text-slate-600'
          }`}
          aria-disabled={!pagination.hasNext}
        >
          Next
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
