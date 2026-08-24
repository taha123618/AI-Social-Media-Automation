'use client';

import { useState } from 'react';
import { X, Loader2, Copy, Check, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  reviewerName: string;
}

interface ReviewResponseGeneratorProps {
  review: Review;
  onClose?: () => void;
  onGenerate?: (reviewId: string) => Promise<{ response?: string } | string | void>;
  onSendEmail?: (reviewId: string) => Promise<void>;
  isLoading?: boolean;
  isSending?: boolean;
}

export function ReviewResponseGenerator({ review, onClose, onGenerate, onSendEmail, isLoading, isSending }: ReviewResponseGeneratorProps) {
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateResponse = async () => {
    try {
      if (onGenerate) {
        const result = await onGenerate(review.id);
        if (typeof result === 'string') {
          setResponse(result);
        } else if (result && typeof result === 'object' && 'responseText' in result) {
          setResponse((result as any).responseText);
        } else if (result && typeof result === 'object' && result.response) {
          setResponse(result.response);
        } else {
          setResponse('Response generated successfully (could not parse output text)');
        }
      }
    } catch (error) {
      console.error('Failed to generate response:', error);
    }
  };

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={() => onClose?.()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full p-6 shadow-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Generate AI Response</h2>
          <Button size="sm" variant="ghost" onClick={() => onClose?.()} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Review Preview */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-slate-300'}>★</span>
            ))}
          </div>
          <p className="font-semibold">{review.reviewerName}</p>
          <p className="text-slate-600 dark:text-slate-400 mt-2">{review.reviewText}</p>
        </div>

        {!response ? (
          <div className="text-center py-8">
            <Button onClick={generateResponse} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Professional Response'
              )}
            </Button>
          </div>
        ) : (
          <>
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                ✓ AI-generated response ready to use!
              </AlertDescription>
            </Alert>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4 whitespace-pre-wrap">
              {response}
            </div>

            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Response
                  </>
                )}
              </Button>
                {onSendEmail && (
                  <Button
                    onClick={() => onSendEmail(review.id)}
                    disabled={isSending}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send to Customer
                      </>
                    )}
                  </Button>
                )}
                <Button onClick={() => onClose?.()} variant="secondary">Done</Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
