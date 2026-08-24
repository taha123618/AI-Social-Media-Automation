"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles,
  RotateCcw,
  Palette,
  Layers,
  Layout,
  Type,
  Component,
  Zap,
  Plus,
  X,
  Camera,
  Layers3,
  Coins
} from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { PREDEFINED_BRANDS, createBrandPrompt, type BrandConfig } from '@/features/image_generation/utils/image-helpers';
import type { ImageGenerationResponse } from '../types';

interface BrandImageGeneratorProps {
  businessId: string;
  userId?: string;
  onImageGenerated?: (result: ImageGenerationResponse) => void;
}

const PLATFORM_ARCHETYPES: Array<{ id: string; name: string; aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:2' | '2:3' | '3:4' | '4:5' | '5:4'; description: string; icon: React.ReactNode }> = [
  { id: 'custom', name: 'Custom', aspectRatio: '1:1', description: 'General Purpose', icon: <Component className="w-4 h-4" /> },
  { id: 'facebook-post', name: 'Facebook Post', aspectRatio: '1:1', description: 'Standard Feed', icon: <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px] bg-blue-600 text-white rounded-sm">f</div> },
  { id: 'facebook-ad', name: 'Facebook Ad', aspectRatio: '1:1', description: 'Optimized for Ads', icon: <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px] bg-blue-700 text-white rounded-sm">f</div> },
  { id: 'facebook-cover', name: 'Facebook Cover', aspectRatio: '16:9', description: 'Page Header', icon: <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px] bg-blue-800 text-white rounded-sm">f</div> },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', aspectRatio: '16:9', description: 'Video Preview', icon: <div className="w-4 h-4 flex items-center justify-center text-red-600"><Layers className="w-4 h-4" /></div> },
  { id: 'youtube-banner', name: 'YouTube Banner', aspectRatio: '16:9', description: 'Channel Art', icon: <div className="w-4 h-4 flex items-center justify-center text-red-700"><Layers className="w-4 h-4" /></div> },
  { id: 'youtube-shorts', name: 'YouTube Shorts', aspectRatio: '9:16', description: 'Vertical Content', icon: <div className="w-4 h-4 flex items-center justify-center text-red-500"><Layers className="w-4 h-4" /></div> },
  { id: 'instagram-post', name: 'Instagram Post', aspectRatio: '1:1', description: 'Square Feed', icon: <div className="w-4 h-4 flex items-center justify-center text-pink-600"><Camera className="w-4 h-4" /></div> },
  { id: 'instagram-story', name: 'Instagram Story', aspectRatio: '9:16', description: 'Full Screen', icon: <div className="w-4 h-4 flex items-center justify-center text-pink-500"><Camera className="w-4 h-4" /></div> },
  { id: 'z-fold-brochure', name: 'Z-Fold Brochure', aspectRatio: '9:16', description: 'Triple Fold', icon: <div className="w-4 h-4 flex items-center justify-center text-orange-500 text-[10px] font-bold">Z</div> },
  { id: 'brochure', name: 'Brochure', aspectRatio: '2:3', description: 'Print Ready', icon: <Layers className="w-4 h-4" /> },
  { id: 'poster', name: 'Poster', aspectRatio: '2:3', description: 'Display Size', icon: <Layout className="w-4 h-4" /> },
  { id: 'banner', name: 'Banner', aspectRatio: '16:9', description: 'Web Banner', icon: <Layout className="w-4 h-4" /> },
  { id: 'cards', name: 'Cards', aspectRatio: '1:1', description: 'Business Cards', icon: <div className="w-4 h-4 flex items-center justify-center text-indigo-500 font-bold text-[10px]">C</div> },
];

