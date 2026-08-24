'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings2, Shield, AlertCircle, CheckCircle2, MoreVertical, ExternalLink, Loader2, RefreshCw, Edit3, Copy, Trash2 } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountModal } from '@/components/user/social/account-modal';
import Link from 'next/link';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { toast } from 'sonner';
import axios from 'axios';

export default function SocialAccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { businessId, isLoading: isBusinessLoading } = useCurrentBusiness();
  const searchParams = useSearchParams();

  // 1. Handle Mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();

  // 3. Fetch Social Accounts
  const { data: accounts, refetch, isLoading: isAccountsLoading } = useQuery<any[]>({
    queryKey: ['socialAccounts', businessId],
    queryFn: async (): Promise<any[]> => {
      const res = await axios.get('/api/social/accounts', {
        headers: { 'x-business-id': businessId }
      });
      return res.data as any[];
    },
    enabled: isMounted && !!businessId
  });

  console.log(accounts);


  // 4. Delete Account Mutation
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    setIsDeleting(id);
    try {
      await axios.delete(`/api/social/accounts?id=${id}`, {
        headers: { 'x-business-id': businessId }
      });
      toast.success("Account disconnected");
      refetch();
    } catch (error) {
      toast.error("Failed to disconnect account");
    } finally {
      setIsDeleting(null);
    }
  };

  // 4.5 Update/Edit Suffix State & Handlers
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<{ id: string, name: string } | null>(null);

  const handleRefreshAccount = async (id: string) => {
    setIsUpdating(id);
    try {
      await axios.post('/api/social/accounts/refresh', { id }, {
        headers: { 'x-business-id': businessId }
      });
      toast.success("Account synced with live data");
      refetch();
    } catch (error) {
      toast.error("Failed to refresh account");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      await axios.patch('/api/social/accounts/update', editingAccount, {
        headers: { 'x-business-id': businessId }
      });
      toast.success("Display name updated");
      setEditingAccount(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update name");
    }
  };

  // 6. Refetch on success URL param
  const success = searchParams.get('success');
  useEffect(() => {
    if (success) {
      refetch();
    }
  }, [success, refetch]);

  if (!isMounted) {
    return null;
  }

  // Simplified "Time Ago"
  const getTimeAgo = (date: string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Recently";
    const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  // 7. Handle Copy to Clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 pt-10">
      {/* Modern Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 bg-blue-600 w-12 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Integrated Connectivity</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">
            Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Accounts</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-2xl leading-relaxed">
            Connect and manage your brand's presence across all major platforms. Securely automate with unified credentials.
          </p>
        </motion.div>


      </div>

      {/* Modern Notification & Action Area */}
      <div className="space-y-6 max-w-4xl pt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-500/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-4 p-4 rounded-[24px] bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-blue-500/5">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <AlertCircle className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-slate-900 dark:text-white font-bold tracking-tight">
                X/Twitter Integration Required
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                To link your X/Twitter account, please complete the initial service configuration.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ x: 5 }}
          className="flex"
        >
          <Button
            asChild
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] h-12 px-8 rounded-2xl shadow-xl shadow-blue-600/20 border-none transition-all"
          >
            <Link href="/settings" className="flex items-center gap-3">
              <Settings2 className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
              Configure Services
            </Link>
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
        {isAccountsLoading ? (
          <>
            {/* Add Account Card Skeleton */}
            <Card className="h-[280px] w-full rounded-[40px] bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-100 dark:border-white/10 flex flex-col items-center justify-center gap-5 shadow-none pb-0">
              <CardContent className="flex flex-col items-center justify-center gap-5 p-0">
                <Skeleton className="h-16 w-16 rounded-[24px]" />
                <div className="space-y-2 flex flex-col items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
            {/* Account Card Skeletons */}
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="h-[280px] w-full rounded-[40px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 p-8 flex flex-col items-center justify-center gap-6 shadow-sm pb-0">
                <CardContent className="flex flex-col items-center justify-center gap-6 p-0">
                  <Skeleton className="h-20 w-20 rounded-[28px]" />
                  <div className="space-y-3 flex flex-col items-center">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {/* Modern Action Card: Add Account */}
            <motion.div
              whileHover={businessId ? { y: -5, scale: 1.02 } : {}}
              whileTap={businessId ? { scale: 0.98 } : {}}
                className="h-full w-full"
              >
                <Card
                  role="button"
                  tabIndex={businessId ? 0 : -1}
                  onKeyDown={(e) => {
                    if (businessId && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setIsModalOpen(true);
                    }
                  }}
                  onClick={() => businessId && setIsModalOpen(true)}
                  className={`group relative h-[280px] w-full rounded-[40px] bg-white dark:bg-slate-900/50 border-2 border-dashed flex flex-col items-center justify-center gap-5 transition-all overflow-hidden shadow-none pb-0 ${businessId
                    ? 'cursor-pointer border-slate-200 dark:border-white/10 hover:border-blue-500/40 hover:bg-blue-50/10'
                    : 'cursor-not-allowed border-slate-100 dark:border-white/5 opacity-50'
                    }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="flex flex-col items-center justify-center gap-5 p-0 relative z-10">
                    <div className={`h-16 w-16 rounded-[24px] flex items-center justify-center transition-all ${businessId
                      ? 'bg-slate-50 dark:bg-white/5 group-hover:bg-blue-600 group-hover:rotate-6 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]'
                      : 'bg-slate-50 dark:bg-white/5'
                      }`}>
                      {!businessId ? (
                        <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                      ) : (
                        <Plus className="h-8 w-8 text-slate-400 group-hover:text-white transition-all" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        {!businessId ? "Connecting..." : "Add Account"}
                      </p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2 opacity-60">
                        {businessId ? "Expand Presence" : "Please Wait"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
            </motion.div>

            {accounts?.map((account: any, index: number) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="group relative h-[280px] w-full rounded-[40px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 flex flex-col items-center justify-center transition-all hover:shadow-2xl hover:shadow-black/5 shadow-sm p-0 pb-0 overflow-visible">
                  <CardContent className="flex flex-col items-center justify-center p-8 w-full h-full relative">
                    {/* Meatball Menu with Expanded Logic */}
                    <div className="absolute top-6 right-6">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-colors">
                        <MoreVertical className="h-5 w-5 text-slate-400" />
                      </button>

                      <div className="hidden group-focus-within:block absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                        <button
                          onClick={() => account.profileUrl && window.open(account.profileUrl, '_blank')}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium">View profile</span>
                        </button>

                        <button
                          onClick={() => handleRefreshAccount(account.id)}
                          disabled={isUpdating === account.id}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`h-4 w-4 text-slate-500 ${isUpdating === account.id ? 'animate-spin' : ''}`} />
                          <span className="text-sm font-medium">
                            {isUpdating === account.id ? 'Updating...' : 'Update'}
                          </span>
                        </button>

                        <button
                          onClick={() => setEditingAccount({ id: account.id, name: account.name })}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <Edit3 className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium">Edit suffix</span>
                        </button>

                        <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-white/5 mt-1">
                          Usage in API
                        </div>

                        <button
                          onClick={() => handleCopy(account.id, 'Account ID')}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <Copy className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium">Copy ID</span>
                        </button>

                        <button
                          onClick={() => handleCopy(account.id, 'Account UUID')}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <Copy className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium">Copy UUID</span>
                        </button>

                        <button
                          onClick={() => handleDelete(account.id)}
                          disabled={isDeleting === account.id}
                          className="cursor-pointer w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 flex items-center gap-3 border-t border-slate-50 dark:border-white/5 transition-colors mt-1 disabled:opacity-50"
                        >
                          {isDeleting === account.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {isDeleting === account.id ? 'Deleting...' : 'Delete'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="relative mb-6">
                      <div className="h-20 w-20 rounded-[28px] overflow-hidden p-[2px] bg-gradient-to-tr from-blue-600 to-indigo-500 group-hover:rotate-3 transition-transform duration-500">
                        <img
                          src={account.avatar ? `/api/social/proxy-image?url=${encodeURIComponent(account.avatar)}` : `https://api.dicebear.com/7.x/initials/svg?seed=${account.name}`}
                          alt={account.name}
                          className="h-full w-full rounded-[26px] object-cover bg-white dark:bg-slate-950"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${account.name}`;
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 shadow-lg">
                        {account.platform === 'FACEBOOK' && <FaFacebook className="h-4 w-4 text-[#1877F2]" />}
                        {account.platform === 'INSTAGRAM' && <FaInstagram className="h-4 w-4 text-pink-600" />}
                        {account.platform === 'LINKEDIN' && <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />}
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">{account.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                        Added {getTimeAgo(account.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </div>

      <AccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} businessId={businessId} />

      {/* Edit Suffix Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-white/10 relative z-[200]"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Display Name</h3>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Account Name</label>
                <input
                  type="text"
                  value={editingAccount.name}
                  onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. My Page (Main)"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={() => setEditingAccount(null)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
