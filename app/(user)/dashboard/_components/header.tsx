"use client"

import { useSession } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DashboardHeader() {
   // Mock brand health data
   const brandHealth = {
      score: 87,
      engagement: 92,
      consistency: 78,
      reach: 84
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

   return (
      <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
         className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-200/60 dark:border-slate-800/60 pb-10"
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

         <div className="flex items-center gap-4 shrink-0">
            <div className="glass-card rounded-2xl px-6 py-4 border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Status</span>
               <span className="text-sm font-black text-emerald-500 flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  ALL SYSTEMS GO
               </span>
            </div>
         </div>
      </motion.div>
   );
}
