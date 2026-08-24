import { TeamHeader } from './_components/team-header';
import { TeamMembersList } from './_components/team-members-list';
import { TeamInvitations } from './_components/team-invitations';
import { TeamModals } from './_components/team-modals';
import { getTeamMembers } from './actions/get-team-members';
import { getTeamInvitations } from './actions/get-team-invitations';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;
  const activeWorkspaceId = await getActiveWorkspaceId();

  // If no workspace is found, they might not belong to any.
  // The Switcher or layout will handle edge cases, but we need safe defaults here.
  const teamMembers = activeWorkspaceId ? await getTeamMembers(activeWorkspaceId, search) : [];
  const teamInvitations = activeWorkspaceId ? await getTeamInvitations(activeWorkspaceId) : [];

  const session = await auth.api.getSession({ headers: await headers() });
  let userRole = 'VIEWER';
  if (session?.user?.id && activeWorkspaceId) {
    const member = await prisma.businessMember.findFirst({
      where: { userId: session.user.id, businessId: activeWorkspaceId },
    });
    if (member) userRole = member.role;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="space-y-6">

        <TeamHeader userRole={userRole} />
        <div className="grid gap-6 lg:grid-cols-2">
          <TeamMembersList members={teamMembers} userRole={userRole} />
          <TeamInvitations invitations={teamInvitations} userRole={userRole} />
        </div>
      </div>
      {activeWorkspaceId && <TeamModals businessId={activeWorkspaceId} />}
    </div>
  );
}
