'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ContentsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [platformFilter, setPlatformFilter] = useState(searchParams.get('platform') || 'all');
  const [intentFilter, setIntentFilter] = useState(searchParams.get('intent') || 'all');

  const debouncedSearch = useDebounce(searchTerm, 500);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([name, value]) => {
        if (value === null || value === 'all' || value === '') {
          newParams.delete(name);
        } else {
          newParams.set(name, value);
        }
      });

      newParams.delete('page');
      return newParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const platform = searchParams.get('platform') || 'all';
    const intent = searchParams.get('intent') || 'all';

    if (search !== searchTerm) setSearchTerm(search);
    if (status !== statusFilter) setStatusFilter(status);
    if (platform !== platformFilter) setPlatformFilter(platform);
    if (intent !== intentFilter) setIntentFilter(intent);
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      const query = createQueryString({ search: debouncedSearch });
      router.push(`?${query}`, { scroll: false });
    }
  }, [debouncedSearch, createQueryString, router, searchParams]);

  const handleFilterChange = (name: string, value: string) => {
    const currentValue = searchParams.get(name) || 'all';
    if (value !== currentValue) {
      const query = createQueryString({ [name]: value });
      router.push(`?${query}`, { scroll: false });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    router.push('?', { scroll: false });
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'GENERATED', label: 'Generated' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'POSTED', label: 'Posted' },
    { value: 'FAILED', label: 'Failed' }
  ];

  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
    { value: 'TWITTER', label: 'Twitter' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'YOUTUBE', label: 'YouTube' }
  ];

  const intentOptions = [
    { value: 'all', label: 'All Intents' },
    { value: 'SALES', label: 'Sales' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'EVENT', label: 'Event' },
    { value: 'ENGAGEMENT', label: 'Engagement' },
    { value: 'BRAND_AWARENESS', label: 'Brand Awareness' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center py-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter by title, intent, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-9 h-9 text-xs bg-secondary/30 rounded-lg border-border/70"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Select Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { name: 'status', value: statusFilter, options: statusOptions },
          { name: 'platform', value: platformFilter, options: platformOptions },
          { name: 'intent', value: intentFilter, options: intentOptions }
        ].map((filter, idx) => (
          <div key={idx} className="relative">
            <select
              value={filter.value}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              className="appearance-none h-9 rounded-lg border border-border/70 bg-card px-3 pr-8 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value} className="bg-card text-foreground">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="h-9 px-3 text-xs rounded-lg gap-1 text-muted-foreground hover:text-foreground"
          title="Reset filters"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  );
}
