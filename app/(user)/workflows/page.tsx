import { WorkflowHeader } from './_components/workflow-header';
import { WorkflowList } from './_components/workflow-list';
import { WorkflowTemplates } from './_components/workflow-templates';
import { WorkflowFilters } from './_components/workflow-filters';
import { getWorkflows } from './actions/get-workflows';
import { SearchParams, WorkflowWithTeam } from '@/features/workflow/types';

interface WorkflowPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function WorkflowPage({ searchParams }: WorkflowPageProps) {
  const resolvedParams = await searchParams;
  const workflows = await getWorkflows(resolvedParams);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="space-y-4">
        <WorkflowHeader />

        <div className="pt-10">
          <WorkflowFilters />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WorkflowList workflows={workflows} />
          </div>
          <div className="lg:col-span-1">
            <WorkflowTemplates />
          </div>
        </div>
      </div>
    </div>
  );
}
