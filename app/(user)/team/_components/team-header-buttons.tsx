'use client';

import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

export function TeamHeaderButtons({ userRole }: { userRole: string }) {
  const handleBulkInvite = () => {
    window.dispatchEvent(new CustomEvent('open-bulk-invite-modal'));
  };

  const handleSingleInvite = () => {
    window.dispatchEvent(new CustomEvent('open-invite-modal'));
  };

  if (!['OWNER', 'ADMIN'].includes(userRole)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2.5">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBulkInvite}
        className="text-xs font-semibold rounded-lg gap-1.5"
      >
        <Users className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Bulk Invite</span>
        <span className="sm:hidden">Bulk</span>
      </Button>
      <Button
        size="sm"
        onClick={handleSingleInvite}
        className="text-xs font-semibold rounded-lg gap-1.5"
      >
        <UserPlus className="h-3.5 w-3.5" />
        <span>Invite Member</span>
      </Button>
    </div>
  );
}
