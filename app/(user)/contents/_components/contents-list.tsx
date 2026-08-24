'use client';
import { useState } from 'react';
import { Search, CheckCircle, Trash2, X, Loader, Check } from 'lucide-react';
import { ContentDraft, Pagination, SearchParams } from '../types';
import { ContentCard } from './content-card';
import { PaginationControls } from './pagination-controls';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { bulkUpdateContentStatus, bulkDeleteContentDrafts } from '../actions/mutations';
import { toast } from 'sonner';

interface ContentsListProps {
  contents: ContentDraft[];
  pagination: Pagination;
  currentParams: SearchParams;
}

export function ContentsList({ contents, pagination, currentParams }: ContentsListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    setIsProcessing(true);
    try {
      await bulkUpdateContentStatus(selectedIds, 'APPROVED' as any);
      toast.success(`Successfully approved ${selectedIds.length} items`);
      setSelectedIds([]);
      // Reload logic bypassed; let React Query handle invalidation on parent level
      // or we can dispatch a globally listened event
      window.dispatchEvent(new CustomEvent('drafts-updated'));
    } catch (error) {
      toast.error('Failed to approve items');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await bulkDeleteContentDrafts(selectedIds);
      toast.success(`Successfully deleted ${selectedIds.length} items`);
      setSelectedIds([]);
      window.dispatchEvent(new CustomEvent('drafts-updated'));
    } catch (error) {
      toast.error('Failed to delete items');
    } finally {
      setIsProcessing(false);
    }
  };
  if (contents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur-sm relative overflow-hidden group"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000" />
        <div className="h-24 w-24 rounded-[2rem] bg-white dark:bg-slate-800 flex items-center justify-center mb-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative z-10 transition-transform group-hover:rotate-12">
          <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 stroke-[2.5px]" />
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white relative z-10 tracking-tighter">
          No matches found
        </div>
        <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 text-center max-w-sm px-10 relative z-10 leading-relaxed uppercase tracking-widest">
          Try refining your search or filters to discover <span className="text-blue-600 dark:text-blue-400">your masterpieces.</span>
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-16 relative">
      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-8 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] shadow-2xl border border-slate-700/50 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black">
                {selectedIds.length}
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Selected</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2.5 font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
              >
                {isProcessing ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Approve All
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={isProcessing}
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 py-2.5 font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
              >
                {isProcessing ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete All
              </Button>
              <button
                onClick={() => setSelectedIds([])}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
        {contents.map((content, index) => (
          <ContentCard
            key={content.id}
            content={content}
            index={index}
            isSelected={selectedIds.includes(content.id)}
            onSelect={() => toggleSelect(content.id)}
          />
        ))}
        </AnimatePresence>
      </div>

      <div className="pt-12 border-t border-slate-200/60 dark:border-slate-800/60">
        <PaginationControls
          pagination={pagination}
          currentParams={currentParams}
        />
      </div>
    </div>
  );
}
