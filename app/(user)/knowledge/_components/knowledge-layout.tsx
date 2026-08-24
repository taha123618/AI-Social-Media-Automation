'use client';

import { useState } from 'react';
import { Brain, FileText, Sparkles, BookOpen } from 'lucide-react';
import { KnowledgeProfile } from './knowledge-profile';
import { KnowledgeSummary } from './knowledge-summary';
import { KnowledgeDocuments } from './knowledge-documents';
import type { BusinessProfileInput } from '@/features/knowledge/types';

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
    <div className="space-y-8">
      {/* Premium Tabs navigation bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-5 rounded-3xl text-left border-2 transition-all ${isActive
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-900/10 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-black text-sm text-slate-900 dark:text-white">{tab.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tab.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-300">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Brand DNA Profile Settings</h2>
            </div>
            <KnowledgeProfile initialData={profile} />
          </div>
        )}

        {activeTab === 'dna' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Brand DNA Canvas & Elevator Pitches</h2>
            </div>
            <KnowledgeSummary />
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">RAG Context Document Library</h2>
            </div>
            <KnowledgeDocuments initialDocuments={documents} />
          </div>
        )}
      </div>
    </div>
  );
}
