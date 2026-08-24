'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { sendInvitationEmail } from '@/lib/email-service';
import { logInvitationAction, logMemberAction } from '../lib/audit';
import { UserRole } from '@/types';

async function enforceRole(userId: string, businessId: string, allowedRoles: UserRole[]) {
  const member = await prisma.businessMember.findFirst({
    where: { userId, businessId },
  });
  if (!member || !allowedRoles.includes(member.role)) {
    throw new Error('Unauthorized or insufficient permissions');
  }
  return member;
}

async function getUserRole(userId: string, businessId: string): Promise<UserRole> {
  const member = await prisma.businessMember.findFirst({
    where: { userId, businessId },
  });
  if (!member) {
    throw new Error('User is not a member of this business');
  }
  return member.role;
}

function canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
  // Owners can assign any role
  if (assignerRole === 'OWNER') return true;

  // Admins can assign Editor and Viewer roles
  if (assignerRole === 'ADMIN') {
    return targetRole === 'EDITOR' || targetRole === 'VIEWER';
  }

  // Editors and Viewers cannot assign roles
  return false;
}

function canManageInvitations(role: UserRole): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}

export async function inviteTeamMembersBulk(data: {
  emails: string[];
  role: UserRole;
  businessId: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  let targetBusinessId = data.businessId;
  if (!targetBusinessId || targetBusinessId === 'placeholder-id') {
    let business = await prisma.business.findFirst({
      where: { members: { some: { userId: session.user.id } } }
    });

    if (!business) {
      business = await prisma.business.create({
        data: {
          name: `${session.user.name || 'My'}'s Workspace`,
          slug: `${session.user.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}-workspace-${Date.now().toString().slice(-4)}`,
          members: {
            create: {
              userId: session.user.id,
              role: 'OWNER',
            },
          },
        },
      });
    }
    targetBusinessId = business.id;
  }

  // Get user role and check permissions
  const userRole = await getUserRole(session.user.id, targetBusinessId);

  if (!canManageInvitations(userRole)) {
    throw new Error('You do not have permission to invite team members');
  }

  if (!canAssignRole(userRole, data.role)) {
    throw new Error(`You cannot assign the ${data.role} role`);
  }

  const businessInfo = await prisma.business.findUnique({
    where: { id: targetBusinessId },
    select: { name: true }
  });

  const results = [];
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

  for (const email of data.emails) {
    try {
      // Check if invitation already exists
      const existingInvitation = await prisma.teamInvitation.findFirst({
        where: {
          email: email.toLowerCase(),
          businessId: targetBusinessId,
          acceptedAt: null,
          expiresAt: { gt: new Date() }
        }
      });

      if (existingInvitation) {
        results.push({ email, status: 'exists', invitation: existingInvitation });
        continue;
      }

      const token = Math.random().toString(36).substring(2, 15);

      const invitation = await prisma.teamInvitation.create({
        data: {
          email: email.toLowerCase(),
          role: data.role,
          businessId: targetBusinessId,
          invitedById: session.user.id,
          token,
          expiresAt,
        },
      });

      const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/invite/${token}`;

      await sendInvitationEmail(
        email,
        session.user.name || 'A team member',
        businessInfo?.name || 'Workspace',
        data.role,
        inviteUrl
      );

      results.push({ email, status: 'sent', invitation });

      // Log the invitation creation
      await logInvitationAction({
        invitationId: invitation.id,
        action: 'CREATED',
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email || '',
        details: { email, role: data.role }
      });
    } catch (error) {
      results.push({ email, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  revalidatePath('/team');
  return results;
}

export async function inviteTeamMember(data: {
  email: string;
  role: UserRole;
  businessId: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  let targetBusinessId = data.businessId;
  if (!targetBusinessId || targetBusinessId === 'placeholder-id') {
    let business = await prisma.business.findFirst({
      where: { members: { some: { userId: session.user.id } } }
    });

    if (!business) {
      business = await prisma.business.create({
        data: {
          name: `${session.user.name || 'My'}'s Workspace`,
          slug: `${session.user.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}-workspace-${Date.now().toString().slice(-4)}`,
          members: {
            create: {
              userId: session.user.id,
              role: 'OWNER',
            },
          },
        },
      });
    }
    targetBusinessId = business.id;
  }

  // Get user role and check permissions
  const userRole = await getUserRole(session.user.id, targetBusinessId);

  if (!canManageInvitations(userRole)) {
    throw new Error('You do not have permission to invite team members');
  }

  if (!canAssignRole(userRole, data.role)) {
    throw new Error(`You cannot assign the ${data.role} role`);
  }

  const token = Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

  const businessInfo = await prisma.business.findUnique({
    where: { id: targetBusinessId },
    select: { name: true }
  });

  const invitation = await prisma.teamInvitation.create({
    data: {
      email: data.email,
      role: data.role,
      businessId: targetBusinessId,
      invitedById: session.user.id,
      token,
      expiresAt,
    },
  });

  const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/invite/${token}`;

  await sendInvitationEmail(
    data.email,
    session.user.name || 'A team member',
    businessInfo?.name || 'Workspace',
    data.role,
    inviteUrl
  );

  revalidatePath('/team');
  return invitation;
}

export async function removeTeamMember(memberId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const targetMember = await prisma.businessMember.findUnique({
    where: { id: memberId },
    include: {
      business: true,
      user: { select: { email: true } }
    }
  });

  if (!targetMember) throw new Error('Member not found');

  const userRole = await getUserRole(session.user.id, targetMember.businessId);

  if (!canManageInvitations(userRole)) {
    throw new Error('You do not have permission to remove team members');
  }

  // Prevent removing the owner unless you are the owner
  if (targetMember.role === 'OWNER' && userRole !== 'OWNER') {
    throw new Error('Only owners can remove other owners');
  }

  // Prevent self-removal
  if (targetMember.userId === session.user.id) {
    throw new Error('You cannot remove yourself from the team');
  }

  await prisma.businessMember.delete({
    where: { id: memberId },
  });

  // Log the member removal
  await logMemberAction({
    memberId,
    action: 'REMOVED',
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email || '',
    details: {
      removedMemberId: targetMember.userId,
      removedMemberRole: targetMember.role,
      removedMemberEmail: targetMember.user?.email
    }
  });

  revalidatePath('/team');
  return { success: true };
}

export async function updateMemberRole(memberId: string, role: UserRole) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const targetMember = await prisma.businessMember.findUnique({
    where: { id: memberId },
    include: {
      business: true,
      user: { select: { email: true } }
    }
  });

  if (!targetMember) throw new Error('Member not found');

  const userRole = await getUserRole(session.user.id, targetMember.businessId);

  if (!canManageInvitations(userRole)) {
    throw new Error('You do not have permission to update member roles');
  }

  if (!canAssignRole(userRole, role)) {
    throw new Error(`You cannot assign the ${role} role`);
  }

  // Prevent modifying owner roles unless you are the owner
  if (targetMember.role === 'OWNER' && userRole !== 'OWNER') {
    throw new Error('Only owners can modify owner roles');
  }

  // Prevent self-role changes that would reduce permissions
  if (targetMember.userId === session.user.id && userRole !== 'OWNER') {
    throw new Error('You cannot change your own role');
  }

  await prisma.businessMember.update({
    where: { id: memberId },
    data: { role },
  });

  // Log the role change
  await logMemberAction({
    memberId,
    action: 'ROLE_CHANGED',
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email || '',
    details: {
      oldRole: targetMember.role,
      newRole: role,
      targetUserId: targetMember.userId
    }
  });

  revalidatePath('/team');
  return { success: true };
}

export async function cancelInvitation(invitationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const targetInvitation = await prisma.teamInvitation.findUnique({ where: { id: invitationId } });
  if (!targetInvitation) throw new Error('Invitation not found');

  await enforceRole(session.user.id, targetInvitation.businessId, ['OWNER', 'ADMIN']);

  await prisma.teamInvitation.delete({
    where: { id: invitationId },
  });

  revalidatePath('/team');
  return { success: true };
}

export async function resendInvitation(invitationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const targetInvitation = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
    include: {
      business: true,
      invitedBy: true,
    }
  });

  if (!targetInvitation) throw new Error('Invitation not found');

  await enforceRole(session.user.id, targetInvitation.businessId, ['OWNER', 'ADMIN']);

  // Check if invitation is expired or already accepted
  if (targetInvitation.acceptedAt) {
    throw new Error('Invitation has already been accepted');
  }

  if (targetInvitation.expiresAt < new Date()) {
    // Generate new token and extend expiration
    const newToken = Math.random().toString(36).substring(2, 15);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const updatedInvitation = await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
      },
    });

    const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/invite/${newToken}`;

    await sendInvitationEmail(
      targetInvitation.email,
      session.user.name || 'A team member',
      targetInvitation.business.name,
      targetInvitation.role,
      inviteUrl
    );

    revalidatePath('/team');
    return updatedInvitation;
  } else {
    // Resend existing invitation
    const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/invite/${targetInvitation.token}`;

    await sendInvitationEmail(
      targetInvitation.email,
      session.user.name || 'A team member',
      targetInvitation.business.name,
      targetInvitation.role,
      inviteUrl
    );

    revalidatePath('/team');
    return targetInvitation;
  }
}

export async function updateInvitation(id: string, data: {
  email?: string;
  role?: UserRole;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const targetInvitation = await prisma.teamInvitation.findUnique({ where: { id } });
  if (!targetInvitation) throw new Error('Invitation not found');

  await enforceRole(session.user.id, targetInvitation.businessId, ['OWNER', 'ADMIN']);

  const invitation = await prisma.teamInvitation.update({
    where: { id },
    data,
  });

  revalidatePath('/team');
  return invitation;
}
