import prisma from '@/lib/prisma';
import { UserRole } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';

export interface CreateInvitationData {
  email: string;
  role: Exclude<UserRole, 'OWNER'>;
  businessId: string;
  invitedById: string;
}

export interface UpdateMemberRoleData {
  memberId: string;
  role: UserRole;
}

export interface TeamFilters {
  businessId: string;
  includeInactive?: boolean;
}

export class TeamService {
  static async getMembers(businessId: string, includeInactive = false) {
    const where: Record<string, unknown> = {
      businessId,
    };

    if (!includeInactive) {
      // Add any inactive conditions if applicable
    }

    return await prisma.businessMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  static async getMemberById(memberId: string, businessId: string) {
    return await prisma.businessMember.findFirst({
      where: {
        id: memberId,
        businessId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  static async updateMemberRole(memberId: string, businessId: string, role: UserRole) {
    const updated = await prisma.businessMember.update({
      where: {
        id: memberId,
        businessId,
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    await SystemLogger.logActivity({
      action: 'TEAM_MEMBER_ROLE_UPDATED',
      entity: 'BusinessMember',
      entityId: memberId,
      details: { businessId, newRole: role, userId: updated.userId }
    });

    return updated;
  }

  static async removeMember(memberId: string, businessId: string) {
    const deleted = await prisma.businessMember.delete({
      where: {
        id: memberId,
        businessId,
      },
    });

    await SystemLogger.logActivity({
      action: 'TEAM_MEMBER_REMOVED',
      entity: 'BusinessMember',
      entityId: memberId,
      details: { businessId, userId: deleted.userId }
    });

    return deleted;
  }

  static async inviteMember(data: CreateInvitationData) {
    // This would typically create an invitation record and send an email
    // For now, we'll return a mock response
    const invitation = {
      id: 'mock-invitation-id',
      email: data.email,
      role: data.role,
      token: 'mock-token',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    };

    await SystemLogger.logActivity({
      action: 'TEAM_INVITATION_SENT',
      entity: 'Invitation',
      details: { businessId: data.businessId, email: data.email, role: data.role }
    });

    return invitation;
  }

  static async getInvitations(businessId: string) {
    // This would query an invitations table
    // For now, return empty array
    return [];
  }

  static async acceptInvitation(token: string, userId: string) {
    // This would validate the token and create a BusinessMember record
    await SystemLogger.logActivity({
      action: 'TEAM_INVITATION_ACCEPTED',
      entity: 'Invitation',
      details: { userId, tokenPreview: token.substring(0, 8) }
    });

    return {
      success: true,
      message: 'Invitation accepted successfully',
    };
  }

  static async declineInvitation(token: string) {
    // This would mark the invitation as declined
    return {
      success: true,
      message: 'Invitation declined',
    };
  }

  static async cancelInvitation(invitationId: string, businessId: string) {
    // This would delete the invitation record
    await SystemLogger.logActivity({
      action: 'TEAM_INVITATION_CANCELLED',
      entity: 'Invitation',
      entityId: invitationId,
      details: { businessId }
    });

    return {
      success: true,
      message: 'Invitation cancelled',
    };
  }
}
