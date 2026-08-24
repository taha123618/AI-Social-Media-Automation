'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { getCurrentBusinessAndUser } from '../actions/get-current-user';

interface AutopilotConfig {
   days?: number;
   postsPerWeek?: number;
   platforms: string[];
   contentMix?: {
      educational: number;
      promotional: number;
      engagement: number;
      testimonial: number;
   };
}

export function AutopilotButton({ onComplete }: { onComplete?: (draftsCreated: number) => void }) {
   const [isOpen, setIsOpen] = useState(false);
   const [isGenerating, setIsGenerating] = useState(false);
   const [generatedPlan, setGeneratedPlan] = useState<{ draftsCreated: number; daysCovered: number } | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [businessId, setBusinessId] = useState<string | null>(null);
   const [creatorId, setCreatorId] = useState<string | null>(null);

   // Get current user and business on mount
   useEffect(() => {
      getCurrentBusinessAndUser().then(data => {
         if (!data.error && 'businessId' in data && data.businessId && data.creatorId) {
            setBusinessId(data.businessId);
            setCreatorId(data.creatorId);
         }
      });
   }, []);

   const defaultConfig: AutopilotConfig = {
      days: 30,
      platforms: ['INSTAGRAM', 'FACEBOOK'],
      contentMix: {
         educational: 30,
         promotional: 30,
         engagement: 25,
         testimonial: 15
      }
   };

   const handleGenerateAutopilot = async () => {
      setIsGenerating(true);
      setError(null);

      try {
         const response = await fetch('/api/autopilot/generate', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'X-Auto-Create': 'true' // Auto-create drafts
            },
            body: JSON.stringify({
               businessId,
               creatorId,
               ...defaultConfig
            })
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || 'Failed to generate autopilot');
         }

         setGeneratedPlan(data.data);

         if (onComplete) {
            onComplete(data.data.draftsCreated);
         }

         // Close after 3 seconds
         setTimeout(() => {
            setIsOpen(false);
            setGeneratedPlan(null);
         }, 3000);

      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to generate autopilot');
      } finally {
         setIsGenerating(false);
      }
   };

   return (
      <>
         {/* Main Button */}
         <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative overflow-hidden px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
         >
            <Sparkles className="h-5 w-5" />
            <span>30-Day Autopilot</span>

            {/* Animated background */}
            <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity" />
         </motion.button>

         {/* Dropdown Panel */}
         <AnimatePresence>
            {isOpen && (
               <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
               >
                  <div className="p-6">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        30-Day Autopilot Mode
                     </h3>

                     <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        Generate and schedule {defaultConfig.days} days of engaging posts automatically.
                        Perfect mix of educational, promotional, and engaging content tailored to your industry.
                     </p>

                     {/* Features */}
                     <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                           <CheckCircle className="h-4 w-4 text-green-500" />
                           <span className="text-slate-700 dark:text-slate-300">
                              Industry-specific templates
                           </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                           <CheckCircle className="h-4 w-4 text-green-500" />
                           <span className="text-slate-700 dark:text-slate-300">
                              Smart posting times
                           </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                           <CheckCircle className="h-4 w-4 text-green-500" />
                           <span className="text-slate-700 dark:text-slate-300">
                              Offer suggestions included
                           </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                           <CheckCircle className="h-4 w-4 text-green-500" />
                           <span className="text-slate-700 dark:text-slate-300">
                              Ready to review & approve
                           </span>
                        </div>
                     </div>

                     {/* Action Button */}
                     <button
                        onClick={handleGenerateAutopilot}
                        disabled={isGenerating}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                     >
                        {isGenerating ? (
                           <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Generating...
                           </>
                        ) : (
                           <>
                              <Calendar className="h-5 w-5" />
                              Generate 30 Days of Posts
                           </>
                        )}
                     </button>

                     {/* Success Message */}
                     {generatedPlan && (
                        <motion.div
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                        >
                           <div className="flex items-center gap-3 mb-2">
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <p className="font-bold text-green-900 dark:text-green-200">
                                 Success!
                              </p>
                           </div>
                           <p className="text-sm text-green-800 dark:text-green-300">
                              Created {generatedPlan.draftsCreated} posts covering {generatedPlan.daysCovered} days
                           </p>
                        </motion.div>
                     )}

                     {/* Error Message */}
                     {error && (
                        <motion.div
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                        >
                           <div className="flex items-center gap-3 mb-2">
                              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              <p className="font-bold text-red-900 dark:text-red-200">
                                 Generation Failed
                              </p>
                           </div>
                           <p className="text-sm text-red-800 dark:text-red-300">
                              {error}
                           </p>
                        </motion.div>
                     )}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </>
   );
}

/**
 * Autopilot Status Indicator
 */
export function AutopilotStatus({ businessId }: { businessId: string }) {
   const [status, setStatus] = useState<{ isActive: boolean; count: number } | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      fetch(`/api/autopilot/status?businessId=${businessId}`)
         .then(res => res.json())
         .then(data => {
            if (data.success) {
               setStatus({
                  isActive: data.data.hasActiveAutopilot,
                  count: data.data.scheduledPostsCount
               });
            }
            setIsLoading(false);
         })
         .catch(() => {
            setIsLoading(false);
         });
   }, [businessId]);

   if (isLoading) {
      return <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />;
   }

   if (!status || !status.isActive) {
      return null;
   }

   return (
      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
         <Clock className="h-3 w-3" />
         <span>{status.count} posts scheduled</span>
      </div>
   );
}
