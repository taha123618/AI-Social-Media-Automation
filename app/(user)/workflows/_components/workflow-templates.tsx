'use client';

import { useState } from 'react';
import { Plus, Star, Clock, Zap, Calendar, BarChart, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { WorkflowTemplate } from '@/features/workflow/types';

export function WorkflowTemplates() {
  const [showAll, setShowAll] = useState(false);

  const templates: WorkflowTemplate[] = [
    {
      id: '1',
      name: 'Daily Content Generation',
      description: 'Generate and post content automatically every day',
      category: 'Content',
      steps: [
        {
          name: 'Generate Content',
          type: 'CONTENT_GENERATION',
          config: { intent: 'ENGAGEMENT' },
          order: 1,
          conditions: []
        },
        {
          name: 'Schedule Posting',
          type: 'CONTENT_SCHEDULING',
          config: { scheduleInHours: 24 },
          order: 2,
          conditions: []
        }
      ],
      icon: 'Calendar',
      isPopular: true
    },
    {
      id: '2',
      name: 'Weekly Analytics Report',
      description: 'Generate and send weekly performance reports',
      category: 'Analytics',
      steps: [
        {
          name: 'Generate Report',
          type: 'CUSTOM',
          config: { reportType: 'analytics' },
          order: 1,
          conditions: []
        },
        {
          name: 'Send Email Notification',
          type: 'NOTIFICATION',
          config: { type: 'email' },
          order: 2,
          conditions: []
        }
      ],
      icon: 'BarChart',
      isPopular: true
    },
    {
      id: '3',
      name: 'Event-Driven Content',
      description: 'Create content when specific events occur',
      category: 'Events',
      steps: [
        {
          name: 'Monitor Events',
          type: 'CUSTOM',
          config: { eventType: 'product.launch' },
          order: 1,
          conditions: []
        },
        {
          name: 'Generate Content',
          type: 'CONTENT_GENERATION',
          config: { intent: 'SALES' },
          order: 2,
          conditions: []
        }
      ],
      icon: 'Zap',
      isPopular: false
    },
    {
      id: '4',
      name: 'Content Approval Workflow',
      description: 'Multi-step content review and approval process',
      category: 'Approval',
      steps: [
        {
          name: 'Generate Content',
          type: 'CONTENT_GENERATION',
          config: { intent: 'BRAND_AWARENESS' },
          order: 1,
          conditions: []
        },
        {
          name: 'Review Content',
          type: 'CONTENT_REVIEW',
          config: { requireApproval: true },
          order: 2,
          conditions: []
        },
        {
          name: 'Schedule Posting',
          type: 'CONTENT_SCHEDULING',
          config: { scheduleInHours: 48 },
          order: 3,
          conditions: []
        }
      ],
      icon: 'Clock',
      isPopular: false
    }
  ];

  const displayedTemplates = showAll ? templates : templates.slice(0, 3);

  const getIcon = (iconName: string) => {
    const iconProps = { className: 'h-6 w-6' };
    switch (iconName) {
      case 'Calendar':
        return <Calendar {...iconProps} />;
      case 'BarChart':
        return <BarChart {...iconProps} />;
      case 'Zap':
        return <Zap {...iconProps} />;
      case 'Clock':
        return <Clock {...iconProps} />;
      default:
        return <Plus {...iconProps} />;
    }
  };

  return (
    <div className="space-y-6 pt-10">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-800 shadow-sm">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Blueprints
          </h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Start with a pre-built automation
          </p>
        </div>
      </motion.div>

      <div className="grid gap-5">
        <AnimatePresence mode="popLayout">
          {displayedTemplates?.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ x: 6, transition: { duration: 0.2 } }}
              className="group relative rounded-3xl border border-slate-200/60 bg-white/60 backdrop-blur-sm p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 dark:hover:shadow-blue-500/10 overflow-hidden"
            >
              {/* Subtle gradient light */}
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl transition-all duration-500 group-hover:bg-blue-500/15" />

              <div className="flex items-start gap-5 relative z-10">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                  {getIcon(template.icon)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                      {template.name}
                    </h3>
                    {template.isPopular && (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-lg dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-800 shadow-sm transition-transform group-hover:scale-105">
                        <Star className="h-3 w-3 fill-current" />
                        POPULAR
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 uppercase tracking-tight">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-xs">
                        {template.category}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="h-3 w-3" />
                        {template.steps.length} steps
                      </span>
                    </div>

                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-create-workflow', { detail: { template } }))}
                      className="cursor-pointer group/btn flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest transition-all"
                    >
                      <span className="relative overflow-hidden inline-block h-full">
                        USE BLUEPRINT
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-transform translate-x-[-105%] group-hover/btn:translate-x-0" />
                      </span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1.5 stroke-[3px]" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {templates?.length > 3 && (
          <Button
            onClick={() => setShowAll(!showAll)}
            className="w-full h-12 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm px-6 py-2 text-xs font-black text-slate-600 uppercase tracking-widest transition-all hover:bg-white hover:border-blue-500/50 hover:text-blue-600 active:scale-[0.98] shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-400"
          >
            {showAll ? 'SHOW LESS' : `VIEW ${templates.length - 3} MORE BLUEPRINTS`}
          </Button>
        )}
      </div>
    </div>
  );
}
