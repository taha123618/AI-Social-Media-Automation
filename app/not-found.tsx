'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Ghost } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
   return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
         {/* Background Decor */}
         <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none mesh-gradient opacity-40 dark:opacity-20" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full -z-0" />

         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-md w-full text-center"
         >
            <motion.div
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="w-24 h-24 rounded-[2rem] bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-200/50 dark:shadow-none"
            >
               <Ghost className="w-12 h-12 text-[#2D46FF]" />
            </motion.div>

            <motion.h1
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-8xl font-black text-slate-100 dark:text-slate-900 absolute -top-16 left-1/2 -translate-x-1/2 -z-10 select-none"
            >
               404
            </motion.h1>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
               Lost in the social ether?
            </h2>

            <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 leading-relaxed">
               The page you're looking for has drifted off into another timeline. Let's get you back to the command center.
            </p>

            <Link href="/" className="inline-block w-full">
               <Button
                  className="w-full h-16 rounded-2xl bg-[#2D46FF] hover:bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-200 dark:shadow-none transition-all group"
               >
                  <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
               </Button>
            </Link>

            <p className="mt-8 text-md font-bold text-red-600 dark:text-red-600 uppercase tracking-[0.3em]">
               Error 404 • SocialAI Alpha
            </p>
         </motion.div>
      </div>
   );
}
