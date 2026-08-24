import prisma from '@/lib/prisma';

export interface AuditTrail {
  action: string;
  timestamp: Date;
  userId: string;
  userName: string | null;
  userEmail: string;
  details: Record<string, unknown>;
}

export async function logInvitationAction(data: {
  invitationId: string;
  action: 'CREATED' | 'RESENT' | 'CANCELLED' | 'UPDATED' | 'ACCEPTED' | 'EXPIRED';
  userId: string;
  userName: string | null;
  userEmail: string;
  details?: Record<string, unknown>;
}) {
  // For now, we'll store audit info in the invitation's metadata
  // In a production system, you'd want a separate auditLog table
  const auditEntry: AuditTrail = {
    action: data.action,
    timestamp: new Date(),
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    details: data.details || {},
  };

  // This would typically be stored in a separate audit log table
  // For now, we'll just return the structured data for logging
  console.log('Invitation Audit:', auditEntry);
  return auditEntry;
}

export async function logMemberAction(data: {
  memberId: string;
  action: 'ROLE_CHANGED' | 'REMOVED' | 'ADDED';
  userId: string;
  userName: string | null;
  userEmail: string;
  details?: Record<string, unknown>;
}) {
  const auditEntry: AuditTrail = {
    action: data.action,
    timestamp: new Date(),
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    details: data.details || {},
  };

  console.log('Member Audit:', auditEntry);
  return auditEntry;
}

export function formatAuditMessage(audit: AuditTrail): string {
  switch (audit.action) {
    case 'CREATED':
      return `${audit.userName || audit.userEmail} created invitation`;
    case 'RESENT':
      return `${audit.userName || audit.userEmail} resent invitation`;
    case 'CANCELLED':
      return `${audit.userName || audit.userEmail} cancelled invitation`;
    case 'UPDATED':
      return `${audit.userName || audit.userEmail} updated invitation`;
    case 'ACCEPTED':
      return `${audit.userName || audit.userEmail} accepted invitation`;
    case 'EXPIRED':
      return `Invitation expired automatically`;
    case 'ROLE_CHANGED':
      const oldRole = audit.details.oldRole as string;
      const newRole = audit.details.newRole as string;
      return `${audit.userName || audit.userEmail} changed role from ${oldRole} to ${newRole}`;
    case 'REMOVED':
      return `${audit.userName || audit.userEmail} removed team member`;
    case 'ADDED':
      return `${audit.userName || audit.userEmail} added team member`;
    default:
      return `${audit.userName || audit.userEmail} performed ${audit.action}`;
  }
}
