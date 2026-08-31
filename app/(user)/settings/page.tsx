import React from 'react';
import Link from 'next/link';
import {
  User,
  Building,
  CreditCard,
  Key,
  Webhook,
  Bell,
  Cpu,
  CalendarDays,
  Database,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SettingsSection {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  color: string;
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Profile & Identity',
    description: 'Manage your personal account details, avatar, security settings, and login credentials.',
    href: '/settings/profile',
    icon: User,
    color: 'from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/20',
  },
  {
    title: 'Organization & Workspace',
    description: 'Configure business name, brand voice tone, default timezone, and operational parameters.',
    href: '/settings/organization',
    icon: Building,
    color: 'from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-500/20',
  },
  {
    title: 'Billing & Subscription',
    description: 'Manage your plan tier, usage quotas, payment methods, and automated billing invoices.',
    href: '/settings/billing',
    icon: CreditCard,
    badge: 'Pro Tier',
    color: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    title: 'Developer API Keys',
    description: 'Generate high-throughput API keys for programmatically scheduling posts and invoking AI agents.',
    href: '/settings/api-keys',
    icon: Key,
    badge: 'Enterprise',
    color: 'from-amber-500/10 to-yellow-500/10 text-amber-400 border-amber-500/20',
  },
  {
    title: 'Outbound Webhooks',
    description: 'Dispatch real-time HMAC SHA-256 signed event notifications to your external backend systems.',
    href: '/settings/webhooks',
    icon: Webhook,
    badge: 'Real-time',
    color: 'from-cyan-500/10 to-sky-500/10 text-cyan-400 border-cyan-500/20',
  },
  {
    title: 'Alerts & Notifications',
    description: 'Customize notifications for scheduled publishing, campaign anomalies, and team activities.',
    href: '/settings/notifications',
    icon: Bell,
    color: 'from-rose-500/10 to-red-500/10 text-rose-400 border-rose-500/20',
  },
  {
    title: 'AI Provider Credentials',
    description: 'Bring your own API keys for OpenAI, Anthropic, OpenRouter, and ElevenLabs voice narration.',
    href: '/settings/credentials',
    icon: Cpu,
    color: 'from-violet-500/10 to-purple-500/10 text-violet-400 border-violet-500/20',
  }
];

export default function SettingsHubPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-card/60 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Settings & Configuration Hub
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Centralized workspace administration. Configure your identity, brand guidelines, billing, API keys, webhooks, and integrations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs py-1 px-2.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Workspace Secure
            </Badge>
          </div>
        </div>
      </div>

      {/* Settings Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:bg-card/90 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-br ${section.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {section.badge && (
                    <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                      {section.badge}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {section.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                <span>Manage settings</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
