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
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { Loader2, Megaphone, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const schema = z.object({
  productName: z.string().min(2, 'Required'),
  description: z.string().min(10, 'Please provide a detailed description'),
  offer: z.string().min(2, 'Required'),
  industry: z.string().min(2, 'Required'),
  audience: z.string().min(2, 'Required'),
  geography: z.string().min(2, 'Required'),
  objective: z.string().min(1, 'Required'),
  tone: z.string().min(1, 'Required'),
  platform: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

export default function UserGenerateAdPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { businessId } = useCurrentBusiness();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productName: '', description: '', offer: '', industry: '',
      audience: '', geography: '', objective: 'TRAFFIC', tone: 'professional', platform: 'META',
    },
  });

  async function onSubmit(data: FormValues) {
    if (!businessId) {
      toast.error('No active workspace selected');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ad-campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-id': businessId },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Generation started!', {
          description: 'Your ad copy is being generated. Check your campaigns dashboard shortly.',
        });
        form.reset();
        router.push('/ad-campaigns');
      } else {
        throw new Error(result.error || 'Failed');
      }
    } catch (err: any) {
      toast.error('Generation failed', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          AI Ad Copy Generator
        </h1>
        <p className="text-muted-foreground mt-1">Describe your product and let AI generate high-converting ad copy for Meta and Google Ads.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Brief</CardTitle>
          <CardDescription>Fill in the details below and we'll generate tailored ad variants instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="productName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Product / Service Name</FormLabel>
                  <FormControl><Input placeholder="e.g. FitTrack Pro" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="industry" render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl><Input placeholder="e.g. Health & Fitness" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} placeholder="What does your product do? What problem does it solve?" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="offer" render={({ field }) => (
              <FormItem>
                <FormLabel>Offer / CTA</FormLabel>
                <FormControl><Input placeholder="e.g. 30% off, Free trial, Book a demo" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="audience" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl><Input placeholder="e.g. Gym-goers aged 25-40" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="geography" render={({ field }) => (
                <FormItem>
                  <FormLabel>Geography</FormLabel>
                  <FormControl><Input placeholder="e.g. United States, Canada" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormField control={form.control} name="platform" render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="META">Meta Ads</SelectItem>
                      <SelectItem value="GOOGLE">Google Ads</SelectItem>
                      <SelectItem value="BOTH">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="objective" render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="TRAFFIC">Traffic</SelectItem>
                      <SelectItem value="LEADS">Lead Gen</SelectItem>
                      <SelectItem value="SALES">Sales</SelectItem>
                      <SelectItem value="AWARENESS">Awareness</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Ad Copy</>}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/ad-campaigns')}>Cancel</Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
