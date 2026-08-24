'use client';

import React from 'react';
import { EnhancedPostCreation } from './enhanced-post-creation';

export function PostCreationPage({ 
  resolvedParams,
  preselectedDateTime
}: { 
  resolvedParams?: { id?: string, duplicate?: string, scheduledFor?: string };
  preselectedDateTime?: string | null;
}) {
  return (
    <EnhancedPostCreation 
      preselectedDateTime={preselectedDateTime || resolvedParams?.scheduledFor || null} 
      editId={resolvedParams?.id}
      isDuplicate={resolvedParams?.duplicate === 'true'}
    />
  );
}
