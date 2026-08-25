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
import { FeatureGate } from '@/components/billing/FeatureGate';

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
    { id: 'business', label: 'Organization', icon: Building },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'services', label: 'Credentials', icon: Key },
    { id: 'posting-schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'crm', label: 'CRM', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border/70 pb-2 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1 sm:space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap outline-none ${isActive && hasHydrated
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && <ProfileSettings userSettings={userSettings} />}
          {activeTab === 'business' && (
            <BusinessSettingsPanel
              businessSettings={businessSettings}
              businessId={businessId}
            />
          )}
          {activeTab === 'api-keys' && (
            <FeatureGate feature="api_access">
              <ApiKeysPanel businessId={businessId} />
            </FeatureGate>
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
            <FeatureGate feature="scheduling">
              <PostingSchedule businessId={businessId} />
            </FeatureGate>
          )}
          {activeTab === 'crm' && (
            <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
              <CrmIntegrationPanel businessId={businessId || ''} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
