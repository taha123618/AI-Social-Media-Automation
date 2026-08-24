"use client";

import { useState, useCallback } from "react";
import { ImageOff, RefreshCw, Sparkles } from "lucide-react";
import type { ImageRecord, ImageAspectRatio, ImageStyle } from "../../types/blog-image.types";

const ASPECT_CLASSES: Record<ImageAspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
};

const STYLE_CLASSES: Record<ImageStyle, string> = {
  standard: "rounded-xl shadow-lg border border-border/50",
  hero: "rounded-none shadow-xl w-full",
  wide: "rounded-xl shadow-lg -mx-4 sm:-mx-6 lg:-mx-8 max-w-none",
  inline: "rounded-lg shadow-md",
};

interface ContextImageProps {
  image: ImageRecord | null;
  alt: string;
  aspectRatio?: ImageAspectRatio;
  imageStyle?: ImageStyle;
  priority?: boolean;
  loading?: boolean;
  onRetry?: () => void;
  className?: string;
}

function SkeletonPulse({ aspectClass, styleClass }: { aspectClass: string; styleClass: string }) {
  return (
    <div className={`relative overflow-hidden ${aspectClass} ${styleClass} bg-slate-800/60`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent animate-pulse" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <Sparkles className="h-6 w-6 text-slate-600" />
        <div className="flex flex-col items-center gap-1">
          <div className="h-2 w-24 rounded bg-slate-700/60 animate-pulse" />
          <div className="h-1.5 w-16 rounded bg-slate-700/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ContextImage({
  image,
  alt,
  aspectRatio = "16:9",
  imageStyle = "standard",
  priority = false,
  loading = false,
  onRetry,
  className = "",
}: ContextImageProps) {
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">(
    image ? "loading" : "error",
  );
  const [retryCount, setRetryCount] = useState(0);

  const handleLoad = useCallback(() => setLoadState("loaded"), []);
  const handleError = useCallback(() => setLoadState("error"), []);

  const handleRetry = useCallback(() => {
    if (!image) return;
    setLoadState("loading");
    setRetryCount((c) => c + 1);
    onRetry?.();
    const img = new Image();
    img.src = image.url;
    img.onload = () => setLoadState("loaded");
    img.onerror = () => setLoadState("error");
  }, [image, onRetry]);

  const aspectClass = ASPECT_CLASSES[aspectRatio];
  const styleClass = STYLE_CLASSES[imageStyle];

  if (!image) {
    return (
      <figure className={`blog-context-image-wrap relative ${aspectClass} ${styleClass} bg-slate-900/40 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">No image available</span>
        </div>
      </figure>
    );
  }

  return (
    <figure className={`blog-context-image-wrap relative ${className}`} style={{ margin: "1.5rem 0" }}>
      <div className={`relative overflow-hidden ${aspectClass} ${styleClass} bg-slate-900/40`}>
        {loading ? (
          <SkeletonPulse aspectClass={aspectClass} styleClass={styleClass} />
        ) : loadState === "loading" ? (
          <SkeletonPulse aspectClass={aspectClass} styleClass={styleClass} />
        ) : loadState === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <ImageOff className="h-8 w-8 text-red-400" />
            <span className="text-xs text-slate-400">Failed to load</span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        ) : null}

        {loadState !== "error" && (
          <img
            key={retryCount}
            src={image.url}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              loadState === "loaded" && !loading ? "opacity-100" : "opacity-0"
            }`}
            style={{ position: "absolute", inset: 0 }}
          />
        )}
      </div>

      {image.source === "ai-generated" && (
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <Sparkles className="h-2.5 w-2.5 text-violet-500/50" />
          <span className="text-[9px] text-slate-600/50">AI-generated</span>
        </div>
      )}

      <figcaption
        style={{
          fontSize: "0.8rem",
          color: "#6b7280",
          textAlign: "center",
          marginTop: "0.375rem",
          fontStyle: "italic",
        }}
      >
        {alt}
      </figcaption>
    </figure>
  );
}
