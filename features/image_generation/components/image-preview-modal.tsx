'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Download,
  Copy,
  Share2,
  Heart,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Info,
  Calendar,
  Palette,
  Monitor
} from 'lucide-react';

interface ImagePreviewModalProps {
  image: {
    id: string;
    prompt: string;
    imageUrl?: string | null;
    createdAt: string;
    status: string;
    style?: string;
    aspectRatio?: string;
    quality?: string;
    model?: string;
    variations?: number;
    thumbnailUrl?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export default function ImagePreviewModal({ image, isOpen, onClose, onDelete }: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  if (!isOpen || !image) return null;

  const handleDownload = () => {
    if (!image.imageUrl) return;
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `image-${image.id}.png`;
    link.click();
  };

  const handleCopyUrl = () => {
    if (!image.imageUrl) return;
    navigator.clipboard.writeText(image.imageUrl);
    // You could use a toast notification here instead of alert
    alert('Image URL copied to clipboard!');
  };

  const handleShare = async () => {
    if (!image.imageUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: image.prompt,
          url: image.imageUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyUrl();
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => prev + 90);
  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModelIcon = (model?: string) => {
    if (!model) return null;
    const m = model.toLowerCase();
    if (m.includes('dall-e') || m.includes('openai'))
      return <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-600 uppercase tracking-tight">OpenAI</div>;
    if (m.includes('stable-diffusion') || m.includes('stability'))
      return <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-600 uppercase tracking-tight">Stability</div>;
    if (m.includes('google') || m.includes('gemini') || m.includes('banana'))
      return <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-600 uppercase tracking-tight">Google</div>;
    if (m.includes('flux'))
      return <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-600 uppercase tracking-tight">Flux</div>;
    if (m.includes('ideogram'))
      return <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-pink-500/10 border border-pink-500/20 text-[10px] font-bold text-pink-600 uppercase tracking-tight">Ideogram</div>;
    return <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{model}</div>;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-card border border-border/50 rounded-3xl max-w-7xl max-h-full overflow-hidden w-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Image Preview</h2>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg ${getStatusColor(image.status)} shadow-sm border border-current opacity-80`}>
                {image.status}
              </span>
              {getModelIcon(image.model)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Toggle Info"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:row h-full min-h-0 overflow-hidden">
          {/* Image Display Area */}
          <div className="flex-1 bg-muted/20 relative overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {image.imageUrl ? (
                  <div className="relative group/img shadow-2xl rounded-2xl overflow-hidden bg-muted/10 ring-1 ring-border/50">
                    <Image
                      src={image.imageUrl}
                      alt={image.prompt}
                      width={1200}
                      height={1200}
                      className="max-w-full max-h-[70vh] object-contain transition-transform duration-500"
                      fill
                      preload
                      sizes="(max-width: 1024px) 100vw, 70vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                ) : (
                  <div className="relative shadow-2xl rounded-2xl overflow-hidden bg-muted/10 ring-1 ring-border/50 w-full max-w-sm aspect-square flex flex-col items-center justify-center text-muted-foreground">
                    <Monitor className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium">
                      {image.status === 'failed' ? 'Image generation failed' : 'Image is processing...'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Zoom Controls */}
            {image.imageUrl && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl p-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="h-4 w-[1px] bg-border/50 mx-1" />
                <span className="text-[11px] font-bold text-muted-foreground min-w-[45px] text-center font-mono">
                  {Math.round(zoom * 100)}%
                </span>
                <div className="h-4 w-[1px] bg-border/50 mx-1" />
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all ml-1"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={resetTransform}
                  className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all ml-1"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Like Button */}
            {image.imageUrl && (
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`absolute top-6 right-6 p-3 rounded-2xl shadow-xl transition-all transform hover:scale-110 active:scale-95 border ${isLiked
                  ? 'bg-red-500 border-red-400 text-white'
                  : 'bg-background/80 border-border/50 text-muted-foreground backdrop-blur-md hover:text-red-500'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
              </button>
            )}
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="w-full lg:w-96 bg-white border-l overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Prompt */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Prompt
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{image.prompt}</p>
                </div>

                {/* Generation Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Generation Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Model</span>
                      <span className="font-medium text-gray-900">{image.model || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Style</span>
                      <span className="font-medium text-gray-900 capitalize">{image.style || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Aspect Ratio</span>
                      <span className="font-medium text-gray-900">{image.aspectRatio || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Quality</span>
                      <span className="font-medium text-gray-900 capitalize">{image.quality || 'N/A'}</span>
                    </div>
                    {image.variations && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Variations</span>
                        <span className="font-medium text-gray-900">{image.variations}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created
                      </span>
                      <span className="font-medium text-gray-900">
                        {new Date(image.createdAt).toLocaleDateString()} at {new Date(image.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
                  <div className="space-y-2">
                    {image.imageUrl && (
                      <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                      >
                        <Download className="w-4 h-4" />
                        Download Image
                      </button>
                    )}

                    {image.imageUrl && (
                      <button
                        onClick={handleCopyUrl}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
                      >
                        <Copy className="w-4 h-4" />
                        Copy URL
                      </button>
                    )}

                    {image.imageUrl && (
                      <button
                        onClick={handleShare}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this image?')) {
                            onDelete(image.id);
                            onClose();
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
                      >
                        <X className="w-4 h-4" />
                        Delete Image
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div>ID: {image.id}</div>
                  {image.imageUrl && (
                    <div className="break-all">
                      URL: {image.imageUrl.substring(0, 50)}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
