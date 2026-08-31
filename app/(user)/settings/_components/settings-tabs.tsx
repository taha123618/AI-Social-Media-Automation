'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { User, Building, CreditCard, Key, Webhook, Bell, CalendarDays, Database } from 'lucide-react';
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
import Link from 'next/link';

interface SettingsTabsProps {
  userSettings: UserSettings | null;
  businessSettings: BusinessSettings | null;
  businessId: string | null;
  initialTab?: string;
  isStandaloneRoute?: boolean;
}

export function SettingsTabs({
  userSettings,
  businessSettings,
  businessId,
  initialTab = 'profile',
}: SettingsTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasHydrated = useHasHydrated();

  // Helper to determine the tab ID from current pathname or query params
  const getTabFromPath = () => {
    if (!pathname) return initialTab;
    if (pathname.includes('/settings/organization')) return 'organization';
    if (pathname.includes('/settings/billing')) return 'billing';
    if (pathname.includes('/settings/api-keys')) return 'api-keys';
    if (pathname.includes('/settings/webhooks')) return 'webhooks';
    if (pathname.includes('/settings/notifications')) return 'notifications';
    if (pathname.includes('/settings/credentials')) return 'credentials';
    if (pathname.includes('/settings/schedule')) return 'schedule';
    if (pathname.includes('/settings/crm')) return 'crm';
    if (pathname.includes('/settings/profile')) return 'profile';
    
    // Check search params on /settings?tab=...
    const tabParam = searchParams.get('tab');
    if (tabParam) return tabParam;

    return initialTab;
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    const tabFromUrl = getTabFromPath();
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [pathname, searchParams]);

  const tabs = [
    { id: 'profile', label: 'Identity', icon: User, href: '/settings/profile' },
    { id: 'organization', label: 'Organization', icon: Building, href: '/settings/organization' },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard, href: '/settings/billing' },
    { id: 'api-keys', label: 'API Keys', icon: Key, href: '/settings/api-keys' },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook, href: '/settings/webhooks' },
    { id: 'notifications', label: 'Alerts', icon: Bell, href: '/settings/notifications' },
    { id: 'credentials', label: 'Credentials', icon: Key, href: '/settings/credentials' },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays, href: '/settings/schedule' },
    { id: 'crm', label: 'CRM', icon: Database, href: '/settings/crm' },
  ];

  const handleTabClick = (tabId: string, href: string) => {
    setActiveTab(tabId);
    router.push(href);
  };

  return (
    <div className="space-y-6">
      {/* Settings Sub-Navigation Header Bar */}
      <div className="border-b border-border/70 pb-2 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1 sm:space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick(tab.id, tab.href);
                }}
                className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap outline-none cursor-pointer ${
                  isActive && hasHydrated
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'profile' && <ProfileSettings userSettings={userSettings} />}
          {activeTab === 'organization' && (
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
          {activeTab === 'credentials' && (
            <ServicesPanel businessId={businessId} />
          )}
          {activeTab === 'schedule' && (
            <FeatureGate feature="scheduling">
              <PostingSchedule businessId={businessId || ''} />
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
