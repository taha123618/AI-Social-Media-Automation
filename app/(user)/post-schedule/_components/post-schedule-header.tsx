'use client';

import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function PostScheduleHeader() {
   return (
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-cyan-600 to-emerald-600 p-8 shadow-2xl">
         {/* Background Pattern */}
         <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M0 0H100V100H0V0Z" fill="url(--schedule-grid)" />
               <defs>
                  <pattern id="schedule-grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                     <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
               </defs>
            </svg>
         </div>

         {/* Content */}
         <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner">
                  <Calendar className="h-8 w-8 text-white" />
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
                     Automation Control Center
                  </p>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                     Post Schedule
                  </h1>
               </div>
            </div>

            <p className="text-lg font-bold text-blue-50 max-w-3xl leading-relaxed">
               Manage your automated posting schedule with precision.
               The cron system automatically publishes posts based on configured times
               when valid scheduled posts exist in the system.
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
               <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <Clock className="h-5 w-5 text-blue-200 mt-0.5" />
                  <div>
                     <p className="text-sm font-bold text-white">Automated Publishing</p>
                     <p className="text-xs text-blue-100 mt-1">Posts publish automatically at scheduled times</p>
                  </div>
               </div>

               <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <CheckCircle className="h-5 w-5 text-emerald-200 mt-0.5" />
                  <div>
                     <p className="text-sm font-bold text-white">Smart Validation</p>
                     <p className="text-xs text-blue-100 mt-1">Cron only runs when valid posts exist</p>
                  </div>
               </div>

               <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <AlertCircle className="h-5 w-5 text-amber-200 mt-0.5" />
                  <div>
                     <p className="text-sm font-bold text-white">Real-time Updates</p>
                     <p className="text-xs text-blue-100 mt-1">Schedule updates trigger cron automatically</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
