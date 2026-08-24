'use client';

import { useSession } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Heart, Zap, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useCurrentBusiness } from '@/hooks/use-current-business';

export function EnhancedDashboardHeader() {
   const { data: session } = useSession();
   const [currentDate, setCurrentDate] = useState('');

   useEffect(() => {
      setCurrentDate(new Date().toLocaleDateString('en-US', {
         weekday: 'long',
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      }));
   }, []);

   // Use React Query for dashboard stats
   const { businessId } = useCurrentBusiness();
   const { data: dashboardData, isLoading } = useDashboardStats(businessId);

   // Dynamic brand health data
   const brandHealth = {
      score: dashboardData?.brandHealth?.score || 0,
      engagement: dashboardData?.brandHealth?.engagement || 0,
      consistency: dashboardData?.brandHealth?.consistency || 0,
      reach: dashboardData?.brandHealth?.reach || 0
   };

   const getHealthColor = (score: number) => {
      if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      if (score >= 60) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      return 'text-red-600 bg-red-50 dark:bg-red-900/20';
   };

   const healthMetrics = [
      { label: 'Engagement', value: brandHealth.engagement, icon: <Zap className="h-4 w-4" /> },
      { label: 'Consistency', value: brandHealth.consistency, icon: <Shield className="h-4 w-4" /> },
      { label: 'Reach', value: brandHealth.reach, icon: <TrendingUp className="h-4 w-4" /> }
   ];

   // Dynamic stats derived from React Query data
   const stats = [
      {
         label: 'Content Generated',
         value: dashboardData?.metrics?.find((m: { label: string; value: string }) => m.label === 'Content Drafts')?.value || '0',
         change: 'Drafts',
         icon: <Sparkles className="h-5 w-5" />,
         color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
      },
      {
         label: 'Active Automations',
         value: String(dashboardData?.workflowStats?.active || 0),
         change: 'Running',
         icon: <TrendingUp className="h-5 w-5" />,
         color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
      },
      {
         label: 'Automation Success',
         value: dashboardData?.workflowStats?.successRate || '100%',
         change: 'Last 100',
         icon: <Zap className="h-5 w-5" />,
         color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
      },
      {
         label: 'Engagement Rate',
         value: dashboardData?.metrics?.find((m: { label: string; value: string }) => m.label === 'Engagement Rate')?.value || '0%',
         change: 'Weekly',
         icon: <Heart className="h-5 w-5" />,
         color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
      }
   ];

   return (
      <div className="space-y-8">
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-200/60 dark:border-slate-800/60 pb-10"
         >
            <div className="relative">
               {/* Abstract Decorative Element */}
               <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-16 bg-linear-to-b from-blue-600 to-purple-600 rounded-full hidden md:block" />

               <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                     <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                     <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse [animation-delay:0.2s]" />
                     <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse [animation-delay:0.4s]" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600/80 dark:text-blue-400/80">
                     {currentDate}
                  </p>
               </div>

               <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                  Welcome back, <br className="md:hidden" />
                  <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 animate-gradient-x underline decoration-blue-500/20 underline-offset-8">
                     {session?.user?.name?.split(' ')[0] || 'User'}
                  </span>
               </h2>

               <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-bold leading-relaxed">
                  Your social presence is <span className="text-slate-900 dark:text-white border-b-2 border-yellow-400/30">extraordinary</span> today. <br className="hidden sm:block" />
                  Ready to create something <span className="italic text-blue-600 dark:text-blue-400">legendary</span>?
               </p>
            </div>

            {/* Brand Health Score */}
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="flex items-center gap-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
            >
               <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                     <Heart className="h-7 w-7" />
                  </div>
                  <div>
                     <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Brand Health</div>
                     <div className={`text-2xl font-black ${getHealthColor(brandHealth.score)}`}>
                        {brandHealth.score}%
                     </div>
                  </div>
               </div>

               <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

               <div className="flex items-center gap-4">
                  {healthMetrics.map((metric, idx) => (
                     <div key={idx} className="text-center">
                        <div className="flex items-center gap-1.5 mb-1">
                           <span className={`p-1.5 rounded-lg ${getHealthColor(metric.value)}`}>
                              {metric.icon}
                           </span>
                           <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{metric.label}</span>
                        </div>
                        <div className={`text-sm font-black ${getHealthColor(metric.value)}`}>
                           {metric.value}%
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
         </motion.div>

         {/* Quick Stats Overview */}
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
         >
            {stats.map((stat: { label: string; value: string; change: string; icon: React.ReactNode; color: string }, idx: number) => (
               <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                        {stat.icon}
                     </div>
                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                        {stat.change}
                     </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                     {stat.value}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                     {stat.label}
                  </div>
               </div>
            ))}
         </motion.div>
      </div>
   );
}