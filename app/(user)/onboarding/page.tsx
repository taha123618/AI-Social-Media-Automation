'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessTypeSelector } from './_components/business-type-selector';
import { WebsiteScanner, type ScrapedData } from './_components/website-scanner';

type Step = 'business-type' | 'website-scan' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('business-type');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessId, setBusinessId] = useState<string | undefined>(undefined);

  const handleBusinessTypeSelect = (type: string) => {
    setSelectedBusinessType(type);
  };

  const handleScanComplete = (data: ScrapedData) => {
    // Business profile has been updated by the API
    console.log('Scan complete:', data);
  };

  const handleNext = () => {
    if (currentStep === 'business-type' && selectedBusinessType) {
      setCurrentStep('website-scan');
    } else if (currentStep === 'website-scan') {
      setCurrentStep('complete');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {['business-type', 'website-scan', 'complete'].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === step
                      ? 'bg-blue-600 text-white'
                      : ['business-type', 'website-scan'].indexOf(currentStep) > idx
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                >
                  {['business-type', 'website-scan'].indexOf(currentStep) > idx ? '✓' : idx + 1}
                </div>
                {idx < 2 && (
                  <div
                    className={`w-32 h-1 mx-4 ${['business-type', 'website-scan'].indexOf(currentStep) > idx
                        ? 'bg-green-600'
                        : 'bg-slate-200'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'business-type' && (
            <motion.div
              key="business-type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <BusinessTypeSelector
                onSelect={handleBusinessTypeSelect}
                selectedType={selectedBusinessType}
              />
              <div className="mt-8 text-center">
                <button
                  onClick={handleNext}
                  disabled={!selectedBusinessType}
                  className="px-12 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'website-scan' && (
            <motion.div
              key="website-scan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <WebsiteScanner
                onScanComplete={handleScanComplete}
                businessId={businessId}
              />
              <div className="mt-8 text-center flex gap-4 justify-center">
                <button
                  onClick={() => setCurrentStep('business-type')}
                  className="px-8 py-4 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-12 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                >
                  {websiteUrl ? 'Skip & Continue' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                You&apos;re All Set!
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                Your AI Growth Assistant is ready to help you attract more customers
              </p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
