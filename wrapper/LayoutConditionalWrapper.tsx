'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import UserLayoutWrapper from '@/wrapper/UserLayoutWrapper';

interface LayoutConditionalWrapperProps {
  children: React.ReactNode;
}

export function LayoutConditionalWrapper({ children }: LayoutConditionalWrapperProps) {
  const pathname = usePathname();

  // Check if current path is the review submission page
  const isReviewSubmitPage = pathname?.startsWith('/reviews/submit');

  // If it's the review submission page, render children without layout
  if (isReviewSubmitPage) {
    return <>{children}</>;
  }

  // Otherwise, wrap with UserLayoutWrapper
  return <UserLayoutWrapper>{children}</UserLayoutWrapper>;
}
