'use client';

import { useState } from 'react';
import { User, Mail, Camera, Save, Globe, Languages } from 'lucide-react';
import { UserSettings } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { useUserSettings, useUpdateUserSettings } from '@/features/settings/hooks/use-settings';
import { toast } from 'sonner';

interface ProfileSettingsProps {
  userSettings: UserSettings | null;
}

export function ProfileSettings({ userSettings: initialUserSettings }: ProfileSettingsProps) {
  const hasHydrated = useHasHydrated();
  
  // Use React Query to fetch user settings (this will update after mutations)
  const { data: userSettings } = useUserSettings();
  
  // Use the fetched data or fall back to initial props
  const settings = userSettings || initialUserSettings;
  
  // Use settings ID as key to force re-render when data changes
  const settingsKey = settings?.id || 'initial';
  
  return <ProfileSettingsForm key={settingsKey} settings={settings} />;
}

function ProfileSettingsForm({ settings }: { settings: UserSettings | null }) {
  const [formData, setFormData] = useState({
    name: settings?.name || '',
    email: settings?.email || '',
    timezone: settings?.timezone || 'UTC',
    language: settings?.language || 'en',
  });
  
  // Use React Query mutation for updating user settings
  const updateSettingsMutation = useUpdateUserSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettingsMutation.mutateAsync({
        name: formData.name,
        timezone: formData.timezone,
        language: formData.language,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const hasHydrated = useHasHydrated();
  if (!hasHydrated) return null;

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2.5 w-12 rounded-full bg-linear-to-r from-blue-600 to-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Personal Identity</p>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
            Profile <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Settings</span>
          </h2>
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
            Update your personal coordinates, visual avatar, and regional preferences to ensure your workspace remains <span className="text-slate-900 dark:text-white underline decoration-blue-500/30 underline-offset-4">perfectly aligned</span>.
          </p>
        </div>

        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="flex items-center gap-10 p-12 rounded-[3rem] bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] dark:shadow-none backdrop-blur-2xl group"
        >
          <div className="relative">
            <div className="h-32 w-32 rounded-[2.5rem] bg-linear-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/40 transition-all duration-700 group-hover:rotate-6">
              <User className="h-16 w-16 text-white transition-transform duration-700 group-hover:scale-110" />
            </div>
            <button className="absolute -bottom-4 -right-4 h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-2xl hover:scale-110 hover:rotate-12 active:scale-90 transition-all z-10">
              <Camera className="h-6 w-6 stroke-[2.5px]" />
            </button>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Identity Avatar
            </h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] leading-relaxed">
              JPG, PNG OR WEBP<br />OPTIMAL RATIO 1:1 (MAX 2MB)
            </p>
          </div>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3">
              Full Designation
            </label>
            <div className="group relative">
              <User className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110 group-focus-within:rotate-3 shadow-blue-500/20" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-16 w-full rounded-[1.25rem] border border-slate-200/60 bg-white/50 backdrop-blur-md pl-16 pr-8 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 shadow-sm"
                placeholder="Ex. Alexander Pierce"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3">
              Registered Email
            </label>
            <div className="group relative">
              <Mail className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="h-16 w-full rounded-[1.25rem] border border-slate-200/40 bg-slate-50/50 pl-16 pr-8 text-sm font-black text-slate-400 dark:border-slate-800/40 dark:bg-slate-900/30 cursor-not-allowed opacity-60"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Securely Verified</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="timezone" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 stroke-[2.5px]" /> Regional Timezone
            </label>
            <div className="relative group">
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="h-16 w-full appearance-none rounded-[1.25rem] border border-slate-200/60 bg-white/50 backdrop-blur-md px-8 text-sm font-bold text-slate-900 focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 transition-all cursor-pointer shadow-sm"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York">Eastern Standard Time (EST)</option>
                <option value="America/Los_Angeles">Pacific Standard Time (PST)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="h-5 w-5 fill-none stroke-current stroke-3" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="language" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3 flex items-center gap-2">
              <Languages className="h-3.5 w-3.5 stroke-[2.5px]" /> Default Language
            </label>
            <div className="relative group">
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="h-16 w-full appearance-none rounded-[1.25rem] border border-slate-200/60 bg-white/50 backdrop-blur-md px-8 text-sm font-bold text-slate-900 focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 transition-all cursor-pointer shadow-sm"
              >
                <option value="en">English (Global Standard)</option>
                <option value="es">Español (Castellano)</option>
                <option value="fr">Français (République)</option>
                <option value="de">Deutsch (Bundesrepublik)</option>
                <option value="ja">日本語 (Nihongo)</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="h-5 w-5 fill-none stroke-current stroke-3" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex pt-12">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="group relative flex h-16 items-center gap-4 rounded-[1.5rem] bg-linear-to-br from-blue-600 to-indigo-700 px-12 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 overflow-hidden"
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
                <Save className="h-5 w-5 stroke-[2.5px] transition-transform group-hover:scale-110 group-hover:rotate-12" />
            )}
            {updateSettingsMutation.isPending ? 'Processing Transmission...' : 'Update Profile Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
