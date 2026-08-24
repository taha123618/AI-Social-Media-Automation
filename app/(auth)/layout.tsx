"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import AppLogo from "@/components/common/AppLogo";

export default function AuthLayout({
   children,
}: {
   children: ReactNode;
}) {
   return (
      <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden transition-colors selection:bg-blue-100 selection:text-blue-900">
         {/* Background Decor */}
         <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none mesh-gradient opacity-60 dark:opacity-30" />

         {/* Floating Elements */}
         <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] rounded-full animate-float -z-0" />
         <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full animate-float -z-0" style={{ animationDelay: '-3s' }} />

         <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative z-10">
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-10"
            >
               <AppLogo />
            </motion.div>

            <div className="w-full max-w-[440px]">
               {children}
            </div>

            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.5 }}
               className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600"
            >
               Secure Cloud Infrastructure • SocialAI v2.0
            </motion.p>
         </div>
      </div>
   );
}