"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion";
import { PricingCard } from "@/components/home/PricingCard";
import { PricingToggle } from "@/components/home/PricingToggle";
import { plans } from "@/utils/plans";


export function PricingContent() {
   const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");

   return (
      <>
         {/* Toggle Section */}
         <div className="flex justify-center mb-20 relative z-20">
            <PricingToggle billingCycle={billingCycle} onChange={setBillingCycle} />
         </div>

         {/* Pricing Grid */}
         <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto relative z-10"
         >
            {plans[billingCycle]?.map((plan, index) => (
               <PricingCard
                  key={index}
                  {...plan}
                  billingCycle={billingCycle}
               />
            ))}
         </motion.div>
      </>
   );
}
