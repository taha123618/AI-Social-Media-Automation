import { ScheduleHeader } from './_components/schedule-header';
import { ScheduleCalendar } from './_components/schedule-calendar';
import { ScheduleFilters } from './_components/schedule-filters';
import { getScheduledContents } from './actions/get-scheduled-contents';
import { SearchParams } from './types';

interface SchedulePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const resolvedParams = await searchParams;
  const { scheduledContents } = await getScheduledContents(resolvedParams);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="space-y-4">
        <ScheduleHeader />
        <ScheduleFilters />

        <div className="pt-6">
          <ScheduleCalendar
            scheduledContents={scheduledContents}
            currentParams={resolvedParams}
          />
        </div>
      </div>
    </div>
  );
}
