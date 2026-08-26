import { PostScheduleHeader } from './_components/post-schedule-header';
import { PostScheduleList } from './_components/post-schedule-list';
import { getScheduledPosts } from './actions/get-scheduled-posts';
import { SearchParams } from './types';
import { PostingSchedule } from '@/features/scheduler/components/posting-schedule';
import { getActiveWorkspaceId } from '../actions/workspace';

interface PostSchedulePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PostSchedulePage({ searchParams }: PostSchedulePageProps) {
  const resolvedParams = await searchParams;
  const businessId = await getActiveWorkspaceId();

  const { scheduledPosts } = await getScheduledPosts(resolvedParams);

  if (!businessId) {
    return (
      <div className="py-16 text-center">
        <p className="text-base font-bold text-foreground">
          No active workspace selected.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Please choose a workspace to configure your posting schedule.
        </p>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Header Section */}
      <PostScheduleHeader />

      {/* Posting Schedule Configuration */}
      <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
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
  );
}
