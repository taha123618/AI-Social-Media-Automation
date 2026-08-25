'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessTypeSelector } from './_components/business-type-selector';
import { WebsiteScanner, type ScrapedData } from './_components/website-scanner';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    console.log('Scan complete:', data);
  };

  const handleNext = () => {
    if (currentStep === 'business-type' && selectedBusinessType) {
      setCurrentStep('website-scan');
    } else if (currentStep === 'website-scan') {
      setCurrentStep('complete');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {['business-type', 'website-scan', 'complete'].map((step, idx) => {
              const isPast = ['business-type', 'website-scan', 'complete'].indexOf(currentStep) > idx;
              const isCurrent = currentStep === step;

              return (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-xs'
                        : isPast
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground border border-border/80'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  {idx < 2 && (
                    <div
                      className={`w-20 sm:w-28 h-0.5 mx-2 transition-all ${
                        isPast ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Container */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-10 shadow-lg">
          <AnimatePresence mode="wait">
            {currentStep === 'business-type' && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <BusinessTypeSelector
                  onSelect={handleBusinessTypeSelect}
                  selectedType={selectedBusinessType}
                />

                <div className="flex justify-end pt-4 border-t border-border/60">
                  <Button
                    onClick={handleNext}
                    disabled={!selectedBusinessType}
                    className="text-xs font-semibold rounded-lg gap-2"
                  >
                    <span>Continue to Website Grounding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 'website-scan' && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <WebsiteScanner
                  onScanComplete={handleScanComplete}
                  businessId={businessId}
                />

                <div className="flex justify-between items-center pt-4 border-t border-border/60">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('business-type')}
                    className="text-xs font-medium rounded-lg"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="text-xs font-semibold rounded-lg gap-2"
                  >
                    <span>Finalize Workspace Setup</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 'complete' && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Workspace Initialization Complete
                </h2>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your autonomous agents and brand voice vectors are active. Redirecting to operator dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
