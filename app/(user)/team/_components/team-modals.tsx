'use client';

import { useEffect, useState } from 'react';
import { BulkInviteModal } from './bulk-invite-modal';
import { InviteMemberModal } from './invite-member-modal';

export function TeamModals({ businessId }: { businessId: string }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);

  useEffect(() => {
    const handleOpenInvite = () => setShowInviteModal(true);
    const handleOpenBulkInvite = () => setShowBulkInviteModal(true);

    window.addEventListener('open-invite-modal', handleOpenInvite);
    window.addEventListener('open-bulk-invite-modal', handleOpenBulkInvite);

    return () => {
      window.removeEventListener('open-invite-modal', handleOpenInvite);
      window.removeEventListener('open-bulk-invite-modal', handleOpenBulkInvite);
    };
  }, []);

  return (
    <>
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          businessId={businessId}
        />
      )}
      {showBulkInviteModal && (
        <BulkInviteModal
          onClose={() => setShowBulkInviteModal(false)}
          businessId={businessId}
        />
      )}
    </>
  );
}
