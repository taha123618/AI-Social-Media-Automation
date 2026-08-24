'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Mail, Send, X, Clock, CheckCircle, AlertCircle, Loader, Edit, RefreshCw, Users } from 'lucide-react';
import { TeamInvitation } from '../types';
import { cancelInvitation, resendInvitation } from '../actions/mutations';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface TeamInvitationsProps {
  invitations: TeamInvitation[];
  userRole: string;
}

export function TeamInvitations({ invitations, userRole }: TeamInvitationsProps) {
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<string | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState<string | null>(null);
  // Use null on first render (SSR) so server and client produce the same output.
  // After mount, update to the real current time.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const handleCancelInvite = async (id: string) => {
    setIsCancelling(id);
    try {
      await cancelInvitation(id);
      toast.success('Invitation cancelled');
    } catch {
      toast.error('Failed to cancel invitation');
    } finally {
      setIsCancelling(null);
      setShowConfirmCancel(null);
    }
  };

  const handleResendInvite = async (id: string) => {
    setIsResending(id);
    try {
      await resendInvitation(id);
      toast.success('Invitation resent successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend invitation';
      toast.error(errorMessage);
    } finally {
      setIsResending(null);
    }
  };

  const getInvitationStatus = (invitation: TeamInvitation) => {
    if (invitation.acceptedAt) {
      return { status: 'accepted', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle };
    }
    // Only check expiry once the client has mounted (now !== null)
    if (now && now > invitation.expiresAt) {
      return { status: 'expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: AlertCircle };
    }
    return { status: 'pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400', icon: Clock };
  };

  const activeInvitations = invitations?.filter((i: TeamInvitation) => !i.acceptedAt && (!now || now <= i.expiresAt)) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-2xl shadow-amber-500/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <Users className="h-8 w-8 relative z-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-900">
              {activeInvitations.length}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Team Invites
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {activeInvitations.length} pending invitation{activeInvitations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {['OWNER', 'ADMIN'].includes(userRole) && (
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent('open-invite-modal'))}
            className="cursor-pointer group relative h-14 px-8 rounded-2xl bg-blue-600 font-black text-white hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/25 overflow-hidden border-none"
          >
            <div className="absolute inset-0 bg-linear-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <Send className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
              <span>Send Invite</span>
            </div>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1">
        {invitations?.map((invitation: TeamInvitation, index: number) => {
          const statusInfo = getInvitationStatus(invitation);
          const StatusIcon = statusInfo.icon;

          return (
            <motion.div
              key={invitation.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-[2rem] bg-white/80 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:bg-slate-900/80 border border-white dark:border-slate-800 backdrop-blur-2xl hover:shadow-[0_32px_64px_-16px_rgba(59,130,246,0.2)] hover:border-blue-500/20 transition-all duration-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-linear-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Mail className="h-8 w-8 text-slate-400 transition-colors group-hover:text-blue-500" />
                    </div>
                    <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center ${statusInfo.color}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[200px]">
                      {invitation.email}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-xl border border-blue-100 dark:border-blue-800/50">
                        {invitation.role}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        by {invitation.invitedBy?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {statusInfo.status === 'pending'
                      ? `Exp. ${format(new Date(invitation.expiresAt), 'MMM dd')}`
                      : statusInfo.status === 'accepted'
                        ? `Acc. ${format(new Date(invitation.acceptedAt!), 'MMM dd')}`
                        : `Exp. ${format(new Date(invitation.expiresAt), 'MMM dd')}`
                    }
                  </div>

                  {['OWNER', 'ADMIN'].includes(userRole) && (statusInfo.status === 'pending' || statusInfo.status === 'expired') && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {statusInfo.status === 'expired' && (
                        <Button
                          onClick={() => handleResendInvite(invitation.id)}
                          disabled={isResending === invitation.id}
                          className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-400 hover:text-green-500 hover:border-green-500/50 transition-all active:scale-90 shadow-sm"
                          title="Resend invitation"
                        >
                          {isResending === invitation.id ? <Loader className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                        </Button>
                      )}
                      <Button
                        onClick={() => window.dispatchEvent(new CustomEvent('edit-invitation', { detail: { invitation } }))}
                        className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 transition-all active:scale-90 shadow-sm"
                        title="Edit invitation"
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={() => setShowConfirmCancel(invitation.id)}
                        disabled={isCancelling === invitation.id}
                        className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-400 hover:text-rose-500 hover:border-rose-500/50 transition-all active:scale-90 shadow-sm"
                        title="Cancel invitation"
                      >
                        {isCancelling === invitation.id ? <Loader className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5 stroke-[3px]" />}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {invitations.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="mx-auto h-20 w-20 rounded-[2.5rem] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mb-6">
              <Mail className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              No Team Invites
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-8">
              Start building your team by sending invitations to collaborators who need access to this workspace.
            </p>
            {['OWNER', 'ADMIN'].includes(userRole) && (
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent('open-invite-modal'))}
                className="group relative h-14 px-8 rounded-2xl bg-blue-600 font-black text-white hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/25 overflow-hidden border-none mx-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  <Send className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  <span>Send First Invite</span>
                </div>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showConfirmCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-[3rem] bg-white/80 p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] dark:bg-slate-900/80 border border-white dark:border-slate-800 backdrop-blur-2xl"
            >
              <div className="text-center">
                <div className="mx-auto mb-6 h-16 w-16 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-2xl shadow-amber-500/30">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Cancel Invitation?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  This will permanently void the invitation token and revoke access for this team member.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <Button
                  onClick={() => setShowConfirmCancel(null)}
                  className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  Go Back
                </Button>
                <button
                  onClick={() => handleCancelInvite(showConfirmCancel)}
                  disabled={!!isCancelling}
                  className="flex-1 h-16 rounded-2xl bg-amber-600 dark:bg-amber-500 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                >
                  {isCancelling ? <Loader className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
                  <span>{isCancelling ? 'Cancelling...' : 'Cancel Invite'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
