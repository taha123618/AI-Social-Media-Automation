'use client';

import { FileText, Plus, Clock, Loader2, AlertCircle, CheckCircle2, Search, X, Database, Zap, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { registerKnowledgeDocument, searchKnowledgeChunks } from '../actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      setVectorResults(results || []);
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
      const mockDocs = [
        { name: 'Brand Strategy & Voice Guide.pdf', type: 'application/pdf' },
        { name: 'Product Positioning Matrix.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { name: 'Target ICP Personas.pdf', type: 'application/pdf' },
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
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Semantic vector search across ingested brand documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 pl-10 pr-10 text-xs bg-secondary/30 rounded-lg border-border/70 text-foreground placeholder:text-muted-foreground"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Upload Zone */}
      <button
        onClick={handleAddDocument}
        disabled={isUploading}
        className="w-full flex items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border/80 bg-card/50 p-6 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        <span className="font-semibold text-xs">{isUploading ? 'Registering Document...' : 'Upload Knowledge Document (PDF, DOCX, TXT)'}</span>
      </button>

      {/* Ingested Documents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
          <div className="flex items-center gap-1.5 font-medium">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span>Ingested Documents ({initialDocuments.length})</span>
          </div>
          <span className="font-mono text-[11px]">pgvector indexed</span>
        </div>

        {initialDocuments.map((doc, idx) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground line-clamp-1">
                  {doc.filename}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase font-mono font-semibold text-muted-foreground">{doc.fileType || 'PDF'}</span>
                  <span className="text-[10px] text-muted-foreground/60">•</span>
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1" suppressHydrationWarning>
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
          <div className="text-center py-10 rounded-xl border border-border/60 bg-card/40">
            <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground">No brand knowledge documents uploaded yet.</p>
          </div>
        )}
      </div>

      {/* Vector Search Results */}
      {(vectorResults.length > 0 || isSearching) && (
        <div className="mt-8 pt-6 border-t border-border/70 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Brain className="h-4 w-4 text-primary" />
            <span>Semantic RAG Chunks Retrieved</span>
            {isSearching && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary ml-1" />}
          </div>

          <div className="space-y-2.5">
            {vectorResults.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-secondary/30 border border-border/80 space-y-2"
              >
                <div className="flex items-start gap-3">
                  <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{result.content}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <span className="text-primary font-bold">
                        Cosine Similarity: {(result.similarity * 100).toFixed(1)}%
                      </span>
                      <span>•</span>
                      <span>Grounding context</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {vectorResults.length === 0 && !isSearching && (
              <div className="text-center py-6 text-xs text-muted-foreground">
                <p>No matching semantic vectors found for query.</p>
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
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-mono uppercase gap-1">
          <CheckCircle2 className="h-3 w-3" />
          ACTIVE
        </Badge>
      );
    case 'PROCESSING':
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono uppercase gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          INDEXING
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] font-mono uppercase gap-1">
          <AlertCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
  }
}
