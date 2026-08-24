'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface BusinessType {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultTone: string;
  preferredTopics: string[];
  forbiddenWords: string[];
  ctaStyle: string;
  postingFrequency: number;
  bestPlatforms: string[];
}

interface BusinessTypeSelectorProps {
  onSelect: (businessType: string) => void;
  selectedType?: string;
}

export function BusinessTypeSelector({ onSelect, selectedType }: BusinessTypeSelectorProps) {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch business types on mount
  useEffect(() => {
    fetch('/api/settings/business-type')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBusinessTypes(data.businessTypes);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load business types:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          What type of business do you have?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Select your industry to get personalized templates and recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessTypes.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => onSelect(type.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-6 rounded-2xl border-2 transition-all text-left ${selectedType === type.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
          >
            {selectedType === type.id && (
              <div className="absolute top-4 right-4">
                <Check className="h-6 w-6 text-blue-600" />
              </div>
            )}

            <div className="text-4xl mb-4">{type.icon}</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {type.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {type.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>📊</span>
                <span>{type.postingFrequency} posts/week recommended</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {type.bestPlatforms.slice(0, 3).map((platform) => (
                  <span
                    key={platform}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium"
                  >
                    {platform.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
