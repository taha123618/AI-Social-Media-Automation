"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
   Sparkles,
   RotateCcw,
   CheckCircle,
   Brain,
   Layers,
   Clapperboard,
   Users,
   Target,
   Zap,
   Play,
   Clock,
   ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { VideoGenerator } from "./video-generator";
import { VideoJobsList } from "./video-jobs-list";
import { useGenerateRagVideo } from "../hooks/use-video";
import { BrandTone } from "../types";


interface RagVideoDashboardProps {
   businessId: string;
}

const CONTENT_TYPES = [
   { value: "product demo", label: "Product Demo", icon: "📦" },
   { value: "customer testimonial", label: "Customer Testimonial", icon: "💬" },
   { value: "explainer video", label: "Explainer Video", icon: "💡" },
   { value: "behind the scenes", label: "Behind the Scenes", icon: "🎥" },
   { value: "team introduction", label: "Team Introduction", icon: "👥" },
   { value: "service showcase", label: "Service Showcase", icon: "✨" },
   { value: "company culture", label: "Company Culture", icon: "🏢" },
   { value: "event highlight", label: "Event Highlight", icon: "🎉" },
   { value: "tutorial", label: "Tutorial", icon: "📚" },
   { value: "announcement", label: "Announcement", icon: "📣" },
];

const PIPELINE_STEPS = [
   {
      num: "01",
      icon: Brain,
      title: "Vector Knowledge Retrieval",
      desc: "Sync with your brand assets, mission statements, and visual guidelines to establish creative boundaries.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
   },
   {
      num: "02",
      icon: Layers,
      title: "Brand DNA Extraction",
      desc: "AI synthesizes a creative brief ensuring every pixel reflects your unique brand identity and values.",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
   },
   {
      num: "03",
      icon: Clapperboard,
      title: "Cinematic Simulation",
      desc: "RunwayML renders the finalized cinematic sequence using generative visual physics and brand DNA.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
   },
];

