'use client';

import { useState } from 'react';
import { Webhook, Plus, Trash2, Check, X, Globe, Shield, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebhooks, useCreateWebhook, useUpdateWebhook, useDeleteWebhook } from '@/features/settings/hooks/use-settings';
import { toast } from 'sonner';

interface WebhooksPanelProps {
  businessId: string | null;
}

export function WebhooksPanel({ businessId }: WebhooksPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
  });

  // React Query hooks
  const { data: webhooks = [], isLoading } = useWebhooks(businessId || '');
  const createWebhookMutation = useCreateWebhook(businessId || '');
  const updateWebhookMutation = useUpdateWebhook(businessId || '');
  const deleteWebhookMutation = useDeleteWebhook(businessId || '');

  const availableEvents = [
    'content.created',
    'content.updated',
    'content.published',
    'content.scheduled',
    'content.deleted',
    'user.created',
    'user.updated',
  ];

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await deleteWebhookMutation.mutateAsync(webhookId);
      toast.success('Webhook deleted successfully');
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Failed to delete webhook');
    }
  };

  const handleToggleWebhookStatus = async (webhookId: string, currentStatus: boolean) => {
    try {
      await updateWebhookMutation.mutateAsync({
        webhookId,
        data: { isActive: !currentStatus },
      });
      toast.success(`Webhook ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast.error('Failed to update webhook status');
    }
  };

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createWebhookMutation.mutateAsync({
        name: formData.name,
        url: formData.url,
        events: formData.events,
        secret: formData.secret || undefined,
      });
      setShowCreateModal(false);
      setFormData({ name: '', url: '', events: [], secret: '' });
      toast.success('Webhook created successfully');
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error('Failed to create webhook');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2.5 w-12 rounded-full bg-linear-to-r from-blue-600 to-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Event Propagation</p>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
            System <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Webhooks</span>
          </h2>
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
            Configure real-time telemetry streams via secure HTTP POST requests to synchronize your automation pipelines with <span className="text-slate-900 dark:text-white underline decoration-blue-500/30 underline-offset-4">third-party ecosystems</span>.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreateModal(true)}
          className="group relative flex h-16 items-center gap-3 rounded-[1.5rem] bg-linear-to-br from-blue-600 to-indigo-700 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all whitespace-nowrap overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 stroke-[3px]" />
          Establish New Hook
        </motion.button>
      </div>

      <div className="grid gap-8">
        <AnimatePresence mode="popLayout">
          {webhooks.map((webhook, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              key={webhook.id}
              className="group relative rounded-[3rem] border border-slate-200/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-1 overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none hover:border-blue-500/30 transition-all duration-500"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 p-10">
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[1.75rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 group-hover:bg-linear-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:rotate-6 group-hover:shadow-2xl group-hover:shadow-blue-500/30 transition-all duration-700">
                      <Globe className="h-10 w-10 text-slate-400 group-hover:text-white transition-all duration-700 transform group-hover:scale-110" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {webhook.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${webhook.isActive
                          ? 'bg-emerald-50/50 border-emerald-500/20 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800/40 dark:text-slate-500'
                          }`}>
                          <div className={`h-2 w-2 rounded-full ${webhook.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{webhook.isActive ? 'Actively Listening' : 'Connection Standby'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-100/50 dark:bg-slate-950/40 p-6 border border-slate-200/50 dark:border-slate-800/50 font-mono text-[11px] font-bold text-slate-600 dark:text-blue-400/90 break-all leading-relaxed shadow-inner">
                    <span className="opacity-40 mr-2 select-none">ENDPOINT_URL:</span>
                    {webhook.url}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="rounded-xl bg-white/80 dark:bg-slate-800/60 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50 shadow-sm transition-all hover:scale-105 hover:bg-white dark:hover:bg-slate-700"
                      >
                        {event}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-10 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      <Clock className="h-4 w-4 stroke-[2.5px] opacity-40" />
                      Established: <span suppressHydrationWarning>{new Date(webhook.createdAt).toLocaleDateString()}</span>
                    </div>
                    {webhook.lastTriggered && (
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 border-l border-emerald-500/20 pl-10">
                        <Activity className="h-4 w-4 stroke-[2.5px] animate-pulse" />
                        Reactive Ping: <span suppressHydrationWarning>{new Date(webhook.lastTriggered).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex lg:flex-col gap-4 pt-6 lg:pt-0">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleWebhookStatus(webhook.id, webhook.isActive)}
                    className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] border transition-all duration-500 ${webhook.isActive
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/10'
                      : 'border-slate-200 text-slate-400 hover:bg-slate-50 dark:border-slate-800 shadow-inner'
                      }`}
                    title={webhook.isActive ? "Deactivate Stream" : "Activate Stream"}
                  >
                    {webhook.isActive ? <Check className="h-7 w-7 stroke-[3px]" /> : <X className="h-7 w-7 stroke-[3px]" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-rose-500/20 bg-rose-500/5 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-all duration-500 shadow-inner hover:shadow-rose-500/10 group/trash"
                    title="Terminate Hook"
                  >
                    <Trash2 className="h-7 w-7 stroke-[2.5px] transition-transform group-hover/trash:scale-110" />
                  </motion.button>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 p-1 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity duration-700">
                <div className="h-40 w-40 bg-linear-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {webhooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 bg-slate-50/40 dark:bg-slate-900/20 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800/60 transition-all"
          >
            <div className="h-32 w-32 rounded-[3rem] bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Webhook className="h-14 w-14 text-slate-200 dark:text-slate-700 relative z-10 group-hover:text-white transition-colors duration-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Webhook <span className="text-blue-600">Protocol Offline</span>
            </h3>
            <p className="mt-6 text-xl font-bold text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed text-center">
              No active event listeners detect. Initiate a secure webhook sequence to bridge your telemetry with external systems.
            </p>
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
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-3xl rounded-[4rem] bg-white p-12 lg:p-16 dark:bg-slate-900 shadow-[0_64px_128px_-16px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
            >
              <div className="absolute -top-32 -left-32 h-80 w-80 bg-linear-to-br from-blue-600/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

              <div className="mb-12 flex items-center gap-8">
                <div className="flex h-24 w-24 items-center justify-center rounded-[2.25rem] bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/40 rotate-6">
                  <Plus className="h-12 w-12 stroke-[3px]" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    Initialize <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">Telemetry Hook</span>
                  </h3>
                  <p className="text-xl font-bold text-slate-500 dark:text-slate-400 mt-2">
                    Define the target parameters for secure event propagation.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-8">
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">
                        Identifier Label
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Prod_Event_Bridge"
                        className="h-16 w-full rounded-[1.5rem] border border-slate-200/60 bg-slate-50/50 dark:bg-slate-950/50 px-8 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">
                        Transmission Secret
                      </label>
                      <div className="relative group/secret">
                        <input
                          type="text"
                          value={formData.secret}
                          onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                          placeholder="whsec_20..."
                          className="h-16 w-full rounded-[1.5rem] border border-slate-200/60 bg-slate-50/50 dark:bg-slate-950/50 pl-14 pr-8 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                        />
                        <Shield className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within/secret:text-blue-500 transition-colors stroke-[2.5px]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">
                      Primary Destination URL (HTTP POST)
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://core-api.your-system.io/v1/ingest"
                      className="h-16 w-full rounded-[1.5rem] border border-slate-200/60 bg-slate-50/50 dark:bg-slate-950/50 px-8 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800/60">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">
                      Strategic Event Subscriptions
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {availableEvents.map((event) => (
                        <label
                          key={event}
                          className={`group relative flex cursor-pointer items-center justify-between rounded-[1.5rem] border p-5 transition-all duration-500 ${formData.events.includes(event)
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 shadow-lg shadow-blue-500/5'
                            : 'border-slate-100 bg-slate-50/30 hover:border-blue-500/30 dark:border-slate-800 dark:bg-slate-950/30'
                            }`}
                        >
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${formData.events.includes(event) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            {event.split('.').join(' ')}
                          </span>
                          <input
                            type="checkbox"
                            checked={formData.events.includes(event)}
                            onChange={() => handleEventToggle(event)}
                            className="h-6 w-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer shadow-inner"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 pt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="h-16 flex-1 rounded-[1.5rem] border border-slate-200/60 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:hover:text-white transition-all shadow-sm"
                  >
                    Discard Sequence
                  </button>
                  <button
                    type="submit"
                    className="h-16 flex-[1.5] rounded-[1.5rem] bg-linear-to-br from-blue-600 to-indigo-700 font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-95 overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Lock Protocol & Deploy
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
