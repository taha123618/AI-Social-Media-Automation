'use client';

import { useState } from 'react';
import { Search, CheckCircle2, Trash2, X, Loader2, Plus, Sparkles } from 'lucide-react';
import { ContentDraft, Pagination, SearchParams } from '../types';
import { ContentCard } from './content-card';
import { PaginationControls } from './pagination-controls';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { bulkUpdateContentStatus, bulkDeleteContentDrafts } from '../actions/mutations';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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
      window.dispatchEvent(new CustomEvent('drafts-updated'));
    } catch {
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
    } catch {
      toast.error('Failed to delete items');
    } finally {
      setIsProcessing(false);
    }
  };

  if (contents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed border-border/80 bg-card/40 text-center relative overflow-hidden"
      >
        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-xs">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">No drafts match your criteria</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Create a new content piece with autonomous AI agents or refine your active search filters.
        </p>
        <Button
          onClick={() => window.dispatchEvent(new CustomEvent('open-create-content'))}
          size="sm"
          className="h-9 px-4 text-xs font-semibold rounded-xl gap-1.5 shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Content Draft</span>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-card/95 backdrop-blur-xl text-foreground rounded-2xl shadow-2xl border border-border/90"
          >
            <div className="flex items-center gap-2 pr-3 border-r border-border/70">
              <Badge variant="default" className="h-6 px-2 text-[11px] font-mono">
                {selectedIds.length}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>Approve All</span>
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 shadow-xs"
              >
                {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Delete All</span>
              </Button>

              <button
                onClick={() => setSelectedIds([])}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Pagination */}
      <div className="pt-6 border-t border-border/60">
        <PaginationControls
          pagination={pagination}
          currentParams={currentParams}
        />
      </div>
    </div>
  );
}
