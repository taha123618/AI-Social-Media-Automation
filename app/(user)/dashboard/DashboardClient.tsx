'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusCircle, Brain, Calendar, BarChart3, FileText, Users, Search, X, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickAction } from './_components/quick-action';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { toast } from 'sonner';

export function DashboardNewContentButton() {
  return (
    <Link href="/contents" className="flex items-center h-11 gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all active:scale-95">
      {/* <Button
      onClick={() => window.dispatchEvent(new CustomEvent('open-create-content'))}
      className="h-11 gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all active:scale-95"
    >
      <PlusCircle className="h-5 w-5" />
      New Content
    </Button> */}

      <PlusCircle className="h-5 w-5" />
      New Content
    </Link>
  );
}

export function DashboardQuickActions() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'Generate Content':
        window.dispatchEvent(new CustomEvent('open-create-content'));
        break;
      case 'Schedule Posts':
        window.location.href = '/schedule';
        break;
      case 'View Analytics':
        window.location.href = '/analytics';
        break;
      case 'Manage Knowledge':
        window.location.href = '/knowledge';
        break;
      case 'Team Settings':
        window.location.href = '/team';
        break;
      case 'Engagement':
        window.location.href = '/engagement';
        break;
      case 'Process Engagement':
        setIsProcessing(true);
        try {
          const res = await fetch('/api/engagement/process', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          const data = await res.json();
          if (data.success) {
            toast.success('Engagement processed successfully', {
              description: `Automated ${data.results?.length || 0} replies.`
            });
          } else {
            toast.error('Failed to process engagement');
          }
        } catch (e) {
          toast.error('Error processing engagement');
        } finally {
          setIsProcessing(false);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="grid gap-3">
      <QuickAction
        index={0}
        icon={<Brain className="h-5 w-5" />}
        label="Generate Content"
        onClick={() => handleQuickAction('Generate Content')}
      />
      <QuickAction
        index={1}
        icon={<Calendar className="h-5 w-5" />}
        label="Schedule Posts"
        onClick={() => handleQuickAction('Schedule Posts')}
      />
      <QuickAction
        index={2}
        icon={<BarChart3 className="h-5 w-5" />}
        label="View Analytics"
        onClick={() => handleQuickAction('View Analytics')}
      />
      <QuickAction
        index={3}
        icon={<MessageSquare className="h-5 w-5" />}
        label="Social Inbox"
        onClick={() => handleQuickAction('Engagement')}
      />
      <QuickAction
        index={4}
        icon={isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
        label={isProcessing ? "Processing..." : "Auto-Reply Now"}
        onClick={() => handleQuickAction('Process Engagement')}
      />
      <QuickAction
        index={5}
        icon={<FileText className="h-5 w-5" />}
        label="Manage Knowledge"
        onClick={() => handleQuickAction('Manage Knowledge')}
      />
      <QuickAction
        index={6}
        icon={<Users className="h-5 w-5" />}
        label="Team Settings"
        onClick={() => handleQuickAction('Team Settings')}
      />
    </div>
  );
}

export function DashboardEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur-sm"
    >
      <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
        <PlusCircle className="h-10 w-10 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-lg font-black text-slate-500 text-center uppercase tracking-tight">
        No content drafts yet
      </p>
      <p className="text-sm font-bold text-slate-400 mt-2">
        Your creative journey starts with a single click.
      </p>
    </motion.div>
  );
}

export function DashboardSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const search = searchParams.get('search') || '';
    if (search !== searchTerm) setSearchTerm(search);
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      const query = createQueryString('search', debouncedSearch);
      router.push(`?${query}`, { scroll: false });
    }
  }, [debouncedSearch, createQueryString, router, searchParams]);

  return (
    <div className="relative flex-1 md:max-w-xl group">
      <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-10 group-focus-within:opacity-20 transition-opacity" />
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors font-bold" />
        <input
          type="text"
          placeholder="Search contents, workflows, analytics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-xl py-4.5 pl-14 pr-12 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-white dark:placeholder-slate-500 font-bold"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchTerm('')}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4 stroke-[3px]" />
              </motion.button>
            )}
          </AnimatePresence>
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
    </div>
  );
}
