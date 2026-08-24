'use client';

import { useState } from 'react';
import { User, Building, Key, Webhook, Bell, CalendarDays, Database } from 'lucide-react';
import { UserSettings, BusinessSettings } from '../types';
import { ProfileSettings } from './profile-settings';
import { BusinessSettingsPanel } from './business-settings';
import { ApiKeysPanel } from './api-keys-panel';
import { WebhooksPanel } from './webhooks-panel';
import { NotificationsPanel } from './notifications-panel';
import { motion, AnimatePresence } from 'framer-motion';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { ServicesPanel } from './services-panel';
import { PostingSchedule } from '@/features/scheduler/components/posting-schedule';
import { CrmIntegrationPanel } from './crm-integration-panel';

interface SettingsTabsProps {
  userSettings: UserSettings | null;
  businessSettings: BusinessSettings | null;
  businessId: string | null;
}

export function SettingsTabs({ userSettings, businessSettings, businessId }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const hasHydrated = useHasHydrated();

  const tabs = [
    { id: 'profile', label: 'Identity', icon: User },
    { id: 'business', label: 'Company', icon: Building },
    { id: 'api-keys', label: 'Security', icon: Key },
    { id: 'webhooks', label: 'Events', icon: Webhook },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'services', label: 'Services', icon: Key },
    { id: 'posting-schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'crm', label: 'CRM', icon: Database },
  ];

  return (
    <div className="space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-20 -mx-6 px-10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-3xl border-b border-slate-200/50 dark:border-slate-800/50"
      >
        <nav className="flex space-x-2 md:space-x-8 -mb-px overflow-x-auto no-scrollbar py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-3 py-6 px-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all whitespace-nowrap outline-none ${isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 shadow-inner rotate-3' : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'}`}>
                  <Icon className={`h-4 w-4 transition-all duration-500 stroke-[2.5px] ${isActive ? 'scale-110' : 'opacity-60'}`} />
                </div>
                {tab.label}
                {isActive && hasHydrated && (
                  <motion.div
                    layoutId="activeSettingTab"
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </motion.div>

      <div className="max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'profile' && (
              <ProfileSettings userSettings={userSettings} />
            )}
            {activeTab === 'business' && (
              <BusinessSettingsPanel businessSettings={businessSettings} businessId={businessId} />
            )}
            {activeTab === 'api-keys' && (
              <ApiKeysPanel businessId={businessId} />
            )}
            {activeTab === 'webhooks' && (
              <WebhooksPanel businessId={businessId} />
            )}
            {activeTab === 'notifications' && (
              <NotificationsPanel userSettings={userSettings} />
            )}
            {activeTab === 'services' && (
              <ServicesPanel businessId={businessId} />
            )}
            {activeTab === 'posting-schedule' && businessId && (
              <PostingSchedule businessId={businessId} />
            )}
            {activeTab === 'crm' && (
              <CrmIntegrationPanel businessId={businessId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
