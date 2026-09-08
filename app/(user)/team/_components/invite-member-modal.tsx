'use client';

import { useState } from 'react';
import { X, Loader2, Send, Mail, Shield, UserPlus, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { inviteTeamMember, updateInvitation } from '../actions/mutations';
import { toast } from 'sonner';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      if (!email.trim()) return toast.error('Email is required');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md">
         <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md flex flex-col rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden"
         >
            {/* Ambient Top Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-28 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-border/60 flex items-center justify-between shrink-0 relative z-10">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
                     <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                     <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                        {initialData ? 'Update Member Access' : 'Invite Workspace Member'}
                     </h2>
                     <p className="text-xs text-muted-foreground mt-0.5">
                        {initialData ? 'Adjust workspace permissions' : 'Collaborate on AI campaigns and content pipelines'}
                     </p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
               >
                  <X className="h-4 w-4" />
               </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 relative z-10">
               <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Email Identity</label>
                  <div className="relative">
                     <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="pl-10 h-10 text-xs rounded-xl bg-secondary/30 border-border/70 text-foreground focus-visible:ring-primary/30"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Access Role Tier</label>
                  <div className="grid grid-cols-2 gap-3">
                     <button
                        type="button"
                        onClick={() => setRole('EDITOR')}
                        className={cn(
                           'flex flex-col items-start gap-2 p-3.5 rounded-xl border text-left transition-all relative overflow-hidden',
                           role === 'EDITOR'
                              ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30 shadow-xs'
                              : 'border-border/70 bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        )}
                     >
                        <div className="flex items-center justify-between w-full">
                           <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                              <Shield className="h-3.5 w-3.5" />
                           </div>
                           {role === 'EDITOR' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                           <div className="text-xs font-bold text-foreground">Editor</div>
                           <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                              Draft, generate, and edit social campaigns.
                           </div>
                        </div>
                     </button>

                     <button
                        type="button"
                        onClick={() => setRole('ADMIN')}
                        className={cn(
                           'flex flex-col items-start gap-2 p-3.5 rounded-xl border text-left transition-all relative overflow-hidden',
                           role === 'ADMIN'
                              ? 'border-accent bg-accent/10 text-foreground ring-1 ring-accent/30 shadow-xs'
                              : 'border-border/70 bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        )}
                     >
                        <div className="flex items-center justify-between w-full">
                           <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent-foreground flex items-center justify-center">
                              <Shield className="h-3.5 w-3.5 text-accent" />
                           </div>
                           {role === 'ADMIN' && <CheckCircle2 className="h-4 w-4 text-accent" />}
                        </div>
                        <div>
                           <div className="text-xs font-bold text-foreground">Admin</div>
                           <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                              Full access, billing, and member governance.
                           </div>
                        </div>
                     </button>
                  </div>
               </div>

               <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
                  <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={onClose}
                     className="h-9 px-4 text-xs rounded-xl text-muted-foreground hover:text-foreground"
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     size="sm"
                     disabled={isSubmitting}
                     className="h-9 px-5 text-xs font-semibold rounded-xl gap-1.5 shadow-sm active:scale-95"
                  >
                     {isSubmitting ? (
                        <>
                           <Loader2 className="h-3.5 w-3.5 animate-spin" />
                           <span>Inviting...</span>
                        </>
                     ) : (
                        <>
                           <Send className="h-3.5 w-3.5" />
                           <span>{initialData ? 'Update Access' : 'Send Invitation'}</span>
                        </>
                     )}
                  </Button>
               </div>
            </form>
         </motion.div>
      </div>
   );
}
