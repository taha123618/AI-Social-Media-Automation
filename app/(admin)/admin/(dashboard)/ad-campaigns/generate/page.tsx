"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/workspace-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const generateFormSchema = z.object({
  productName: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Please provide a detailed description'),
  offer: z.string().min(2, 'Offer details are required'),
  industry: z.string().min(2, 'Industry is required'),
  audience: z.string().min(2, 'Target audience is required'),
  geography: z.string().min(2, 'Geography is required'),
  objective: z.string().min(2, 'Objective is required'),
  tone: z.string().min(2, 'Tone of voice is required'),
});

type GenerateFormValues = z.infer<typeof generateFormSchema>;

export default function GenerateAdCampaignPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { businessId } = useWorkspace();
  const router = useRouter();

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      productName: '',
      description: '',
      offer: '',
      industry: '',
      audience: '',
      geography: 'Global',
      objective: 'traffic',
      tone: 'professional',
    },
  });

  async function onSubmit(data: GenerateFormValues) {
    if (!businessId) {
      toast.error('No active workspace selected');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ad-campaigns/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Success!', {
          description: 'Ad Generation started in the background.',
        });
        // Redirect to a placeholder dashboard or the ad viewer
        router.push(`/admin/ad-campaigns`);
      } else {
        throw new Error(result.error || 'Failed to generate ad');
      }
    } catch (error: any) {
      toast.error('Generation Failed', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>AI Ad Copy Generator</CardTitle>
          <CardDescription>Enter a brief to generate high-converting ad copy for Meta and Google Ads.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product/Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Marketing Tool" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SaaS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What does your product do? What are its key benefits?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="offer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Offer (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 20% off for early birds" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Small business owners" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="geography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geography</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. US & Canada" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objective</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select objective" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="traffic">Traffic</SelectItem>
                          <SelectItem value="leads">Leads</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="awareness">Brand Awareness</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone of Voice</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Generating Variations..." : "Generate Ad Copy"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
