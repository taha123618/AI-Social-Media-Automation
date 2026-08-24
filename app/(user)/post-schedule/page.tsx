import { PostScheduleHeader } from './_components/post-schedule-header';
import { PostScheduleList } from './_components/post-schedule-list';
import { getScheduledPosts } from './actions/get-scheduled-posts';
import { SearchParams } from './types';
import { PostingSchedule } from '@/features/scheduler/components/posting-schedule';
import { getActiveWorkspaceId } from '../actions/workspace';

interface PostSchedulePageProps {
   searchParams: Promise<SearchParams>;
}

/**
 * Post Schedule Page - Server Component (Next.js 16 SSR approach)
 *
 * Displays all scheduled posts with their publishing times and status.
 * Allows users to manage, edit, and delete scheduled posts.
 * Includes posting schedule configuration for automated publishing.
 *
 * Features:
 * - Server-side rendering for optimal performance
 * - Real-time status updates
 * - Integration with posting schedule cron system
 * - Validation of scheduled posts before cron execution
 * - Complete posting schedule time slot management
 */
export default async function PostSchedulePage({ searchParams }: PostSchedulePageProps) {
   const resolvedParams = await searchParams;

   const businessId = await getActiveWorkspaceId();

   const { scheduledPosts } = await getScheduledPosts(resolvedParams);

   if (!businessId) {
      return (
         <div className="mx-auto max-w-7xl py-16 text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
               No active workspace selected.
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
               Please choose a workspace to configure your posting schedule.
            </p>
         </div>
      );
   }

   // Convert searchParams to Record<string, string> for the list component
   const currentParams = Object.entries(resolvedParams).reduce(
      (acc, [key, value]) => {
         if (value !== undefined) {
            acc[key] = value;
         }
         return acc;
      },
      {} as Record<string, string>
   );

   return (
      <div className="mx-auto max-w-7xl">
         <div className="space-y-8">
            {/* Header Section */}
            {/* <PostScheduleHeader /> */}

            {/* Posting Schedule Configuration */}
            <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg">
               <PostingSchedule businessId={businessId} />
            </section>

            {/* Scheduled Posts List */}
            <section>
               <PostScheduleList
                  scheduledPosts={scheduledPosts}
                  currentParams={currentParams}
               />
            </section>
         </div>
      </div>
   );
}
