'use client';

import { useState } from 'react';
import { Brain, Sparkles, BookOpen } from 'lucide-react';
import { KnowledgeProfile } from './knowledge-profile';
import { KnowledgeSummary } from './knowledge-summary';
import { KnowledgeDocuments } from './knowledge-documents';
import type { BusinessProfileInput } from '@/features/knowledge/types';
import { motion, AnimatePresence } from 'framer-motion';

interface KnowledgeLayoutProps {
  profile: BusinessProfileInput;
  documents: any[];
}

export function KnowledgeLayout({ profile, documents }: KnowledgeLayoutProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'dna' | 'docs'>('profile');

  const tabs = [
    { id: 'profile', label: 'Identity Profile', icon: Brain, desc: 'Core brand properties & audit trail' },
    { id: 'dna', label: 'AI Brand DNA Canvas', icon: Sparkles, desc: 'Multi-variant AI positioning summaries' },
    { id: 'docs', label: 'RAG Context Documents', icon: BookOpen, desc: 'Ingested brand libraries & files' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Premium Tabs navigation bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-xl text-left border transition-all ${
                isActive
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs'
                  : 'border-border/80 hover:border-primary/40 bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">{tab.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{tab.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Contents with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <KnowledgeProfile initialData={profile} />
            </div>
          )}

          {activeTab === 'dna' && (
            <div className="space-y-6">
              <KnowledgeSummary />
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-6">
              <KnowledgeDocuments initialDocuments={documents} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
