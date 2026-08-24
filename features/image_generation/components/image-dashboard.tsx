'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Image as ImageIcon,
  GalleryVerticalEnd,
  Brain,
  Layers,
  Palette,
  CheckCircle,
  ArrowRight,
  History
} from 'lucide-react';
import ImageGenerator from '@/features/image_generation/components/image-generator';
import ImageGallery from '@/features/image_generation/components/image-gallery';
import BrandImageGenerator from '@/features/image_generation/components/brand-image-generator';
import ImageJobsList from '@/features/image_generation/components/image-jobs-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BrandAwareImageGenerator from './brand-aware-image-generator';
import { useSession } from '@/lib/auth-client';

interface ImageDashboardProps {
  businessId: string;
  userId?: string;
}

const PIPELINE_STEPS = [
  {
    num: "01",
    icon: Brain,
    title: "Brand Asset Analysis",
    desc: "Sync with your brand colors, logos, and style guides to establish visual constraints.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    num: "02",
    icon: Layers,
    title: "Composition Synthesis",
    desc: "AI determines the optimal layout and subject placement for maximum brand resonance.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    num: "03",
    icon: Palette,
    title: "Pixel-Perfect Rendering",
    desc: "High-fidelity generation using optimized models to ensure professional brand consistency.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

export default function ImageDashboard({ businessId }: ImageDashboardProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [activeTab, setActiveTab] = useState('brand');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [generatedJob, setGeneratedJob] = useState<{
    jobId: string;
    status: string;
  } | null>(null);

  const handleImageGenerated = (data: { jobId: string; status: string }) => {
    setRefreshTrigger(prev => prev + 1);
    if (activeTab === 'brand') {
      setGeneratedJob(data);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/20 text-primary text-[11px] font-bold tracking-tight backdrop-blur-sm shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Next-Gen Brand Intelligence
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/80 to-foreground/40 bg-clip-text text-transparent">
          AI Image Suite
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto font-medium">
          Transform your brand DNA into stunning visual content using our proprietary RAG pipeline and advanced generation.
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-in fade-in duration-700 delay-150">
        <div className="flex justify-center mb-8">
          <TabsList className="cursor-pointer grid grid-cols-3 w-full max-w-[480px] bg-card border border-muted/30 shadow-lg h-12 p-1 rounded-xl">
            <TabsTrigger value="brand" className="cursor-pointer rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <Sparkles className="h-4 w-4 mr-2" /> Brand Gen
            </TabsTrigger>
            <TabsTrigger value="standard" className="cursor-pointer rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <ImageIcon className="h-4 w-4 mr-2" /> Manual
            </TabsTrigger>
            <TabsTrigger value="history" className="cursor-pointer rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
              <History className="h-4 w-4 mr-2" /> History
            </TabsTrigger>
          </TabsList>
        </div>

        {/* BRAND GENERATOR TAB (Smart Gen equivalent) */}
        <TabsContent value="brand">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BrandImageGenerator
                businessId={businessId}
                userId={userId}
                onImageGenerated={handleImageGenerated}
              />
            </div>

            <div className="space-y-6">
              {/* Visual Pipeline */}
              <Card className="relative overflow-hidden border-border bg-card shadow-xl rounded-2xl">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
                <CardHeader className="pt-7 px-6 pb-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visual Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  {PIPELINE_STEPS.map((step, i) => (
                    <div key={i} className={`flex gap-4 p-4 rounded-xl border ${step.border} ${step.bg} transition-all hover:scale-[1.01] duration-200`}>
                      <div className={`w-9 h-9 rounded-lg bg-background/60 border ${step.border} flex items-center justify-center shrink-0`}>
                        <step.icon className={`h-4 w-4 ${step.color}`} />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${step.color}`}>{step.num}</span>
                          <h4 className="text-sm font-bold truncate">{step.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex items-center justify-between">
                    <Badge variant="outline" className="text-[11px] font-mono border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                      ● Operational
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">IMG-AI v1.4</span>
                  </div>
                </CardContent>
              </Card>

              {/* Success card after generation */}
              {generatedJob && (
                <Card className="relative overflow-hidden border-emerald-500/30 bg-emerald-500/5 shadow-lg animate-in fade-in zoom-in-95 duration-500 rounded-2xl">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-500" />
                  <CardHeader className="pt-6 px-6 pb-3">
                    <CardTitle className="text-emerald-500 flex items-center gap-2 text-sm font-bold">
                      <CheckCircle className="h-5 w-5" /> Image Generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Job ID</span>
                      <div className="text-xs font-mono mt-1 truncate">{generatedJob.jobId}</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="w-full h-9 rounded-lg border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-semibold flex items-center justify-center transition-colors"
                    >
                      View in History <ArrowRight className="ml-2 h-3 w-3" />
                    </button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* STANDARD GENERATOR TAB */}
        <TabsContent value="standard">
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
            <ImageGenerator
              businessId={businessId}
              userId={userId}
              onImageGenerated={handleImageGenerated}
            />
          </div>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <ImageJobsList
              businessId={businessId}
              userId={userId}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </TabsContent>

        {/* <TabsContent value="test">
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
            <BrandImageGenerator
              businessId={businessId}
              userId={userId}
              onImageGenerated={handleImageGenerated}
            />
          </div>
        </TabsContent> */}

      </Tabs>
    </div>
  );
}
