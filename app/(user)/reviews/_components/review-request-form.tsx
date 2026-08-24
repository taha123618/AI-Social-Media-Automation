'use client';

import { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReviewRequestFormProps {
  onClose?: () => void;
  onSubmit?: (data: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    channel: 'EMAIL' | 'SMS';
    customMessage?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function ReviewRequestForm({ onClose, onSubmit, isLoading }: ReviewRequestFormProps) {
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    channel: 'EMAIL' as 'EMAIL' | 'SMS',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields based on channel
    if (!formData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    if (formData.channel === 'EMAIL' && !formData.customerEmail.trim()) {
      alert('Email is required for email delivery');
      return;
    }

    if (formData.channel === 'SMS' && !formData.customerPhone.trim()) {
      alert('Phone number is required for SMS delivery');
      return;
    }

    // Validate phone number format for SMS
    if (formData.channel === 'SMS' && formData.customerPhone.trim()) {
      const phone = formData.customerPhone.trim();

      // Check if phone number starts with + (country code)
      if (!phone.startsWith('+')) {
        alert('Phone number must include country code (e.g., +92 for Pakistan, +1 for USA). Please add the + prefix and country code.');
        return;
      }

      // Check if phone number has valid length after + (should be 10-15 digits)
      const digitsAfterPlus = phone.substring(1).replace(/[^0-9]/g, '');
      if (digitsAfterPlus.length < 10 || digitsAfterPlus.length > 15) {
        alert('Invalid phone number format. Phone number should have 10-15 digits after the country code.');
        return;
      }

      // Check if phone number contains only valid characters after +
      if (!phone.substring(1).match(/^[0-9X\s\-\(\)]+$/)) {
        alert('Invalid phone number format. Only digits, spaces, hyphens, parentheses, and X are allowed.');
        return;
      }
    }

    if (onSubmit) {
      try {
        await onSubmit({
          customerName: formData.customerName,
          customerEmail: formData.channel === 'EMAIL' ? formData.customerEmail : '',
          customerPhone: formData.channel === 'SMS' ? formData.customerPhone : undefined,
          channel: formData.channel,
          customMessage: formData.message || undefined
        });
        setSuccess(true);
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } catch (error) {
        console.error('Failed to send review request:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={() => onClose?.()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Request a Review</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onClose?.()}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Send a personalized review request to your customer
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email {formData.channel === 'EMAIL' && <span className="text-red-500">*</span>}</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="john@example.com"
                required={formData.channel === 'EMAIL'}
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone {formData.channel === 'SMS' && <span className="text-red-500">*</span>}</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+92 349 299 4930 (include country code)"
                required={formData.channel === 'SMS'}
              />
              {formData.channel === 'SMS' && (
                <p className="text-xs text-slate-500 mt-1">
                  Include country code: +92 (Pakistan), +1 (USA), +44 (UK), etc.
                </p>
              )}
            </div>

            <div>
              <Label>Delivery Channel</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="channel"
                    checked={formData.channel === 'EMAIL'}
                    onChange={() => setFormData({ ...formData, channel: 'EMAIL' })}
                    className="h-4 w-4"
                  />
                  Email
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="channel"
                    checked={formData.channel === 'SMS'}
                    onChange={() => setFormData({ ...formData, channel: 'SMS' })}
                    className="h-4 w-4"
                  />
                  SMS
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Custom Message (optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Thanks for your purchase! We'd love to hear your feedback..."
                rows={3}
              />
            </div>

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  ✓ Review request sent successfully!
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onClose?.()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
