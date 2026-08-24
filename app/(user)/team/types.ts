export interface TeamMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  joinedAt: Date;
  userId: string;
  businessId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  business: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  token: string;
  acceptedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  businessId: string;
  invitedById: string;
  business: {
    id: string;
    name: string;
    slug: string;
  };
  invitedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface InviteMemberData {
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export interface UpdateMemberRoleData {
  memberId: string;
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
}
