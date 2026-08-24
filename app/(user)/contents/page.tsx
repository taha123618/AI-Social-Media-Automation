'use client';

import { use, useEffect } from 'react';
import { ContentsHeader } from './_components/contents-header';
import { ContentsList } from './_components/contents-list';
import { ContentsFilters } from './_components/contents-filters';
import { useContentDrafts } from '@/hooks/use-content-draft';
import { useQueryClient } from '@tanstack/react-query';
import { SearchParams } from './types';

interface ContentsPageProps {
  searchParams: Promise<SearchParams>;
}

export default function ContentsPage({ searchParams }: ContentsPageProps) {
  const resolvedParams = use(searchParams);
  const { data: contents = [], isLoading } = useContentDrafts(resolvedParams.status);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['content-drafts'] });
    };

    window.addEventListener('drafts-updated', handleUpdate);
    window.addEventListener('content-deleted', handleUpdate);

    return () => {
      window.removeEventListener('drafts-updated', handleUpdate);
      window.removeEventListener('content-deleted', handleUpdate);
    };
  }, [queryClient]);

  // We are bypassing traditional server pagination for now in favor of client sync.
  const pagination = {
    page: 1, limit: 50, total: contents.length, totalPages: 1, hasNext: false, hasPrev: false
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="space-y-4">
        <ContentsHeader />
        <ContentsFilters />
        <div className="pt-6">
          {isLoading ? (
            <div className="flex justify-center p-20 animate-pulse">Loading drafts...</div>
          ) : (
            <ContentsList
              contents={contents as any}
              pagination={pagination}
              currentParams={resolvedParams}
            />
          )}
        </div>
      </div>
    </div>
  );
}
