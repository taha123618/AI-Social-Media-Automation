'use client';

import { motion, Variants } from 'framer-motion';
import { Activity, PieChart } from 'lucide-react';

const shimmer: Variants = {
   initial: { x: '-100%' },
   animate: {
      x: '100%',
      transition: {
         repeat: Infinity,
         duration: 1.5,
         ease: "easeInOut"
      }
   }
};

const SkeletonCard = ({ className = "" }: { className?: string }) => (
   <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-sm p-6 dark:border-slate-800 dark:bg-slate-900/40 ${className}`}>
      <div className="space-y-4">
         <div className="h-6 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
         <div className="h-10 w-1/2 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
         <div className="h-4 w-full rounded-lg bg-slate-200/60 dark:bg-slate-800/40" />
      </div>
      <motion.div
         variants={shimmer}
         initial="initial"
         animate="animate"
         className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
      />
   </div>
);

export default function Loading() {
   return (
      <div className="mx-auto max-w-7xl px-6 py-10">
         <div className="mb-10 flex flex-col gap-2">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600/50" />
               </div>
               <div className="h-10 w-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-6 w-96 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse ml-13" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
               <SkeletonCard key={i} />
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            <div className="lg:col-span-2 space-y-6">
               <div className="relative overflow-hidden h-[400px] rounded-[2.5rem] border border-slate-200 bg-white/50 dark:bg-slate-900/40 p-10 border-slate-200/60 dark:border-slate-800/60">
                  <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-slate-800 mb-8" />
                  <div className="flex items-end gap-4 h-64">
                     {[...Array(12)].map((_, i) => (
                        <div
                           key={i}
                           className="flex-1 bg-slate-100 dark:bg-slate-800/60 rounded-t-xl"
                           style={{ height: `${20 + ((i * 7) % 61) + 10}%` }} // Deterministic "random" heights
                        />
                     ))}
                  </div>
                  <motion.div
                     variants={shimmer}
                     initial="initial"
                     animate="animate"
                     className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                  />
               </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/50 p-8 dark:border-slate-800 dark:bg-slate-900/40">
               <div className="flex items-center gap-3 mb-8">
                  <PieChart className="h-6 w-6 text-slate-200 dark:text-slate-800" />
                  <div className="h-6 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
               </div>
               <div className="flex flex-col items-center justify-center py-10">
                  <div className="h-48 w-48 rounded-full border-[16px] border-slate-100 dark:border-slate-800/60 relative">
                     <div className="absolute inset-0 rounded-full border-[16px] border-transparent border-t-slate-200 dark:border-t-slate-700 animate-spin" />
                  </div>
                  <div className="mt-8 space-y-3 w-full">
                     {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                           <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                           <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                     ))}
                  </div>
               </div>
               <motion.div
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
               />
            </div>
         </div>

         <div className="mt-10 relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/50 p-1 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="p-8 space-y-6">
               <div className="h-8 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
               <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                        <div className="flex-1 space-y-2">
                           <div className="h-5 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                           <div className="h-4 w-1/4 rounded bg-slate-100 dark:bg-slate-800/60" />
                        </div>
                        <div className="flex gap-4">
                           <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
                           <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <motion.div
               variants={shimmer}
               initial="initial"
               animate="animate"
               className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
            />
         </div>
      </div>
   );
}
