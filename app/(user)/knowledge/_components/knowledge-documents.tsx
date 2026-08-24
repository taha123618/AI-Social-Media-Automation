'use client';

import { FileText, Plus, Clock, Loader2, AlertCircle, CheckCircle2, Search, X, Database, Zap, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { registerKnowledgeDocument, searchKnowledgeChunks } from '../actions';
import { toast } from 'sonner';

export function KnowledgeDocuments({ initialDocuments }: { initialDocuments: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [vectorResults, setVectorResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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

    // Perform vector search when search term changes
    if (debouncedSearch.trim()) {
      performVectorSearch(debouncedSearch);
    } else {
      setVectorResults([]);
    }
  }, [debouncedSearch, createQueryString, router, searchParams]);

  const performVectorSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchKnowledgeChunks(query);
      setVectorResults(results);
    } catch (error) {
      console.error('Vector search failed:', error);
      toast.error('Failed to search knowledge base');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddDocument = async () => {
    setIsUploading(true);
    try {
      // Simulate file picker by just registering a mock doc for Alpha
      const mockDocs = [
        { name: 'Marketing Strategy 2024.pdf', type: 'application/pdf' },
        { name: 'Brand Guidelines.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { name: 'Product Specs.pdf', type: 'application/pdf' }
      ];
      const randomDoc = mockDocs[Math.floor(Math.random() * mockDocs.length)];

      await registerKnowledgeDocument(randomDoc.name, randomDoc.type);
      toast.success(`Successfully uploaded ${randomDoc.name}`);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-sm pl-11 pr-10 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white"
        />
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-3.5 w-3.5 stroke-[3px]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={handleAddDocument}
        disabled={isUploading}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-all dark:border-slate-800 disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
        <span className="font-bold">{isUploading ? 'Registering...' : 'Add Document'}</span>
      </button>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Database className="h-4 w-4" />
          <span>Knowledge Documents ({initialDocuments.length})</span>
        </div>
        {initialDocuments.map((doc, idx) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center dark:bg-slate-800">
                <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {doc.filename}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{doc.fileType || 'PDF'}</span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1" suppressHydrationWarning>
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <StatusBadge status={doc.status} />
          </motion.div>
        ))}

        {initialDocuments.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">No documents uploaded yet.</p>
          </div>
        )}
      </div>

      {/* Vector Search Results */}
      {(vectorResults.length > 0 || isSearching) && (
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Brain className="h-4 w-4" />
            <span>AI-Powered Insights</span>
            {isSearching && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </div>

          <div className="space-y-3">
            {vectorResults.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{result.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Similarity: {(result.similarity * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">From knowledge base</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {vectorResults.length === 0 && !isSearching && (
              <div className="text-center py-6 text-slate-400">
                <p className="text-sm">No relevant insights found for your search.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'ACTIVE':
      return (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
          <CheckCircle2 className="h-3 w-3" />
          ACTIVE
        </div>
      );
    case 'PROCESSING':
      return (
        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
          <Loader2 className="h-3 w-3 animate-spin" />
          PROCESSING
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1 text-slate-600 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
          <AlertCircle className="h-3 w-3" />
          {status}
        </div>
      );
  }
}
