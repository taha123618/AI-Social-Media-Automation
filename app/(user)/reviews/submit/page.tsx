'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

function ReviewSubmissionForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [customerName, setCustomerName] = useState('');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid review link. Please check your email for the correct link.');
      setLoading(false);
      return;
    }

    fetch(`/api/reviews/submit?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setBusinessName(data.data.business.name);
          setCustomerName(data.data.customerName);
          if (data.data.status === 'SUBMITTED') {
            setSuccess(true);
          }
        }
      })
      .catch(() => setError('Failed to load review details. Please try again later.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, reviewText }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600 font-medium">Loading your invitation...</p>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-6"
      >
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold dark:text-white text-slate-900 mb-4">Thank you, {customerName}!</h1>
        <p className="text-lg dark:text-white text-slate-600 max-w-md mx-auto mb-8">
          Your feedback has been submitted to <strong>{businessName}</strong>. We truly appreciate you taking the time to share your experience.
        </p>
        <div className="text-sm dark:text-white text-slate-400">
          You can now close this window.
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-10 px-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Share Your Experience</h1>
          <p className="opacity-90">How was your visit to {businessName}?</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-center text-slate-700 font-semibold mb-2">
              Rate your experience
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${(hoverRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-500'
                      : 'text-slate-300 fill-transparent'
                      }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-blue-600 font-medium animate-in fade-in slide-in-from-top-1">
                {['Disappointing', 'Could be better', 'Good', 'Very Good', 'Excellent!'][rating - 1]}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-slate-700 font-semibold">
              Tell us more (optional)
            </label>
            <Textarea
              placeholder="What did you like? What could we improve?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-blue-500 text-black"
            />
          </div>

          <Button
            disabled={submitting || rating === 0}
            className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>

          <p className="text-center text-xs text-slate-400">
            Your review will be shared privately with {businessName}.
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default function ReviewSubmitPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      }>
        <ReviewSubmissionForm />
      </Suspense>
    </div>
  );
}
