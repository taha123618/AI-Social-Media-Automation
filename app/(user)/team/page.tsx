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
import { EntitlementService } from '@/features/billing/services/entitlement.service';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;
  const activeWorkspaceId = await getActiveWorkspaceId();

  // If no workspace is found, safe fallback
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

  // Check Team Collaboration Entitlement
  const canCollaborate = activeWorkspaceId
    ? await EntitlementService.canAccess(activeWorkspaceId, 'team_collaboration')
    : { allowed: true };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <TeamHeader userRole={userRole} />

        {!canCollaborate.allowed ? (
          <div className="mt-8">
            <UpgradePrompt feature="team_collaboration" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <TeamMembersList members={teamMembers} userRole={userRole} />
              <TeamInvitations invitations={teamInvitations} userRole={userRole} />
            </div>
            {activeWorkspaceId && <TeamModals businessId={activeWorkspaceId} />}
          </>
        )}
    </div>
  );
}