export function RagVideoDashboard({ businessId }: RagVideoDashboardProps) {
   const [activeTab, setActiveTab] = useState("generator");
   const [contentType, setContentType] = useState("product demo");
   const [targetAudience, setTargetAudience] = useState("");
   const [tone, setTone] = useState<keyof typeof BrandTone>("PROFESSIONAL");

   const [platform, setPlatform] = useState("instagram");
   const [duration, setDuration] = useState(6);
   const [quality, setQuality] = useState("standard");
   const [model, setModel] = useState("gen4.5");
   const [customInstructions, setCustomInstructions] = useState("");
   const [generatedJob, setGeneratedJob] = useState<{
      jobId: string;
      status: string;
      brandContextUsed: string;
      generatedPrompt: string;
   } | null>(null);

   const { mutate: generateRagVideo, isPending: isGenerating } = useGenerateRagVideo(businessId);

   const handleRagGenerate = (e: React.FormEvent) => {
      e.preventDefault();
      generateRagVideo(
         { contentType, targetAudience: targetAudience || undefined, tone, platform, duration, quality, model, customInstructions: customInstructions || undefined },
         {
            onSuccess: (data) => {
               setGeneratedJob(data as any);
               toast.success(
                  <div className="space-y-1">
                     <div className="font-medium text-emerald-500">Brand Intelligence active!</div>
                     <div className="text-xs opacity-70 font-mono">ID: {data.jobId}</div>
                  </div>
               );
               setActiveTab("jobs");
            },
            onError: (err: any) => {
               const errorData = err.response?.data;
               if (errorData?.type === 'CREDIT_ERROR') {
                  toast.error(
                     <div className="space-y-2">
                        <div className="font-semibold text-amber-600"> Insufficient Credits</div>
                        <div className="text-sm text-muted-foreground">
                           Your Runway account doesn't have enough credits to generate this video.
                        </div>
                        {errorData?.creditsInfo && (
                           <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                              Credits: {errorData.creditsInfo.currentCredits} / {errorData.creditsInfo.requiredCredits} required
                           </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                           Please add credits to your Runway account and try again.
                        </div>
                        {errorData?.docUrl && (
                           <a
                              href={errorData.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline block"
                           >
                              View Documentation
                           </a>
                        )}
                     </div>,
                     { duration: 8000 }
                  );
               } else {
                  toast.error(
                     <div className="space-y-1">
                        <div className="font-medium">Generation Failed</div>
                        <div className="text-sm text-muted-foreground">
                           {errorData?.error || err.message || "Failed to start brand-aware video generation"}
                        </div>
                     </div>
                  );
               }
            },
         }
      );
   };

   const handleReset = () => {
      setContentType("product demo");
      setTargetAudience("");
      setTone("PROFESSIONAL");
      setPlatform("instagram");
      setDuration(6);
      setQuality("standard");
      setModel("gen4.5");
      setCustomInstructions("");
   };

   return (
      <div className="container mx-auto py-10 space-y-10">
         {/* Hero Header */}
         <div className="text-center space-y-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/20 text-primary text-xs font-semibold backdrop-blur-sm">
               <Sparkles className="h-3.5 w-3.5" />
               Next-Gen Brand Intelligence
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/80 to-foreground/40 bg-clip-text text-transparent">
               AI Video Suite
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
               Transform your brand DNA into cinematic video content using our proprietary RAG pipeline and RunwayML.
            </p>
         </div>

         {/* Main Tabs */}
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-in fade-in duration-700 delay-150">
            <div className="flex justify-center mb-8">
               <TabsList className="cursor-pointer grid grid-cols-3 w-full max-w-md bg-card border border-muted/30 shadow-lg h-12 p-1 rounded-xl">
                  <TabsTrigger value="generator" className="cursor-pointer rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
                     <Sparkles className="h-4 w-4 mr-2" /> Smart Gen
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="cursor-pointer rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
                     <Play className="h-4 w-4 mr-2" /> Manual
                  </TabsTrigger>
                  <TabsTrigger value="jobs" className="cursor-pointer rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all">
                     <Clock className="h-4 w-4 mr-2" /> History
                  </TabsTrigger>
               </TabsList>
            </div>

            {/* SMART GENERATOR TAB */}
            <TabsContent value="generator">
               <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* ── LEFT: Form Card ── */}
                  <div className="lg:col-span-2 space-y-0">
                     <Card className="relative overflow-hidden border-border bg-card shadow-2xl rounded-2xl">
                        {/* Top accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-primary via-purple-500 to-emerald-500" />

                        <CardHeader className="pb-2 pt-8 px-8">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                 <Sparkles className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                 <CardTitle className="text-xl font-bold">Brand-Aware Video</CardTitle>
                                 <p className="text-sm text-muted-foreground mt-0.5">Configure your creative intent — our AI handles brand alignment</p>
                              </div>
                           </div>
                        </CardHeader>

                        <CardContent className="px-8 pb-8">
                           <form onSubmit={handleRagGenerate} className="space-y-8 mt-4">

                              {/* Row 1: Content Type + Tone */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start ">
                                 <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                                       <Layers className="w-4 h-4 text-primary" /> Content Archetype
                                    </Label>
                                    <Select value={contentType} onValueChange={setContentType}>
                                       <SelectTrigger className="h-12 bg-muted border-border hover:border-primary/60 transition-colors rounded-xl shadow-sm">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent className="rounded-xl shadow-xl border-muted/30">
                                          {CONTENT_TYPES.map((ct) => (
                                             <SelectItem key={ct.value} value={ct.value} className="font-medium py-2.5">
                                                <div className="flex items-center gap-3">
                                                   <span>{ct.icon}</span> {ct.label}
                                                </div>
                                             </SelectItem>
                                          ))}
                                       </SelectContent>
                                    </Select>
                                 </div>

                                 <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                                       <Zap className="w-4 h-4 text-amber-400" /> Brand Resonance (Tone)
                                    </Label>
                                    <Select value={tone} onValueChange={(val) => setTone(val as keyof typeof BrandTone)}>

                                       <SelectTrigger className="h-12 bg-muted border-border hover:border-primary/60 transition-colors rounded-xl shadow-sm">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent className="rounded-xl shadow-xl border-muted/30">
                                          <SelectItem value="PROFESSIONAL" className="py-2.5">💼 Professional / Elite</SelectItem>
                                          <SelectItem value="FRIENDLY" className="py-2.5">😊 Friendly / Relatable</SelectItem>
                                          <SelectItem value="CREATIVE" className="py-2.5">🎨 Creative / Bold</SelectItem>
                                          <SelectItem value="TECHNICAL" className="py-2.5">⚙️ Technical / Precise</SelectItem>
                                          <SelectItem value="LUXURY" className="py-2.5">💎 Luxury / Refined</SelectItem>
                                          <SelectItem value="CASUAL" className="py-2.5">✌️ Casual / Trendy</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>

                              {/* Row 2: Target Persona + Engine Model */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                 <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                                       <Users className="w-4 h-4 text-blue-400" /> Target Persona
                                       <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                                    </Label>
                                    <Input
                                       placeholder="e.g. Millennial entrepreneurs aged 25–35..."
                                       className="w-full h-12 bg-muted border-border hover:border-primary/60 transition-colors rounded-xl shadow-sm"
                                       value={targetAudience}
                                       onChange={(e) => setTargetAudience(e.target.value)}
                                    />
                                 </div>

                                 <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                                       <Clapperboard className="w-4 h-4 text-purple-400" /> Engine Model
                                    </Label>
                                    <Select value={model} onValueChange={setModel}>
                                       <SelectTrigger className="h-12 bg-muted border-border hover:border-primary/60 transition-colors rounded-xl shadow-sm">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent className="rounded-xl shadow-xl border-muted/30">
                                          <SelectItem value="gen4.5" className="py-2.5">🏆 Runway Gen-4.5 (Premium)</SelectItem>
                                          <SelectItem value="gen4_turbo" className="py-2.5">⚡ Runway Gen-4 Turbo (Fast)</SelectItem>
                                          <SelectItem value="gen4_aleph" className="py-2.5">⚡ Runway Gen-4 Aleph (Fast)</SelectItem>
                                          <SelectItem value="act_two" className="py-2.5">⚡ Runway Act Two (Fast)</SelectItem>
                                          <SelectItem value="veo3" className="py-2.5">🔮 Google Veo 3</SelectItem>
                                          <SelectItem value="veo3.1" className="py-2.5">🎬 Google Veo 3.1 (High Fidelity)</SelectItem>
                                          <SelectItem value="veo3.1_fast" className="py-2.5">💨 Google Veo 3.1 (Fast)</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>

                              {/* Row 3: Channel + Duration Slider + Quality */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                 <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                                       <Target className="w-4 h-4 text-emerald-400" /> Channel Target
                                    </Label>
                                    <Select value={platform} onValueChange={setPlatform}>
                                       <SelectTrigger className="h-12 bg-muted border-border hover:border-primary/60 transition-colors rounded-xl shadow-sm">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent className="rounded-xl shadow-xl border-muted/30">
                                          <SelectItem value="instagram" className="py-2.5">📸 Instagram (Reels/Post)</SelectItem>
                                          <SelectItem value="tiktok" className="py-2.5">🎵 TikTok (Vertical)</SelectItem>
                                          <SelectItem value="youtube" className="py-2.5">▶️ YouTube (Landscape)</SelectItem>
                                          <SelectItem value="linkedin" className="py-2.5">💼 LinkedIn (Professional)</SelectItem>
                                          <SelectItem value="facebook" className="py-2.5">👥 Facebook (Social)</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>

                                 <div className="space-y-3">
                                    <Label className="text-sm font-bold text-foreground/90">
                                       Timeline: <span className="text-primary font-semibold">~ {duration}s</span>
                                    </Label>
                                    <div className="pt-2 pb-1">
                                       <Slider
                                          value={[duration]}
                                          max={60}
                                          min={1}
                                          step={1}
                                          onValueChange={(val) => setDuration(val[0])}
                                          className="w-full"
                                       />
                                       <div className="flex justify-between text-[11px] font-medium text-muted-foreground mt-2 px-0.5">
                                          <span>1s</span>
                                          <span>30s</span>
                                          <span>60s</span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground/90">Visual Fidelity</Label>
                                    <Select value={quality} onValueChange={setQuality}>
                                       <SelectTrigger className="h-12 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent className="rounded-xl shadow-xl border-muted/30">
                                          <SelectItem value="standard" className="py-2.5">🎞️ Standard (1080p)</SelectItem>
                                          <SelectItem value="hd" className="py-2.5">🔷 Ultra HD</SelectItem>
                                          <SelectItem value="4k" className="py-2.5">💎 Cinematic 4K</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>

                              {/* Creative Directives */}
                              <div className="space-y-2">
                                 <Label className="text-sm font-bold text-foreground/90">Creative Directives</Label>
                                 <Textarea
                                    placeholder="Add visual nuances, specific product focus, motion requirements, colour palette preferences..."
                                    className="bg-muted border-border hover:border-primary/60 focus-visible:ring-primary/30 transition-colors rounded-xl min-h-[100px] resize-none"
                                    value={customInstructions}
                                    onChange={(e) => setCustomInstructions(e.target.value)}
                                 />
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-4 pt-2">
                                 <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    className="h-12 px-6 rounded-xl border-muted/50 hover:border-primary/40 hover:bg-muted/20 transition-colors font-semibold"
                                 >
                                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                                 </Button>
                                 <Button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
                                 >
                                    {isGenerating ? (
                                       <><RotateCcw className="mr-2 h-5 w-5 animate-spin" /> Synthesizing Brand Context...</>
                                    ) : (
                                       <><Sparkles className="mr-2 h-5 w-5" /> Initiate Brand-Aware Generation</>
                                    )}
                                 </Button>
                              </div>

                           </form>
                        </CardContent>
                     </Card>
                  </div>

                  {/* ── RIGHT: Pipeline + Result ── */}
                  <div className="space-y-6">
                     {/* Intelligence Pipeline */}
                     <Card className="relative overflow-hidden border-border bg-card shadow-xl rounded-2xl">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
                        <CardHeader className="pt-7 px-6 pb-4">
                           <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Intelligence Pipeline</CardTitle>
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
                              <span className="text-[11px] text-muted-foreground">RAG v2.1</span>
                           </div>
                        </CardContent>
                     </Card>

                     {/* Success card after generation */}
                     {generatedJob && (
                        <Card className="relative overflow-hidden border-emerald-500/30 bg-emerald-500/5 shadow-lg animate-in fade-in zoom-in-95 duration-500 rounded-2xl">
                           <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-500" />
                           <CardHeader className="pt-6 px-6 pb-3">
                              <CardTitle className="text-emerald-500 flex items-center gap-2 text-sm font-bold">
                                 <CheckCircle className="h-5 w-5" /> Generation Active
                              </CardTitle>
                           </CardHeader>
                           <CardContent className="px-6 pb-6 space-y-4">
                              <div>
                                 <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Job ID</span>
                                 <div className="text-xs font-mono mt-1 truncate">{generatedJob.jobId}</div>
                              </div>
                              {generatedJob.brandContextUsed && (
                                 <div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Brand Context Used</span>
                                    <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed mt-1">{generatedJob.brandContextUsed}</p>
                                 </div>
                              )}
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setActiveTab("jobs")}
                                 className="w-full h-9 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-semibold"
                              >
                                 View Progress <ArrowRight className="ml-2 h-3 w-3" />
                              </Button>
                           </CardContent>
                        </Card>
                     )}
                  </div>

               </div>
            </TabsContent>

            {/* MANUAL TAB */}
            <TabsContent value="manual">
               <div className="animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
                  <VideoGenerator businessId={businessId} />
               </div>
            </TabsContent>

            {/* JOBS TAB */}
            <TabsContent value="jobs">
               <div className="animate-in fade-in slide-in-from-left-4 duration-500 ease-out">
                  <VideoJobsList businessId={businessId} />
               </div>
            </TabsContent>
         </Tabs>
      </div>
   );
}