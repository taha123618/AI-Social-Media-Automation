'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Image as ImageIcon, Search, Sparkles, Wand2, Film, FileImage, Library, Plus, Loader2
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  postText?: string;
  onSelectMedia: (files: File[]) => void;
  onGenerateAIImage: (prompt: string, size: string) => void;
}

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square (1:1) - Instagram, Facebook' },
  { id: '16:9', label: 'Landscape (16:9) - Twitter, LinkedIn' },
  { id: '9:16', label: 'Portrait (9:16) - Stories, TikTok' },
  { id: '4:3', label: 'Standard (4:3)' },
  { id: '3:4', label: 'Portrait (3:4) - Pinterest' },
];

export function AddMediaModal({
  isOpen,
  onClose,
  postText,
  onSelectMedia,
  onGenerateAIImage
}: AddMediaModalProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedLibraryImages, setSelectedLibraryImages] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setLoadingGallery(true);
        fetch('/api/gallery/images')
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) {
                    setGalleryImages(data);
                } else if (data.images && Array.isArray(data.images)) {
                    setGalleryImages(data.images);
                } else {
                    setGalleryImages([]);
                }
            })
            .catch(err => {
                console.error("Failed to load gallery images", err);
                setGalleryImages([]);
            })
            .finally(() => setLoadingGallery(false));
    } else {
        setSelectedLibraryImages([]);
    }
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onSelectMedia(Array.from(e.target.files));
      onClose();
    }
  };

  const toggleLibraryImage = (url: string) => {
    setSelectedLibraryImages(prev =>
          prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
      );
  };

  const handleAddLibraryMedia = async () => {
       // Convert library URLs back to Files to keep consistency with the component's expected onSelectMedia array.
       // In a real situation we might just pass URLs, but we'll adapt for now:
       try {
           const filePromises = selectedLibraryImages.map(async (url) => {
               const res = await fetch(url);
               const blob = await res.blob();
               const filename = url.split('/').pop() || 'gallery_image.png';
               return new File([blob], filename, { type: blob.type });
           });
           const files = await Promise.all(filePromises);
           onSelectMedia(files);
           onClose();
       } catch (err) {
           console.error("Failed to convert image urls to files", err);
       }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-background rounded-2xl shadow-2xl border">
        <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            Add Media
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Stock Photos
              </TabsTrigger>
              <TabsTrigger value="gifs" className="flex items-center gap-2">
                <Film className="w-4 h-4" />
                GIFs
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Image
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 py-6 min-h-[450px] max-h-[65vh] overflow-y-auto">
            <TabsContent value="upload" className="mt-0 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <label
                    className="flex flex-col items-center justify-center w-full py-16 border-2 border-dashed border-muted-foreground/30 rounded-2xl cursor-pointer hover:border-primary/50 transition-all duration-300 group relative overflow-hidden bg-muted/20"
                  >
                    <div className="flex flex-col items-center justify-center relative z-10">
                      <motion.div
                        className="mb-6 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Upload className="w-8 h-8 text-primary-foreground" />
                      </motion.div>
                      <p className="max-w-md text-center text-lg font-semibold mb-2">
                        Drag & drop your files here
                      </p>
                      <p className="text-sm font-medium text-primary mb-3">
                        or click to browse
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="secondary">JPG</Badge>
                        <Badge variant="secondary">PNG</Badge>
                        <Badge variant="secondary">GIF</Badge>
                        <Badge variant="secondary">MP4</Badge>
                      </div>
                    </div>
                    <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                  </label>
                </CardContent>
              </Card>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Library className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <CardTitle>Media Library</CardTitle>
                      {galleryImages.length > 0 && (
                        <Badge variant="secondary">
                          {galleryImages.length} items
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingGallery ? (
                      <div className="flex justify-center p-12">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                        />
                      </div>
                    ) : galleryImages.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center p-12 text-center"
                        >
                          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                            <FileImage className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium mb-2">No media in library yet</p>
                          <p className="text-sm text-muted-foreground">Upload some images to see them here</p>
                        </motion.div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          {galleryImages.map((img: any, i: number) => {
                            const isSelected = selectedLibraryImages.includes(img.url);
                            return (
                              <Card
                                key={i}
                                className={`cursor-pointer overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-lg'
                                  }`}
                                onClick={() => toggleLibraryImage(img.url)}
                              >
                                <div className="aspect-square relative">
                                        <Image src={img.url} alt={img.title || "Gallery image"} fill className="object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="absolute top-2 right-2">
                                    <motion.div
                                      className={`h-6 w-6 rounded-full border-2 border-background flex items-center justify-center transition-all shadow-lg ${isSelected ? 'bg-primary' : 'bg-black/40'
                                        }`}
                                      animate={{ scale: isSelected ? 1.1 : 1 }}
                                    >
                                      {isSelected && (
                                        <motion.div
                                          className="h-3 w-3 bg-primary-foreground rounded-full"
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ type: "spring", stiffness: 500 }}
                                        />
                                      )}
                                    </motion.div>
                                        </div>
                                    </div>
                                <CardContent className="p-2">
                                  <p className="text-xs font-medium truncate">
                                        {img.title || "image.png"}
                                  </p>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="stock" className="mt-0">
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardDescription className="font-medium mb-2">Stock Photos Coming Soon</CardDescription>
                  <p className="text-sm text-muted-foreground">Search millions of high-quality images</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gifs" className="mt-0">
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <Film className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardDescription className="font-medium mb-2">GIF Library Coming Soon</CardDescription>
                  <p className="text-sm text-muted-foreground">Browse trending GIFs and animations</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">AI Image Generation</CardTitle>
                  </div>
                  <CardDescription>
                    Describe the image you want AI to create for your post
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="ai-prompt">Describe your vision</Label>
                    <Textarea
                      id="ai-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="A futuristic workspace with holographic displays, neon lighting, cyberpunk aesthetic, cinematic composition..."
                      className="min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">Be specific about style, mood, and details for best results</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                    <Select value={selectedRatio} onValueChange={setSelectedRatio}>
                      <SelectTrigger id="aspect-ratio" className="w-full">
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.id} value={ratio.id}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => {
                        setIsGeneratingAI(true);
                        onGenerateAIImage(aiPrompt, selectedRatio);
                        // Reset loading state after a reasonable time
                        setTimeout(() => setIsGeneratingAI(false), 5000);
                      }}
                      className="w-full h-14"
                      disabled={!aiPrompt.trim() || isGeneratingAI}
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-5 w-5 mr-2" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer actions */}
        <AnimatePresence>
          {(selectedLibraryImages.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 border-t flex justify-between items-center bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <Badge variant="default" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                  {selectedLibraryImages.length}
                </Badge>
                <span className="text-sm font-medium">
                  {selectedLibraryImages.length} {selectedLibraryImages.length === 1 ? 'item' : 'items'} selected
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLibraryImages([])}
                >
                  Clear Selection
                </Button>
                <Button
                  onClick={handleAddLibraryMedia}
                >
                  Add Selected Media
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator />

        <div className="p-6 flex justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

