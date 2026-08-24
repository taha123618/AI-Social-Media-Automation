'use client';

import { useState } from 'react';
import { X, Loader, Send, Mail, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { inviteTeamMembersBulk } from '../actions/mutations';
import { toast } from 'sonner';
import { UserRole } from '@/app/generated/prisma/enums';

interface BulkInviteModalProps {
   onClose: () => void;
   businessId: string;
}

export function BulkInviteModal({ onClose, businessId }: BulkInviteModalProps) {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [emails, setEmails] = useState('');
   const [role, setRole] = useState<UserRole>('EDITOR');

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Parse emails
      const emailList = emails
         .split(/[,;\n\s]+/)
         .map(email => email.trim())
         .filter(email => email && email.includes('@'));

      if (emailList.length === 0) {
         return toast.error('Please enter at least one valid email address');
      }

      // Validate emails
      const invalidEmails = emailList.filter(email => !email.includes('@') || email.length < 5);
      if (invalidEmails.length > 0) {
         return toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }

      setIsSubmitting(true);
      try {
         const results = await inviteTeamMembersBulk({
            emails: emailList,
            role,
            businessId,
         });

         const successful = results.filter(r => r.status === 'sent').length;
         const existing = results.filter(r => r.status === 'exists').length;
         const failed = results.filter(r => r.status === 'error').length;

         if (successful > 0) {
            toast.success(`${successful} invitation${successful > 1 ? 's' : ''} sent successfully`);
         }

         if (existing > 0) {
            toast.info(`${existing} invitation${existing > 1 ? 's' : ''} already exist${existing > 1 ? '' : 's'}`);
         }

         if (failed > 0) {
            toast.error(`${failed} invitation${failed > 1 ? 's' : ''} failed to send`);
         }

         if (successful > 0 || existing > 0) {
            onClose();
         }
      } catch (error: unknown) {
         const errorMessage = error instanceof Error ? error.message : 'Failed to send invitations';
         toast.error(errorMessage);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xl">
         <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl rounded-[3rem] bg-white/80 p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:bg-slate-900/80 border border-white dark:border-slate-800 backdrop-blur-2xl"
         >
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-linear-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/40 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent" />
                     <Users className="h-8 w-8 relative z-10" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Bulk Invite
                     </h2>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Invite multiple team members at once
                     </p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
               >
                  <X className="h-6 w-6 stroke-[2.5px]" />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="space-y-6">
                  <div className="group">
                     <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Email Addresses</label>
                     <div className="relative">
                        <Mail className="absolute left-5 top-5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <textarea
                           value={emails}
                           onChange={(e) => setEmails(e.target.value)}
                           placeholder="Enter emails separated by commas, semicolons, or new lines...&#10;john@example.com, jane@example.com&#10;bob@example.com"
                           rows={6}
                           className="w-full min-h-[120px] rounded-2xl border border-slate-200/60 bg-white/50 pl-14 pr-6 py-4 dark:border-slate-800/60 dark:bg-slate-950/50 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 dark:text-white resize-none"
                        />
                     </div>
                     <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Separate multiple emails with commas, semicolons, or new lines
                     </p>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Assigned Workspace Role</label>
                     <div className="grid grid-cols-3 gap-4">
                        <button
                           type="button"
                           onClick={() => setRole('VIEWER')}
                           className={`group relative flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 p-6 transition-all duration-500 ${role === 'VIEWER'
                              ? 'bg-green-600 border-green-600 text-white shadow-2xl shadow-green-500/30 ring-4 ring-green-500/10'
                              : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900/50'
                              }`}
                        >
                           <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${role === 'VIEWER' ? 'bg-white/20' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                              <Shield className={`h-6 w-6 ${role === 'VIEWER' ? 'text-white' : 'text-slate-400'}`} />
                           </div>
                           <span className={`text-sm tracking-tight ${role === 'VIEWER' ? 'font-black' : 'font-bold'}`}>Viewer</span>
                        </button>
                        <button
                           type="button"
                           onClick={() => setRole('EDITOR')}
                           className={`group relative flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 p-6 transition-all duration-500 ${role === 'EDITOR'
                              ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/10'
                              : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900/50'
                              }`}
                        >
                           <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${role === 'EDITOR' ? 'bg-white/20' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                              <Shield className={`h-6 w-6 ${role === 'EDITOR' ? 'text-white' : 'text-slate-400'}`} />
                           </div>
                           <span className={`text-sm tracking-tight ${role === 'EDITOR' ? 'font-black' : 'font-bold'}`}>Editor</span>
                        </button>
                        <button
                           type="button"
                           onClick={() => setRole('ADMIN')}
                           className={`group relative flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 p-6 transition-all duration-500 ${role === 'ADMIN'
                              ? 'bg-purple-600 border-purple-600 text-white shadow-2xl shadow-purple-500/30 ring-4 ring-purple-500/10'
                              : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900/50'
                              }`}
                        >
                           <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${role === 'ADMIN' ? 'bg-white/20' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                              <Shield className={`h-6 w-6 ${role === 'ADMIN' ? 'text-white' : 'text-slate-400'}`} />
                           </div>
                           <span className={`text-sm tracking-tight ${role === 'ADMIN' ? 'font-black' : 'font-bold'}`}>Admin</span>
                        </button>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button
                     type="button"
                     onClick={onClose}
                     className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                  >
                     Dismiss
                  </button>
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex-1 h-16 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                  >
                     {isSubmitting ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                     <span>Send All Invites</span>
                  </button>
               </div>
            </form>
         </motion.div>
      </div>
   );
}
