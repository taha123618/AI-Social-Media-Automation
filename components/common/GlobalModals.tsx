'use client';

import { useState, useEffect } from 'react';
import { CreateContentModal } from '@/app/(user)/contents/_components/create-content-modal';
import { CreateWorkflowModal } from '@/app/(user)/workflows/_components/create-workflow-modal';
import { InviteMemberModal } from '@/app/(user)/team/_components/invite-member-modal';
import { ContentDetailsModal } from '@/app/(user)/contents/_components/content-details-modal';
import { ScheduleContentModal } from '@/app/(user)/contents/_components/schedule-content-modal';
import { AnimatePresence } from 'framer-motion';
import { ContentDraft } from '@/app/(user)/contents/types';

export function GlobalModals() {
  const [showContentModal, setShowContentModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectedContent, setSelectedContent] = useState<ContentDraft | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [activeBusinessId, setActiveBusinessId] = useState<string>('placeholder-id');

  useEffect(() => {
    const openCreateContent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSelectedContent(null);
      if (detail?.businessId) setActiveBusinessId(detail.businessId);
      setShowContentModal(true);
    };

    const editContent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.content) {
        setSelectedContent(detail.content);
        if (detail?.businessId) setActiveBusinessId(detail.businessId);
        setShowContentModal(true);
      } else {
        console.error('[GlobalModals] Passed edit-content event without detail.content!', detail);
      }
    };

    const openInvite = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSelectedInvitation(detail?.invitation || null);
      if (detail?.businessId) setActiveBusinessId(detail.businessId);
      setShowInviteModal(true);
    };
    const openWorkflow = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSelectedTemplate(detail?.workflow || detail?.template || null);
      if (detail?.businessId) setActiveBusinessId(detail.businessId);
      setShowWorkflowModal(true);
    };
    const openDetails = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSelectedContent(detail?.content || null);
      setShowDetailsModal(true);
    };
    const openSchedule = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSelectedContent(detail?.content || null);
      if (detail?.businessId) setActiveBusinessId(detail.businessId);
      setShowScheduleModal(true);
    };

    window.addEventListener('open-create-content', openCreateContent);
    window.addEventListener('edit-content', editContent);
    window.addEventListener('view-content-details', openDetails);
    window.addEventListener('open-scheduler', openSchedule);
    window.addEventListener('open-invite-modal', openInvite);
    window.addEventListener('edit-invitation', openInvite);
    window.addEventListener('open-create-workflow', openWorkflow);
    window.addEventListener('edit-workflow', openWorkflow);

    return () => {
      window.removeEventListener('open-create-content', openCreateContent);
      window.removeEventListener('edit-content', editContent);
      window.removeEventListener('view-content-details', openDetails);
      window.removeEventListener('open-scheduler', openSchedule);
      window.removeEventListener('open-invite-modal', openInvite);
      window.removeEventListener('edit-invitation', openInvite);
      window.removeEventListener('open-create-workflow', openWorkflow);
      window.removeEventListener('edit-workflow', openWorkflow);
    };
  }, []);

  return (
    <>
      {showContentModal && (
        <CreateContentModal
          key={selectedContent?.id || 'new'}
          onClose={() => {
            setShowContentModal(false);
            setSelectedContent(null);
          }}
          initialData={selectedContent}
          businessId={activeBusinessId}
        />
      )}
      {showWorkflowModal && (
        <CreateWorkflowModal
          onClose={() => {
            setShowWorkflowModal(false);
            setSelectedTemplate(null);
          }}
          initialData={selectedTemplate}
          businessId={activeBusinessId}
        />
      )}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => {
            setShowInviteModal(false);
            setSelectedInvitation(null);
          }}
          initialData={selectedInvitation}
          businessId={activeBusinessId}
        />
      )}

      <AnimatePresence>
        {showDetailsModal && selectedContent && (
          <ContentDetailsModal
            key="content-details-modal"
            content={selectedContent}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedContent(null);
            }}
          />
        )}
        {showScheduleModal && selectedContent && (
          <ScheduleContentModal
            key="schedule-content-modal"
            content={selectedContent}
            onClose={() => {
              setShowScheduleModal(false);
              setSelectedContent(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
