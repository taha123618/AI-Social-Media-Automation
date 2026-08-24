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
    <div className="flex gap-3">
      <Button
        onClick={handleBulkInvite}
        className="group relative h-14 px-6 rounded-2xl bg-purple-600 font-black text-white hover:bg-purple-700 transition-all active:scale-95 shadow-xl shadow-purple-500/25 overflow-hidden border-none"
      >
        <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-3">
          <Users className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="hidden sm:inline">Bulk Invite</span>
          <span className="sm:hidden">Bulk</span>
        </div>
      </Button>
      <Button
        onClick={handleSingleInvite}
        className="group relative h-14 px-8 rounded-2xl bg-blue-600 font-black text-white hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/25 overflow-hidden border-none"
      >
        <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-3">
          <UserPlus className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
          <span>Invite</span>
        </div>
      </Button>
    </div>
  );
}
