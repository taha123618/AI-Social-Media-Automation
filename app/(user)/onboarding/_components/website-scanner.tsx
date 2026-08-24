'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Globe, CheckCircle, AlertCircle } from 'lucide-react';

export interface ScrapedData {
  scraped: {
    name?: string;
    services: string[];
    address?: string;
    hours?: Record<string, { open?: string; close?: string }>;
  };
  brandVoice?: {
    tone: string;
    ctaStyle: string;
    preferredTopics: string[];
  };
}

interface WebsiteScannerProps {
  onScanComplete: (data: ScrapedData) => void;
  businessId?: string;
}

export function WebsiteScanner({ onScanComplete, businessId }: WebsiteScannerProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScrapedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!websiteUrl) return;

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/scanner/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl,
          businessId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan website');
      }

      setScanResult(data.data);
      onScanComplete(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan website');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Let&apos;s analyze your business
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Enter your website URL and we&apos;ll automatically extract your services, hours, and brand voice
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="flex gap-4 mb-6">
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourbusiness.com"
            className="flex-1 px-6 py-4 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800"
          />
          <motion.button
            onClick={handleScan}
            disabled={isScanning || !websiteUrl}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Globe className="h-5 w-5" />
                Scan
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-200">Scan Failed</p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Scraped Info */}
            <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="font-bold text-green-900 dark:text-green-200">Successfully Extracted</h3>
              </div>

              <div className="space-y-4">
                {scanResult.scraped.name && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Business Name</p>
                    <p className="font-semibold">{scanResult.scraped.name}</p>
                  </div>
                )}

                {scanResult.scraped.services.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Services Found</p>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.scraped.services.map((service: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-sm">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {scanResult.brandVoice && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Suggested Brand Voice</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Tone</p>
                        <p className="font-medium">{scanResult.brandVoice.tone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">CTA Style</p>
                        <p className="font-medium">{scanResult.brandVoice.ctaStyle}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              ✅ We&apos;ve updated your business profile with this information
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
