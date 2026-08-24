'use client';

import { useState } from 'react';
import { X, Loader, Send, Mail, Shield, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { inviteTeamMember, updateInvitation } from '../actions/mutations';
import { toast } from 'sonner';
import { UserRole } from '@/types';

interface InviteMemberModalProps {
   onClose: () => void;
   businessId: string;
   initialData?: any;
}

export function InviteMemberModal({ onClose, businessId, initialData }: InviteMemberModalProps) {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [email, setEmail] = useState(initialData?.email || '');
   const [role, setRole] = useState<UserRole>(initialData?.role || 'EDITOR');

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return toast.error('Email is required');
      if (!email.includes('@')) return toast.error('Invalid email address');

      setIsSubmitting(true);
      try {
         if (initialData?.id) {
            await updateInvitation(initialData.id, { email, role });
            toast.success(`Invitation updated for ${email}`);
         } else {
            await inviteTeamMember({
               email,
               role,
               businessId,
            });
            toast.success(`Invitation sent to ${email}`);
         }
         onClose();
      } catch (error: any) {
         toast.error(error.message || 'Failed to process invitation');
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xl">
         <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-[3rem] bg-white/80 p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:bg-slate-900/80 border border-white dark:border-slate-800 backdrop-blur-2xl"
         >
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/40 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent" />
                     <UserPlus className="h-8 w-8 relative z-10" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {initialData ? 'Edit Access' : 'New Member'}
                     </h2>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {initialData ? 'Update role or email details' : 'Invite a collaborator to your team'}
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
                     <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Email Identity</label>
                     <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="partner@company.com"
                           className="w-full h-16 rounded-2xl border border-slate-200/60 bg-white/50 pl-14 pr-6 py-2.5 dark:border-slate-800/60 dark:bg-slate-950/50 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 dark:text-white"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Assigned Workspace Role</label>
                     <div className="grid grid-cols-2 gap-4">
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
                     <span>{initialData ? 'Update' : 'Invite'}</span>
                  </button>
               </div>
            </form>
         </motion.div>
      </div>
   );
}
