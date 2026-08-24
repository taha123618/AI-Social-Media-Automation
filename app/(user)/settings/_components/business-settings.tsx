'use client';

import { useState } from 'react';
import { Building, Globe, Save, Info, ShieldCheck, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { BusinessSettings } from '../types';
import { motion } from 'framer-motion';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { toast } from 'sonner';
import { useSettings, useUpdateBusinessSettings } from '@/features/settings/hooks/use-settings';

interface BusinessSettingsPanelProps {
  businessSettings: BusinessSettings | null;
  businessId: string | null;
}

interface BusinessFormData {
  name: string;
  website: string;
  location: string;
  description: string;
  industry: string;
  size: string;
  timezone: string;
  autoApproveContent: boolean;
  requireApprovalForPosts: boolean;
  contentGuidelines: string;
}

export function BusinessSettingsPanel({ businessSettings: initialBusinessSettings, businessId }: BusinessSettingsPanelProps) {
  // Use React Query to fetch settings (this will update after mutations)
  const { data: businessSettings } = useSettings(businessId || '');
  
  // Use the fetched data or fall back to initial props
  const settings = businessSettings || initialBusinessSettings;
  
  // Use settings ID as key to force re-render when data changes
  const settingsKey = settings?.id || 'initial';
  
  return <BusinessSettingsPanelForm key={settingsKey} settings={settings} businessId={businessId} />;
}

function BusinessSettingsPanelForm({ settings, businessId }: { settings: BusinessSettings | null; businessId: string | null }) {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: settings?.name || '',
    website: settings?.website || '',
    location: settings?.location || '',
    description: settings?.description || '',
    industry: settings?.industry || '',
    size: settings?.size || '',
    timezone: settings?.timezone || 'UTC',
    autoApproveContent: settings?.autoApproveContent || false,
    requireApprovalForPosts: settings?.requireApprovalForPosts ?? true,
    contentGuidelines: settings?.contentGuidelines || '',
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const hasHydrated = useHasHydrated();
  
  // Use React Query mutation for updating settings with Axios
  const updateSettingsMutation = useUpdateBusinessSettings(businessId || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Business name is required');
      return;
    }

    setSaveStatus('saving');

    try {
      // Use React Query mutation with Axios
      await updateSettingsMutation.mutateAsync({
        name: formData.name,
        website: formData.website || null,
        location: formData.location || null,
        description: formData.description || null,
        industry: formData.industry || null,
        timezone: formData.timezone,
        autoApproveContent: formData.autoApproveContent,
        requireApprovalForPosts: formData.requireApprovalForPosts,
        contentGuidelines: formData.contentGuidelines || null,
      });

      setSaveStatus('success');
      toast.success('Business settings saved successfully!');

      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const handleInputChange = (field: keyof BusinessFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset save status when user makes changes
    if (saveStatus === 'success' || saveStatus === 'error') {
      setSaveStatus('idle');
    }
  };

  if (!hasHydrated) return null;

  return (
    <div className="space-y-16 pb-20">
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-2.5 w-12 rounded-full bg-linear-to-r from-blue-600 to-indigo-600" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Institutional Identity</p>
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
          Business <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Profile</span>
        </h2>
        <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
          Configure your organization&apos;s digital blueprint and content automation policies to ensure <span className="text-slate-900 dark:text-white underline decoration-blue-500/30 underline-offset-4">absolute brand synchronization</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <label htmlFor="business-name" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3">
              Organization Name
            </label>
            <div className="group relative">
              <Building className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110 group-focus-within:rotate-3" />
              <input
                type="text"
                id="business-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="h-16 w-full rounded-4xl border border-slate-200/60 bg-white/50 backdrop-blur-md pl-16 pr-8 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 shadow-sm"
                placeholder="Ex. Global Tech Industries"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="website" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3">
              Corporate Domain
            </label>
            <div className="group relative">
              <Globe className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110" />
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
                className="h-16 w-full rounded-4xl border border-slate-200/60 bg-white/50 backdrop-blur-md pl-16 pr-8 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="location" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3">
              Primary Location (City)
            </label>
            <div className="group relative">
              <Building className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-all group-focus-within:text-blue-500 group-focus-within:scale-110" />
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State"
                className="h-16 w-full rounded-4xl border border-slate-200/60 bg-white/50 backdrop-blur-md pl-16 pr-8 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="industry" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3">
              Industry Vertical
            </label>
            <div className="relative group">
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="h-16 w-full appearance-none rounded-4xl border border-slate-200/60 bg-white/50 backdrop-blur-md px-8 text-sm font-bold text-slate-900 focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 transition-all cursor-pointer shadow-sm"
              >
                <option value="">Select Vertical</option>
                <option value="technology">Technology & SaaS</option>
                <option value="healthcare">Healthcare & Biotech</option>
                <option value="finance">Finance & Fintech</option>
                <option value="retail">Retail & E-commerce</option>
                <option value="education">Education & EdTech</option>
                <option value="other">Institutional / Misc.</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="h-5 w-5 fill-none stroke-current stroke-3" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="size" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3">
              Operational Scale
            </label>
            <div className="relative group">
              <select
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="h-16 w-full appearance-none rounded-[1.25rem] border border-slate-200/60 bg-white/50 backdrop-blur-md px-8 text-sm font-bold text-slate-900 focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 transition-all cursor-pointer shadow-sm"
              >
                <option value="">Select Scale</option>
                <option value="1-10">1-10 Members (Agile)</option>
                <option value="11-50">11-50 Members (Growth)</option>
                <option value="51-200">51-200 Members (Staged)</option>
                <option value="201-500">201-500 Members (Large)</option>
                <option value="500+">500+ Members (Enterprise)</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="h-5 w-5 fill-none stroke-current stroke-3" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3 flex items-center gap-2">
            <Info className="h-4 w-4 stroke-[2.5px]" /> Strategic Mission
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full rounded-[2.5rem] border border-slate-200/60 bg-white/50 backdrop-blur-md p-8 text-sm font-bold leading-relaxed text-slate-900 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 shadow-sm"
            placeholder="Define the core purpose and objective of your institution..."
          />
        </div>

        <div className="space-y-4">
          <label htmlFor="content-guidelines" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-3 flex items-center gap-2">
            <Target className="h-4 w-4 stroke-[2.5px]" /> Brand Voice & Tonality
          </label>
          <textarea
            id="content-guidelines"
            value={formData.contentGuidelines}
            onChange={(e) => handleInputChange('contentGuidelines', e.target.value)}
            rows={5}
            className="w-full rounded-[2.5rem] border border-slate-200/60 bg-white/50 backdrop-blur-md p-8 text-sm font-bold leading-relaxed text-slate-900 transition-all focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 shadow-sm"
            placeholder="Specify tonality parameters (e.g. Sophisticated, Analytical, Direct, Empathetic)..."
          />
        </div>

        <div className="rounded-[3.5rem] bg-slate-50/50 dark:bg-slate-900/30 p-12 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-500/30 rotate-3">
              <ShieldCheck className="h-6 w-6 text-white stroke-[2.5px]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Automation Governance</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Rules of Engagement & Compliance</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <label className="group relative flex items-start gap-6 p-8 rounded-[2rem] bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="relative flex items-center h-7 mt-1">
                <input
                  type="checkbox"
                  checked={formData.autoApproveContent}
                  onChange={(e) => handleInputChange('autoApproveContent', e.target.checked)}
                  className="h-7 w-7 rounded-xl border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 transition-all cursor-pointer shadow-inner"
                />
              </div>
              <div>
                <span className="block text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2">Omni-Flow Autonomous</span>
                <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">Permit the AI to orchestrate and deploy drafts autonomously based on strategic guidelines.</span>
              </div>
            </label>

            <label className="group relative flex items-start gap-6 p-8 rounded-[2rem] bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="relative flex items-center h-7 mt-1">
                <input
                  type="checkbox"
                  checked={!!formData.requireApprovalForPosts}
                  onChange={(e) => handleInputChange('requireApprovalForPosts', e.target.checked)}
                  className="h-7 w-7 rounded-xl border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 transition-all cursor-pointer shadow-inner"
                />
              </div>
              <div>
                <span className="block text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2">Mandatory Human-in-the-Loop</span>
                <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">Requires explicit verification of all machine-generated content before public transmission.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex pt-8">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending || saveStatus === 'saving'}
            className="group relative flex h-16 items-center justify-center gap-4 rounded-[1.5rem] bg-linear-to-br from-blue-600 to-indigo-700 px-12 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {saveStatus === 'saving' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Save className="h-5 w-5 stroke-[2.5px]" />
              </motion.div>
            ) : saveStatus === 'success' ? (
              <CheckCircle className="h-5 w-5 stroke-[2.5px] text-green-300" />
            ) : saveStatus === 'error' ? (
              <AlertCircle className="h-5 w-5 stroke-[2.5px] text-red-300" />
            ) : (
                    <Save className="h-5 w-5 stroke-[2.5px] transition-transform group-hover:scale-110 group-hover:-rotate-12" />
            )}
            {saveStatus === 'saving' ? 'Saving...' :
              saveStatus === 'success' ? 'Saved Successfully!' :
                saveStatus === 'error' ? 'Save Failed' :
                  'Persist Business Parameters'}
          </button>
        </div>
      </form>
    </div>
  );
}