export default function BrandImageGenerator({ businessId, userId, onImageGenerated }: BrandImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<BrandConfig>(PREDEFINED_BRANDS[0]);
  const [selectedImageType, setSelectedImageType] = useState('facebook-post');
  const [primaryColor, setPrimaryColor] = useState(PREDEFINED_BRANDS[0].colors[0]);
  const [secondaryColor, setSecondaryColor] = useState('');
  const [showSecondaryColor, setShowSecondaryColor] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('runway-gen4-image');
  const [selectedQuality, setSelectedQuality] = useState<'standard' | 'hd' | 'ultra'>('standard');
  const [variations, setVariations] = useState(1);
  const [referenceImage, setReferenceImage] = useState<string>('');

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a creative direction');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Synthesizing Brand Identity...");

    try {
      const brandPrompt = createBrandPrompt(
        prompt.trim(),
        selectedBrand,
        selectedImageType,
        primaryColor || undefined,
        secondaryColor || undefined
      );

      const platform = PLATFORM_ARCHETYPES.find(p => p.id === selectedImageType);
      const aspectRatio = platform?.aspectRatio || '1:1';

      const styleMap: Record<string, 'realistic' | 'artistic' | 'cinematic' | 'anime' | 'cartoon' | '3d'> = {
        'professional': 'realistic',
        'artistic': 'artistic',
        'minimal': 'artistic',
        'natural': 'realistic',
        'elegant': 'cinematic'
      };

      const mappedStyle = styleMap[selectedBrand.style] || 'realistic';

      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: businessId,
          userId: userId,
          prompt: brandPrompt,
          style: mappedStyle,
          aspectRatio,
          quality: selectedQuality,
          model: selectedModel === 'google-nano-banana' ? 'google-nano' : selectedModel,
          variations,
          referenceImage: referenceImage || undefined,
          colors: [primaryColor, secondaryColor].filter(Boolean)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image');
      }

      toast.success("Image generated successfully!", { id: loadingToast });
      onImageGenerated?.(result);

      // Log activity
      await fetch('/api/system/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'GENERATE_BRAND_IMAGE',
          entityType: 'IMAGE',
          entityId: result.jobId,
          details: {
            brand: selectedBrand.name,
            model: selectedModel,
            aspectRatio
          }
        }),
      });

    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image", { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setSelectedBrand(PREDEFINED_BRANDS[0]);
    setPrimaryColor(PREDEFINED_BRANDS[0].colors[0]);
    setSecondaryColor('');
    setShowSecondaryColor(false);
    setSelectedImageType('facebook-post');
    setSelectedModel('runway-gen4-image');
  };

  return (
    <Card className="bg-background/40 backdrop-blur-xl border-muted/30 shadow-2xl overflow-hidden group">
      <CardHeader className="pb-4 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-600 opacity-80" />
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          Brand Image Synthesis
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          Intelligent RAG-powered image generation mapped to your brand DNA.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateImage} className="space-y-6">
          {/* Row 1: Brand & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" /> Brand Focus
              </Label>
              <Select value={selectedBrand.id} onValueChange={(val) => {
                const brand = PREDEFINED_BRANDS.find(b => b.id === val);
                if (brand) {
                  setSelectedBrand(brand);
                  setPrimaryColor(brand.colors[0]);
                }
              }}>
                <SelectTrigger className="h-12 bg-muted border-border hover:border-primary/60 transition-colors rounded-xl shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-muted/30">
                  {PREDEFINED_BRANDS.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id} className="py-2.5 font-medium">
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Intelligence Model
              </Label>
              <Select value={selectedModel} onValueChange={(val: string) => setSelectedModel(val)}>
                <SelectTrigger className="h-12 bg-muted border-border hover:border-primary/60 transition-colors rounded-xl shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-muted/30">
                  <SelectItem value="runway-gen4-image" className="py-2.5 font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">Runway Gen-4</span>
                      <span className="text-[10px] text-muted-foreground opacity-70">Best for Professional Brand Visuals</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="runway-gen4-image-turbo" className="py-2.5 font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">Runway Gen-4 Turbo</span>
                      <span className="text-[10px] text-muted-foreground opacity-70">Lightning Fast Synthesis</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini_2.5_flash" className="py-2.5 font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">Gemini 2.5 Flash</span>
                      <span className="text-[10px] text-muted-foreground opacity-70">High-Fidelity Detail</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="openai" className="py-2.5 font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">OpenAI DALL-E 3</span>
                      <span className="text-[10px] text-muted-foreground opacity-70">Accurate Texts & Visuals</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Platform Archetype & Quality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                <Layout className="w-4 h-4 text-blue-400" /> Platform Archetype
              </Label>
              <Select value={selectedImageType} onValueChange={setSelectedImageType}>
                <SelectTrigger className="h-12 bg-muted border-border hover:border-primary/60 transition-colors rounded-xl shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-muted/30">
                  {PLATFORM_ARCHETYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="py-2.5 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="text-primary/70">{type.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-sm">{type.name}</span>
                          <span className="text-[10px] text-muted-foreground opacity-70 leading-none">{type.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" /> Quality Level
              </Label>
              <Select value={selectedQuality} onValueChange={(val: 'standard' | 'hd' | 'ultra') => setSelectedQuality(val)}>
                <SelectTrigger className="h-12 bg-muted border-border hover:border-primary/60 transition-colors rounded-xl shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-muted/30">
                  <SelectItem value="standard" className="py-2.5 font-medium">Standard (Fast)</SelectItem>
                  <SelectItem value="hd" className="py-2.5 font-medium">High Definition</SelectItem>
                  <SelectItem value="ultra" className="py-2.5 font-medium">Ultra HD (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" /> Primary Color Override
              </Label>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={primaryColor || "#000000"}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none bg-muted outline-none ring-0 p-0"
                  />
                </div>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="Primary Color (Hex)"
                  className="flex-1 h-12 px-4 bg-muted border border-border hover:border-primary/60 rounded-xl transition-colors font-mono text-sm"
                />
              </div>
              {!showSecondaryColor && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecondaryColor(true)}
                  className="text-[11px] h-7 px-2 text-primary/70 hover:text-primary hover:bg-primary/5 rounded-lg flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" /> Add Secondary Color
                </Button>
              )}
            </div>

            {showSecondaryColor && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" /> Secondary Color Override
                </Label>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={secondaryColor || "#FFFFFF"}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer border-none bg-muted outline-none ring-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="Secondary Color (Hex)"
                    className="flex-1 h-12 px-4 bg-muted border border-border hover:border-primary/60 rounded-xl transition-colors font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowSecondaryColor(false);
                      setSecondaryColor('');
                    }}
                    className="h-12 w-12 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Creative Directive */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-400" /> Creative Directive
            </Label>
            <Textarea
              placeholder="Describe the image concept, mood, and specific brand nuances you want captured..."
              className="bg-muted border-border hover:border-primary/60 focus-visible:ring-primary/30 transition-colors rounded-xl min-h-[120px] resize-none p-4 text-base"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.substring(0, 3000))}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">{prompt.length}/3000 characters</span>
              {prompt.length > 2700 && (
                <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider animate-pulse">Limit approaching</span>
              )}
            </div>
          </div>

          {/* Reference Image Section */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" /> Reference Image (Optional)
            </Label>
            <div className="bg-muted/30 border border-dashed border-muted/80 rounded-2xl p-4 hover:border-primary/50 transition-all duration-300">
              <ImageUpload
                onImageUploaded={setReferenceImage}
                currentImage={referenceImage}
                onImageRemove={() => setReferenceImage("")}
                folder="brand-references"
                businessId={businessId}
                userId={userId}
              />
              <p className="text-[11px] text-muted-foreground/70 mt-3 text-center">
                Supports JPEG, PNG, GIF, WebP • Max 10MB
              </p>
            </div>
          </div>

          {/* Variations & Cost Info */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end p-5 bg-muted/20 rounded-2xl border border-muted/40 shadow-inner">
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                  <Layers3 className="w-4 h-4 text-indigo-400" /> Variations: <span className="text-primary font-bold">{variations}</span>
                </Label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setVariations(num)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${variations === num
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative px-2">
                <Slider
                  value={[variations]}
                  max={4}
                  min={1}
                  step={1}
                  onValueChange={(val) => setVariations(val[0])}
                  className="w-full py-4"
                />
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground/60 px-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                </div>
              </div>
            </div>

            <div className="bg-background/60 backdrop-blur-sm p-4 rounded-xl border border-muted/50 flex flex-col items-center md:items-end justify-center min-w-[160px]">
              <div className="flex items-center gap-2 mb-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Est. Cost</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">{variations}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{variations === 1 ? 'Credit' : 'Credits'}</span>
              </div>
              <Badge variant="secondary" className="mt-2 text-[9px] h-5 uppercase font-bold tracking-tighter bg-muted/80 border-muted/30">
                {selectedQuality} Quality
              </Badge>
            </div>
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
              disabled={isGenerating || !prompt.trim()}
              className="flex-1 h-12 rounded-xl bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {isGenerating ? (
                <><RotateCcw className="mr-2 h-5 w-5 animate-spin" /> Synthesizing Brand Context...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Initiate Visual Synthesis</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
