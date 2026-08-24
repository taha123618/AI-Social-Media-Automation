import * as motion from "framer-motion/client";
import { fadeIn, staggerContainer } from "@/lib/animations/motion";
import { PricingContent } from "./PricingContent";

export default function PricingHeader() {
   return (
      <section className="py-24 px-4 text-center relative z-10">
         <div className="container mx-auto">
            <motion.div
               variants={staggerContainer}
               initial="initial"
               animate="animate"
               className="max-w-4xl mx-auto"
            >
               <motion.span
                  variants={fadeIn}
                  className="text-[#2D46FF] dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-6 block"
               >
                  Plans &amp; Pricing
               </motion.span>
               <motion.h1
                  variants={fadeIn}
                  className="text-5xl md:text-7xl font-black text-slate-950 dark:text-white mb-8 tracking-tighter"
               >
                  Ready to grow your <br /> <span className="text-[#2D46FF] dark:text-blue-500">social organic?</span>
               </motion.h1>
               <motion.p
                  variants={fadeIn}
                  className="text-xl text-slate-500 dark:text-slate-400 font-bold mb-16 max-w-2xl mx-auto leading-relaxed"
               >
                  Simple prices. No hidden fees. Cancel at any time.<br className="hidden md:block" />
                  Start with a 14-day free trial on any paid plan.
               </motion.p>

               {/* Interactive Pricing Toggle + Cards */}
               <div className="pb-32">
                  <PricingContent />
               </div>

               {/* Enterprise CTA */}
               <motion.div variants={fadeIn} className="mt-12 text-center">
                  <p className="text-slate-500 dark:text-slate-400 font-bold mb-6 italic opacity-50">
                     Need a custom plan for your enterprise?
                  </p>
                  <button className="text-[#2D46FF] dark:text-blue-400 font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                     Talk to our experts →
                  </button>
               </motion.div>
            </motion.div>
         </div>
      </section>
   );
}
