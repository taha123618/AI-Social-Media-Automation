'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Crown, Shield, Edit, Eye, MoreVertical, User, Mail, Search, X } from 'lucide-react';
import { TeamMember } from '../types';
import { formatDateShort } from '@/lib/date-utils';
import { removeTeamMember, updateMemberRole } from '../actions/mutations';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, Trash2, ShieldCheck, UserMinus } from 'lucide-react';

interface TeamMembersListProps {
  members: TeamMember[];
  userRole: string;
}

export function TeamMembersList({ members, userRole }: TeamMembersListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const search = searchParams.get('search') || '';
    if (search !== searchTerm) setSearchTerm(search);
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      const query = createQueryString('search', debouncedSearch);
      router.push(`?${query}`, { scroll: false });
    }
  }, [debouncedSearch, createQueryString, router, searchParams]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showConfirmRemove, setShowConfirmRemove] = useState<string | null>(null);

  const handleRemoveMember = async (id: string) => {
    setIsUpdating(id);
    try {
      await removeTeamMember(id);
      toast.success('Team member removed successfully');
    } catch (error) {
      toast.error('Failed to remove team member');
    } finally {
      setIsUpdating(null);
      setShowConfirmRemove(null);
    }
  };

  const handleUpdateRole = async (id: string, role: any) => {
    setIsUpdating(id);
    try {
      await updateMemberRole(id, role);
      toast.success('Member role updated');
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleIcon = (role: string) => {
    const iconProps = { className: 'h-4 w-4' };
    switch (role) {
      case 'OWNER':
        return <Crown {...iconProps} />;
      case 'ADMIN':
        return <Shield {...iconProps} />;
      case 'EDITOR':
        return <Edit {...iconProps} />;
      case 'VIEWER':
        return <Eye {...iconProps} />;
      default:
        return <User {...iconProps} />;
    }
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      OWNER: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ADMIN: 'bg-red-100 text-red-800 border-red-200',
      EDITOR: 'bg-blue-100 text-blue-800 border-blue-200',
      VIEWER: 'bg-green-100 text-green-800 border-green-200',
    };
    return roleColors[role] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Active Members</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="h-px flex-1 mx-8 bg-slate-200/50 dark:bg-slate-800/50 hidden md:block" />

        {/* Search */}
        <div className="relative group w-full max-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-sm pl-10 pr-8 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white"
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-3 w-3 stroke-[3px]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid gap-4">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07 }}
            className="group relative rounded-[2rem] border border-slate-200/60 bg-white/40 p-5 backdrop-blur-xl transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/40"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                  {member.user.image ? (
                    <img
                      src={member.user.image}
                      alt={member.user.name || 'User'}
                      className="h-14 w-14 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                      <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <span className="text-lg font-black text-white">
                          {(member.user.name || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                  )}
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-white dark:border-slate-900 shadow" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {member.user.name || 'Unknown User'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{member.user.email}</span>
                  </div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Since {formatDateShort(member.joinedAt)}
                  </div>
                </div>
              </div>

              {/* Role + Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={member.role}
                  onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                  disabled={isUpdating === member.id || !['OWNER', 'ADMIN'].includes(userRole) || (member.role === 'OWNER' && userRole !== 'OWNER')}
                  className={`appearance-none px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border focus:outline-none transition-all disabled:opacity-50 cursor-pointer ${getRoleColor(member.role)}`}
                >
                  <option value="VIEWER">VIEWER</option>
                  <option value="EDITOR">EDITOR</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="OWNER">OWNER</option>
                </select>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {['OWNER', 'ADMIN'].includes(userRole) && !(member.role === 'OWNER' && userRole !== 'OWNER') && (
                    <button
                      onClick={() => setShowConfirmRemove(member.id)}
                      disabled={isUpdating === member.id}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-400 hover:text-rose-500 hover:border-rose-500/50 transition-all active:scale-90 disabled:opacity-50"
                      title="Remove member"
                    >
                      {isUpdating === member.id
                        ? <Loader className="h-4 w-4 animate-spin" />
                        : <UserMinus className="h-4 w-4" />
                      }
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {members.length === 0 && (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No Members Yet</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
              Invite team members to get started. They'll appear here once they accept.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirmRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                  <UserMinus className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Remove Member?</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  This will revoke their access to this business workspace.
                </p>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowConfirmRemove(null)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveMember(showConfirmRemove)}
                  disabled={!!isUpdating}
                  className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
