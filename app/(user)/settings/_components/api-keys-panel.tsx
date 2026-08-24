'use client';

import { useState } from 'react';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, ShieldCheck, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '@/features/settings/hooks/use-settings';
import { toast } from 'sonner';

interface ApiKeysPanelProps {
  businessId: string | null;
}

export function ApiKeysPanel({ businessId }: ApiKeysPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: [] as string[],
  });
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // React Query hooks
  const { data: apiKeys = [], isLoading } = useApiKeys(businessId || '');
  const createApiKeyMutation = useCreateApiKey(businessId || '');
  const deleteApiKeyMutation = useDeleteApiKey(businessId || '');

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      await deleteApiKeyMutation.mutateAsync(keyId);
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newKeyData.name || newKeyData.permissions.length === 0) {
      toast.error('Please provide a name and at least one permission');
      return;
    }

    try {
      const result = await createApiKeyMutation.mutateAsync({
        name: newKeyData.name,
        permissions: newKeyData.permissions,
      });
      setNewlyCreatedKey(result.key);
      setNewKeyData({ name: '', permissions: [] });
      setShowCreateModal(false);
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const togglePermission = (permission: string) => {
    setNewKeyData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2.5 w-12 rounded-full bg-linear-to-r from-blue-600 to-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Developer Access</p>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
            API <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Vault</span>
          </h2>
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
            Orchestrate secure authentication protocols for external services and custom integrations while maintaining <span className="text-slate-900 dark:text-white underline decoration-blue-500/30 underline-offset-4">absolute credential isolation</span>.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="group relative flex h-16 items-center gap-3 rounded-[1.5rem] bg-linear-to-br from-blue-600 to-indigo-700 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.03] active:scale-95 whitespace-nowrap overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 stroke-[3px]" />
          Generate Access Token
        </button>
      </div>

      <div className="grid gap-8">
        <AnimatePresence mode="popLayout">
          {apiKeys.map((apiKey, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={apiKey.id}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-[3rem] border border-slate-200/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-1 overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none hover:border-blue-500/30 transition-all duration-500"
            >
              <div className="flex flex-col xl:flex-row xl:items-center gap-10 p-10">
                <div className="h-24 w-24 rounded-[2.25rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 group-hover:bg-linear-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:rotate-6 group-hover:shadow-2xl group-hover:shadow-blue-500/30 transition-all duration-700">
                  <Terminal className="h-12 w-12 text-slate-400 group-hover:text-white transition-all duration-700 transform group-hover:scale-110" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate tracking-tight">
                      {apiKey.name}
                    </h3>
                    <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${apiKey.isActive
                      ? 'bg-emerald-50/50 border-emerald-500/20 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800/40 dark:text-slate-500'
                      }`}>
                      <div className={`h-2 w-2 rounded-full ${apiKey.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{apiKey.isActive ? 'Securely Active' : 'Deactivated'}</span>
                    </div>
                  </div>

                  <div className="group/key relative max-w-2xl">
                    <div className="flex items-center gap-6 bg-slate-100/50 dark:bg-slate-950/40 px-8 py-5 rounded-[1.5rem] border border-slate-200/50 dark:border-slate-800/50 font-mono text-[11px] transition-all focus-within:ring-8 focus-within:ring-blue-500/5 focus-within:bg-white dark:focus-within:bg-slate-900 shadow-inner">
                      <span className="text-slate-400/60 font-black select-none tracking-tighter">SK_</span>
                      <span className="text-slate-900 dark:text-slate-200 truncate font-bold tracking-[0.3em]">
                        {visibleKeys[apiKey.id] ? apiKey.key : '•••• •••• •••• •••• ••••'}
                      </span>
                      <div className="flex items-center gap-3 ml-auto pl-6 border-l border-slate-200/50 dark:border-slate-800/50">
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-all hover:scale-110 active:scale-90"
                          title={visibleKeys[apiKey.id] ? "Obscure Key" : "Reveal Key"}
                        >
                          {visibleKeys[apiKey.id] ? <EyeOff className="h-4 w-4 stroke-[2.5px]" /> : <Eye className="h-4 w-4 stroke-[2.5px]" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-all hover:scale-110 active:scale-90"
                          title="Sync to Clipboard"
                        >
                          <Copy className="h-4 w-4 stroke-[2.5px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row xl:flex-col items-center xl:items-end gap-12 xl:gap-6 border-t xl:border-t-0 xl:border-l border-slate-200/50 dark:border-slate-800/50 pt-8 xl:pt-0 xl:pl-10">
                  <div className="text-left xl:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">Last Transmission</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 justify-end">
                      <Terminal className="h-3.5 w-3.5 opacity-40" />
                      <span suppressHydrationWarning>{apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                    className="h-14 w-14 flex items-center justify-center rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 transition-all duration-500 active:scale-90 border border-transparent hover:border-rose-500/30 group/delete shadow-inner hover:shadow-rose-500/10"
                  >
                    <Trash2 className="h-6 w-6 stroke-[2.5px] transition-transform group-hover/delete:scale-110 group-hover/delete:-rotate-6" />
                  </button>
                </div>
              </div>

              <div className="absolute -top-10 -right-10 p-1 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity duration-700">
                <div className="h-40 w-40 bg-linear-to-bl from-blue-500/20 to-transparent rounded-full blur-3xl" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {apiKeys.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-slate-50/40 dark:bg-slate-900/20 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800/60 transition-all"
          >
            <div className="h-32 w-32 rounded-[3rem] bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Key className="h-14 w-14 text-slate-200 dark:text-slate-700 relative z-10 group-hover:text-white transition-colors duration-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Credential <span className="text-blue-600">Archive Empty</span>
            </h3>
            <p className="mt-6 text-xl font-bold text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Initiate a new authentication sequence to begin programmatic interaction with the API.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-12 inline-flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-blue-700 dark:hover:text-blue-300 transition-all group"
            >
              Issue Primary Access Token
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 stroke-[3px]" />
            </button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 lg:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl rounded-[4rem] bg-white p-12 lg:p-16 dark:bg-slate-900 shadow-[0_64px_128px_-16px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
            >
              <div className="absolute -top-32 -right-32 h-80 w-80 bg-linear-to-br from-blue-600/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

              <div className="h-24 w-24 rounded-[2.25rem] bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center mb-12 shadow-2xl shadow-blue-500/40 rotate-6">
                <ShieldCheck className="h-12 w-12 text-white stroke-[2.5px]" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                Configure <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">Access Sequence</span>
              </h3>
              <p className="text-xl font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                Generated tokens possess full programmatic authorities. <span className="text-slate-900 dark:text-white underline decoration-rose-500/30 underline-offset-4">Maintain strict isolation</span> and never expose in public code.
              </p>

              <form onSubmit={handleCreateApiKey} className="mt-16 space-y-12">
                <div className="space-y-4">
                  <label htmlFor="key-name" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">
                    Logical Identifier
                  </label>
                  <input
                    type="text"
                    id="key-name"
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Production_Core_Engine"
                    className="h-16 w-full rounded-[1.5rem] border border-slate-200/60 bg-slate-50/50 dark:bg-slate-950/50 px-8 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-800/60">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">Privilege Matrix</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { id: 'read', label: 'Query Data', desc: 'Secure read-only telemetry fetched' },
                      { id: 'write', label: 'Mutate State', desc: 'Full write/delete capabilities granted' }
                    ].map(scope => (
                      <label key={scope.id} className="group relative flex flex-col p-8 rounded-[2.25rem] border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30 cursor-pointer hover:border-blue-500/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{scope.label}</span>
                          <input
                            type="checkbox"
                            checked={newKeyData.permissions.includes(scope.id)}
                            onChange={() => togglePermission(scope.id)}
                            className="h-7 w-7 rounded-xl border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer shadow-inner"
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{scope.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 h-16 rounded-[1.5rem] border border-slate-200/60 bg-transparent font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:hover:text-white transition-all"
                  >
                    Terminate
                  </button>
                  <button
                    type="submit"
                    disabled={createApiKeyMutation.isPending || !newKeyData.name || newKeyData.permissions.length === 0}
                    className="flex-[1.5] h-16 rounded-[1.5rem] bg-linear-to-br from-blue-600 to-indigo-700 px-12 font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-3xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all overflow-hidden relative group disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {createApiKeyMutation.isPending ? 'Issuing...' : 'Issue High-Level Token'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
