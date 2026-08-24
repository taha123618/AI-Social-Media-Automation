'use client';

import { motion, Variants } from 'framer-motion';
import { Brain, Library, Info } from 'lucide-react';

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

export default function Loading() {
   return (
      <div className="mx-auto max-w-7xl px-6 py-10">
         <div className="mb-10 flex flex-col gap-2">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-blue-600/50" />
               </div>
               <div className="h-10 w-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-6 w-[30rem] rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse ml-13" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
               <section>
                  <div className="flex items-center gap-3 mb-6">
                     <Info className="h-6 w-6 text-slate-200 dark:text-slate-800" />
                     <div className="h-7 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  </div>

                  <div className="relative overflow-hidden rounded-[3rem] border border-slate-200/60 bg-white/50 backdrop-blur-xl p-10 dark:border-slate-800/60 dark:bg-slate-900/40">
                     <div className="space-y-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                           <div className="h-32 w-32 rounded-[2rem] bg-slate-100 dark:bg-slate-800 shrink-0" />
                           <div className="flex-1 space-y-4 pt-2">
                              <div className="h-10 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-800" />
                              <div className="h-6 w-1/2 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
                           </div>
                        </div>

                        <div className="grid gap-8">
                           <div className="space-y-4">
                              <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                              <div className="h-32 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/40" />
                           </div>
                           <div className="space-y-4">
                              <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                              <div className="h-32 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/40" />
                           </div>
                        </div>
                     </div>
                     <motion.div
                        variants={shimmer}
                        initial="initial"
                        animate="animate"
                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/5"
                     />
                  </div>
               </section>
            </div>

            <aside className="space-y-10">
               <section>
                  <div className="flex items-center gap-3 mb-6">
                     <Library className="h-6 w-6 text-slate-200 dark:text-slate-800" />
                     <div className="h-7 w-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  </div>

                  <div className="space-y-4">
                     {[...Array(4)].map((_, i) => (
                        <div key={i} className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white/50 p-6 dark:border-slate-800/40 dark:bg-slate-900/30">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                              <div className="flex-1 space-y-2">
                                 <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                                 <div className="h-4 w-1/3 rounded bg-slate-100 dark:bg-slate-800/60" />
                              </div>
                           </div>
                           <motion.div
                              variants={shimmer}
                              initial="initial"
                              animate="animate"
                              className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
                           />
                        </div>
                     ))}

                     <div className="pt-4">
                        <div className="h-14 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/30 animate-pulse border-2 border-dashed border-slate-200 dark:border-slate-700/50" />
                     </div>
                  </div>
               </section>
            </aside>
         </div>
      </div>
   );
}
