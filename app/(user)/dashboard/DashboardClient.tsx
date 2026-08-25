'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusCircle, Brain, Calendar, BarChart3, FileText, Users, Search, X, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickAction } from './_components/quick-action';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { toast } from 'sonner';

export function DashboardNewContentButton() {
  return (
    <Link href="/contents">
      <Button size="lg" className="gap-2">
        <PlusCircle className="h-4 w-4" />
        NEW OPERATIONAL CONTENT
      </Button>
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
    <div className="grid gap-2">
      <QuickAction
        index={0}
        icon={<Brain className="h-4 w-4" />}
        label="Generate Content"
        onClick={() => handleQuickAction('Generate Content')}
      />
      <QuickAction
        index={1}
        icon={<Calendar className="h-4 w-4" />}
        label="Schedule Posts"
        onClick={() => handleQuickAction('Schedule Posts')}
      />
      <QuickAction
        index={2}
        icon={<BarChart3 className="h-4 w-4" />}
        label="View Analytics"
        onClick={() => handleQuickAction('View Analytics')}
      />
      <QuickAction
        index={3}
        icon={<MessageSquare className="h-4 w-4" />}
        label="Social Inbox"
        onClick={() => handleQuickAction('Engagement')}
      />
      <QuickAction
        index={4}
        icon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
        label={isProcessing ? "Processing..." : "Auto-Reply Now"}
        onClick={() => handleQuickAction('Process Engagement')}
      />
      <QuickAction
        index={5}
        icon={<FileText className="h-4 w-4" />}
        label="Manage Knowledge"
        onClick={() => handleQuickAction('Manage Knowledge')}
      />
      <QuickAction
        index={6}
        icon={<Users className="h-4 w-4" />}
        label="Team Settings"
        onClick={() => handleQuickAction('Team Settings')}
      />
    </div>
  );
}

export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-none border border-border bg-card p-6 text-center">
      <div className="h-12 w-12 rounded-none bg-secondary border border-border flex items-center justify-center mb-3 text-muted-foreground">
        <PlusCircle className="h-6 w-6" />
      </div>
      <p className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
        NO RECENT OPERATIONAL DRAFTS
      </p>
      <p className="text-xs font-mono text-muted-foreground mt-1">
        Deploy an AI agent pipeline to generate platform campaigns.
      </p>
    </div>
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
    <div className="relative flex-1 md:max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="SEARCH TELEMETRY, CONTENTS, WORKFLOWS, CAMPAIGNS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-none border border-border bg-card py-2 pl-9 pr-16 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none font-mono uppercase transition-none"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-muted-foreground hover:text-foreground transition-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-none border border-border bg-secondary px-1 font-mono text-[9px] font-bold text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  );
}
