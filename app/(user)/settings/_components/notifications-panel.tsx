'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, Save, ShieldCheck, Check, User, AlertTriangle, Cpu, Network, Zap, Eye, Lock, Users, Heart } from 'lucide-react';
import { UserSettings } from '../types';
import { motion } from 'framer-motion';
import { useUserSettings, useUpdateUserSettings } from '@/features/settings/hooks/use-settings';
import { toast } from 'sonner';

interface NotificationsPanelProps {
  userSettings: UserSettings | null;
}

export function NotificationsPanel({ userSettings: initialUserSettings }: NotificationsPanelProps) {
  // Use React Query to fetch user settings (this will update after mutations)
  const { data: userSettings } = useUserSettings();

  // Use the fetched data or fall back to initial props
  const settings = userSettings || initialUserSettings;

  // Use settings ID as key to force re-render when data changes
  const settingsKey = settings?.id || 'initial';

  return <NotificationsPanelForm key={settingsKey} settings={settings} />;
}

function NotificationsPanelForm({ settings }: { settings: UserSettings | null }) {
  const [formData, setFormData] = useState({
    // Email Dispatch Protocol
    criticalInfrastructureUpdates: settings?.criticalInfrastructureUpdates ?? true,
    strategicIntelligence: settings?.strategicIntelligence ?? false,
    // Real-Time Push Array
    osLevelSignals: settings?.osLevelSignals ?? true,
    // Active Signal Feed
    contentPhaseSuccess: settings?.contentPhaseSuccess ?? true,
    securityFirewallAlerts: settings?.securityFirewallAlerts ?? true,
    collaboratorInvitations: settings?.collaboratorInvitations ?? true,
    globalSystemHealth: settings?.globalSystemHealth ?? false,
  });

  // Use React Query mutation for updating user settings
  const updateSettingsMutation = useUpdateUserSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettingsMutation.mutateAsync({
        // Email Dispatch Protocol
        criticalInfrastructureUpdates: formData.criticalInfrastructureUpdates,
        strategicIntelligence: formData.strategicIntelligence,
        // Real-Time Push Array
        osLevelSignals: formData.osLevelSignals,
        // Active Signal Feed
        contentPhaseSuccess: formData.contentPhaseSuccess,
        securityFirewallAlerts: formData.securityFirewallAlerts,
        collaboratorInvitations: formData.collaboratorInvitations,
        globalSystemHealth: formData.globalSystemHealth,
      });
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-2.5 w-12 rounded-full bg-linear-to-r from-blue-600 to-indigo-600" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Communication Hub</p>
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
          Notification <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Center</span>
        </h2>
        <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
          Orchestrate your transmission preferences across secure digital channels, ensuring you remain <span className="text-slate-900 dark:text-white underline decoration-blue-500/30 underline-offset-4">algorithmically synchronized</span> with every system event.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">
        <div className="grid gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[3rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 lg:p-12 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none transition-all hover:border-blue-500/20"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white mb-10 flex items-center gap-4 px-2">
              <div className="p-2.5 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl shadow-xl shadow-blue-500/20">
                <Mail className="h-5 w-5 text-white" />
              </div>
              Email Dispatch Protocol
            </h3>

            <div className="grid gap-8">
              <label className="group flex items-center justify-between p-8 rounded-[2rem] bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 cursor-pointer transition-all duration-500 hover:border-blue-500/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-blue-500/5">
                <div className="max-w-md">
                  <span className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.1em] group-hover:text-blue-600 transition-colors">Critical Infrastructure Updates</span>
                  <p className="text-xs font-bold text-slate-500 mt-2 dark:text-slate-400 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                    Receive high-priority telemetry reports regarding published nodes, execution cycles, and tactical errors.
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.criticalInfrastructureUpdates}
                    onChange={(e) => setFormData({ ...formData, criticalInfrastructureUpdates: e.target.checked })}
                    className="h-8 w-14 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 dark:checked:bg-green-700 checked:bg-green-500 transition-all cursor-pointer relative after:absolute after:top-1 after:left-1 after:h-6 after:w-6 after:bg-white after:rounded-full after:transition-all checked:after:left-7 shadow-inner"
                  />
                </div>
              </label>

              <label className="group flex items-center justify-between p-8 rounded-[2rem] bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 cursor-pointer transition-all duration-500 hover:border-blue-500/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-blue-500/5">
                <div className="max-w-md">
                  <span className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest group-hover:text-blue-600 transition-colors">Strategic Intelligence</span>
                  <p className="text-xs font-bold text-slate-500 mt-2 dark:text-slate-400 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                    Periodic synchronization regarding platform evolutions, industry-shifting heuristics, and new feature deployments.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.strategicIntelligence}
                  onChange={(e) => setFormData({ ...formData, strategicIntelligence: e.target.checked })}
                  className="h-8 w-14 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 dark:checked:bg-green-700 checked:bg-green-500 transition-all cursor-pointer relative after:absolute after:top-1 after:left-1 after:h-6 after:w-6 after:bg-white after:rounded-full after:transition-all checked:after:left-7 shadow-inner"
                />
              </label>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[3rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 lg:p-12 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none transition-all hover:border-indigo-500/20"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white mb-10 flex items-center gap-4 px-2">
              <div className="p-2.5 bg-linear-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-xl shadow-indigo-500/20">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              Real-Time Push Array
            </h3>

            <div className="grid gap-8">
              <label className="group flex items-center justify-between p-8 rounded-[2rem] bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 cursor-pointer transition-all duration-500 hover:border-indigo-500/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-indigo-500/5">
                <div className="max-w-md">
                  <span className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.1em] group-hover:text-indigo-600 transition-colors">OS-Level Signals</span>
                  <p className="text-xs font-bold text-slate-500 mt-2 dark:text-slate-400 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                    Instantaneous desktop and mobile alerts, bypassing application boundaries for mission-critical awareness.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.osLevelSignals}
                  onChange={(e) => setFormData({ ...formData, osLevelSignals: e.target.checked })}
                  className="h-8 w-14 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 dark:checked:bg-green-700 checked:bg-green-500 transition-all cursor-pointer relative after:absolute after:top-1 after:left-1 after:h-6 after:w-6 after:bg-white after:rounded-full after:transition-all checked:after:left-7 shadow-inner"
                />
              </label>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[3rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 lg:p-12 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none"
          >
            <div className="flex items-center gap-6 mb-12 px-2">
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-700 animate-pulse">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Active Signal Feed</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">System-wide monitoring channels</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Content Phase Success',
                  icon: Check,
                  color: 'text-emerald-500',
                  field: 'contentPhaseSuccess'
                },
                {
                  label: 'Security Firewall Alerts',
                  icon: ShieldCheck,
                  color: 'text-rose-500',
                  field: 'securityFirewallAlerts'
                },
                {
                  label: 'Collaborator Invitations',
                  icon: User,
                  color: 'text-blue-500',
                  field: 'collaboratorInvitations'
                },
                {
                  label: 'Global System Health',
                  icon: Heart,
                  color: 'text-amber-500',
                  field: 'globalSystemHealth'
                }
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex flex-col gap-5 p-8 rounded-[2.25rem] bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl hover:border-blue-500/30 group cursor-pointer"
                >
                  <div className={`p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl w-fit transition-transform group-hover:rotate-12 ${item.color}`}>
                    <item.icon className="h-6 w-6 stroke-[2.5px]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest leading-relaxed">
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={formData[item.field as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData({
                        ...formData,
                        [item.field]: e.target.checked
                      })}
                      className="h-6 w-10 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 dark:checked:bg-green-700 checked:bg-green-500 transition-all cursor-pointer relative after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all checked:after:left-5 shadow-inner"
                    />
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Additional Notification Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[3rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 lg:p-12 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none transition-all hover:border-purple-500/20"
        >
          <div className="flex items-center gap-6 mb-12 px-2">
            <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-700">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Advanced Monitoring</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">Specialized notification channels</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'System Performance Alerts', icon: Cpu, color: 'text-cyan-500' },
              { label: 'Network Connectivity', icon: Network, color: 'text-green-500' },
              { label: 'Security Breach Detection', icon: Eye, color: 'text-red-500' },
              { label: 'Access Control Events', icon: Lock, color: 'text-yellow-500' },
              { label: 'User Activity Reports', icon: Users, color: 'text-indigo-500' },
              { label: 'System Maintenance', icon: AlertTriangle, color: 'text-orange-500' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-5 p-8 rounded-[2.25rem] bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:border-purple-500/30 group opacity-50"
              >
                <div className={`p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl w-fit transition-transform group-hover:rotate-6 ${item.color}`}>
                  <item.icon className="h-6 w-6 stroke-[2.5px]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                    {item.label}
                  </span>
                  <div className="h-6 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center px-1">
                    <div className="h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Coming Soon</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex pt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="group relative flex h-16 items-center justify-center gap-4 rounded-[1.5rem] bg-linear-to-br from-blue-600 to-indigo-700 px-12 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all overflow-hidden disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {updateSettingsMutation.isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Save className="h-5 w-5 stroke-[2.5px]" />
              </motion.div>
            ) : (
                <Save className="h-5 w-5 transition-transform group-hover:scale-110 stroke-[2.5px]" />
            )}
            {updateSettingsMutation.isPending ? 'Synchronizing Archive...' : 'Commit Communication Parameters'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
