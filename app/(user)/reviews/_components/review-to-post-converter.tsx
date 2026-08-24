'use client';

import { useState } from 'react';
import { X, Loader2, Copy, Check, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  reviewerName: string;
}

interface ReviewToPostConverterProps {
  review: Review;
  onClose?: () => void;
  onGenerate?: (reviewId: string) => Promise<{ caption: string; hashtags: string[] } | void>;
  isLoading?: boolean;
}

export function ReviewToPostConverter({ review, onClose, onGenerate, isLoading }: ReviewToPostConverterProps) {
  const [post, setPost] = useState<{ caption: string; hashtags: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePost = async () => {
    try {
      if (onGenerate) {
        const result = await onGenerate(review.id);
        if (result && typeof result === 'object' && 'caption' in result) {
          setPost(result);
        } else {
          setPost({
            caption: 'Social post generated successfully',
            hashtags: ['#Testimonial', '#HappyCustomer']
          });
        }
      }
    } catch (error) {
      console.error('Failed to generate post:', error);
    }
  };

  const copyToClipboard = () => {
    if (post) {
      const fullText = `${post.caption}\n\n${post.hashtags.join(' ')}`;
      navigator.clipboard.writeText(fullText);
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
          <h2 className="text-2xl font-bold">Create Social Post</h2>
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
            <Badge variant="outline">{review.reviewerName}</Badge>
          </div>
          <p className="text-slate-600 dark:text-slate-400 italic">&ldquo;{review.reviewText}&rdquo;</p>
        </div>

        {!post ? (
          <div className="text-center py-8">
            <Button onClick={generatePost} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="h-5 w-5 mr-2" />
                  Generate Social Media Post
                </>
              )}
            </Button>
            <p className="text-sm text-slate-500 mt-2">
              This will create an engaging post ready for Instagram, Facebook, or LinkedIn
            </p>
          </div>
        ) : (
          <>
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                ✓ Social post generated! Ready to publish.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Caption:</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {post.caption}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Hashtags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag, i) => (
                    <Badge key={i} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </>
                  )}
                </Button>
                <Button onClick={() => onClose?.()}>Done</Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
