import { toast } from 'sonner';

interface PollOptions {
  jobId: string;
  businessId?: string | null;
  onSuccess: (result: any) => void;
  onError?: (error: string) => void;
  onFinished?: () => void;
  intervalMs?: number;
}

/**
 * Utility to poll the Social AI job status API
 */
export const pollJobStatus = ({
  jobId,
  businessId,
  onSuccess,
  onError,
  onFinished,
  intervalMs = 2000
}: PollOptions) => {
  const interval = setInterval(async () => {
    try {
      const response = await fetch('/api/social/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(businessId && { 'x-business-id': businessId })
        },
        body: JSON.stringify({
          action: 'get-status',
          input: { jobId }
        })
      });

      const data = await response.json();
      if (data.success) {
        if (data.status === 'completed') {
          clearInterval(interval);
          onSuccess(data.result);
          onFinished?.();
        } else if (data.status === 'failed') {
          clearInterval(interval);
          const errorMsg = data.error || 'Job failed';
          if (onError) {
            onError(errorMsg);
          } else {
            toast.error(errorMsg);
          }
          onFinished?.();
        }
      }
    } catch (err) {
      console.error('Polling error:', err);
      clearInterval(interval);
      onFinished?.();
    }
  }, intervalMs);

  return () => clearInterval(interval);
};
