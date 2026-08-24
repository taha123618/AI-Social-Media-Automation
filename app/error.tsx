'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
   error,
   reset,
}: {
   error: Error & { digest?: string };
   reset: () => void;
}) {
   useEffect(() => {
      console.error(error);
   }, [error]);

   return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
         {/* Background Decor */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full -z-0" />

         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-md w-full text-center"
         >
            <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mx-auto mb-8">
               <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
               Something went wrong
            </h1>

            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
               An unexpected error occurred. Don't worry, our team has been notified. You can try refreshing the page or head back to safety.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Button
                  onClick={() => reset()}
                  className="w-full sm:flex-1 h-14 rounded-2xl bg-[#2D46FF] hover:bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-200 dark:shadow-none transition-all group"
               >
                  <RefreshCcw className="mr-2 w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                  Try again
               </Button>

               <Link href="/" className="w-full sm:flex-1">
                  <Button
                     variant="outline"
                     className="w-full h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                     <ArrowLeft className="mr-2 w-5 h-5" />
                     Go Home
                  </Button>
               </Link>
            </div>

            {error.digest && (
               <p className="mt-8 text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                  Error Code: {error.digest}
               </p>
            )}
         </motion.div>
      </div>
   );
}
