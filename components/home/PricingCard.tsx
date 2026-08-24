"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
   name: string;
   price: string;
   originalPrice?: string;
   description: string;
   features: string[];
   cta: string;
   popular?: boolean;
   highlightColor?: string;
   billingCycle?: "month" | "year";
}

export const PricingCard = ({
   name,
   price,
   originalPrice,
   description,
   features,
   cta,
   popular = false,
   highlightColor = "#2D46FF",
   billingCycle = "month"
}: PricingCardProps) => {
   return (
      <motion.div
         whileHover={{ y: -5 }}
         className={`relative p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full bg-white dark:bg-slate-900 ${popular
            ? "border-blue-200 dark:border-blue-900 shadow-[0_48px_80px_-16px_rgba(45,70,255,0.18)] dark:shadow-none ring-2 ring-blue-500/10 dark:ring-blue-400/20 z-10 scale-105 md:scale-[1.08]"
               : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none"
            }`}
      >
         {popular && (
            <div
               className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-lg shadow-blue-200 dark:shadow-none"
               style={{ backgroundColor: highlightColor }}
            >
               Most Popular
            </div>
         )}

         <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-2 tracking-tight">{name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
               {description}
            </p>
         </div>

         <div className="mb-8">
            <div className="h-8 flex items-center gap-3 mb-1">
               <AnimatePresence mode="wait">
                  {billingCycle === "year" && originalPrice && (
                     <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex items-center gap-3"
                     >
                        <span className="text-xl font-bold text-slate-300 dark:text-slate-700 line-through decoration-slate-400 dark:decoration-slate-600 decoration-2">
                           {originalPrice}
                        </span>
                        <span className="bg-blue-50 dark:bg-blue-500/10 text-[#2D46FF] dark:text-blue-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                           Save 20%
                        </span>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            <div className="flex items-baseline gap-1">
               <motion.span
                  key={price}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-6xl font-black text-slate-950 dark:text-white tracking-tighter"
               >
                  {price}
               </motion.span>
               <span className="text-slate-400 dark:text-slate-500 font-bold text-lg">
                  /{billingCycle === "month" ? "mo" : "mo"}
               </span>
            </div>
            {billingCycle === "year" && (
               <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-black uppercase tracking-widest text-[#2D46FF] dark:text-blue-500 mt-2"
               >
                  Billed annually
               </motion.p>
            )}
         </div>

         <div className="space-y-4 mb-10 flex-grow">
            {features.map((feature, i) => (
               <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 mt-0.5">
                     <Check className="w-3 h-3 text-[#2D46FF] dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-snug">{feature}</span>
               </div>
            ))}
         </div>

         <Button
            className={`w-full py-7 rounded-2xl text-lg font-black transition-all active:scale-95 ${popular
                  ? "bg-[#2D46FF] hover:bg-[#1E35E0] text-white shadow-xl shadow-blue-200 dark:shadow-none"
                  : "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-950 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/80"
               }`}
         >
            {cta}
         </Button>
      </motion.div>
   );
};
