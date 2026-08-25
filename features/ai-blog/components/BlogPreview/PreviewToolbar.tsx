"use client";

import { useState } from "react";
import {
  ImageIcon, Smartphone, Tablet, Monitor,
  Loader2, RefreshCw, CheckCircle2, AlertCircle,
  Layers, Crop,
} from "lucide-react";
import type { ImageRecord, ImageAspectRatio } from "../../types/blog-image.types";

export type PreviewDevice = "mobile" | "tablet" | "desktop";

interface PreviewToolbarProps {
  enableImages: boolean;
  onToggleImages: (enabled: boolean) => void;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  imageCount?: number;
  imageLoading?: boolean;
  imageError?: string | null;
  onRefreshImages?: () => void;
  sectionCount?: number;
  aspectRatio?: ImageAspectRatio;
  onAspectRatioChange?: (ratio: ImageAspectRatio) => void;
  enableOverlay?: boolean;
  onToggleOverlay?: (enabled: boolean) => void;
  availableProviders?: string[];
}

const ASPECT_OPTIONS: { value: ImageAspectRatio; label: string }[] = [
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "3:2", label: "3:2" },
  { value: "1:1", label: "1:1" },
];

export function PreviewToolbar({
  enableImages,
  onToggleImages,
  device,
  onDeviceChange,
  imageCount = 0,
  imageLoading = false,
  imageError = null,
  onRefreshImages,
  sectionCount = 0,
  aspectRatio = "16:9",
  onAspectRatioChange,
  enableOverlay = false,
  onToggleOverlay,
  availableProviders,
}: PreviewToolbarProps) {
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-card border border-border rounded-none">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-primary" />
        <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">PREVIEW CANVAS</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto font-mono">
        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-secondary p-0.5 rounded-none border border-border">
          {([
            { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
            { id: "tablet" as const, icon: Tablet, label: "Tablet" },
            { id: "desktop" as const, icon: Monitor, label: "Desktop" },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onDeviceChange(id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-none transition-none text-xs ${
                device === id
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={label}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline uppercase text-[10px]">{label}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

        {/* Images toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
          <div className="relative">
            <input
              type="checkbox"
              checked={enableImages}
              onChange={(e) => onToggleImages(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-7 h-4 rounded-none bg-secondary border border-border peer-checked:bg-primary/20 transition-none">
              <div
                className={`w-3 h-3 rounded-none bg-muted-foreground transition-none absolute top-0.5 ${
                  enableImages ? "left-3.5 bg-primary" : "left-0.5"
                }`}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ImageIcon className={`h-3.5 w-3.5 ${enableImages ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xs font-mono font-medium text-foreground hidden sm:inline uppercase">IMAGES</span>
          </div>
        </label>

        {/* Aspect Ratio */}
        {enableImages && onAspectRatioChange && (
          <div className="relative">
            <button
              onClick={() => setShowAspectDropdown(!showAspectDropdown)}
              className="flex items-center gap-1 px-2 py-1 rounded-none border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-none"
              title="Aspect ratio"
            >
              <Crop className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[10px] uppercase">{aspectRatio}</span>
            </button>
            {showAspectDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAspectDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-none shadow-none p-1 min-w-[100px] font-mono">
                  {ASPECT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onAspectRatioChange(opt.value);
                        setShowAspectDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1 text-xs rounded-none transition-none ${
                        aspectRatio === opt.value
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Overlay toggle */}
        {enableImages && onToggleOverlay && (
          <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
            <div className="relative">
              <input
                type="checkbox"
                checked={enableOverlay}
                onChange={(e) => onToggleOverlay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-7 h-4 rounded-full bg-muted peer-checked:bg-primary/30 transition-colors">
                <div
                  className={`w-3 h-3 rounded-full bg-muted-foreground transition-all absolute top-0.5 ${
                    enableOverlay ? "left-[15px] bg-primary" : "left-0.5"
                  }`}
                />
              </div>
            </div>
            <Layers className={`h-3 w-3 ${enableOverlay ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-[10px] text-muted-foreground hidden sm:inline">Overlay</span>
          </label>
        )}

        {/* Image status */}
        {enableImages && (
          <div className="flex items-center gap-1.5">
            {imageLoading ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
              </div>
            ) : imageError ? (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <AlertCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Error</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono" title={`${imageCount} images for ${sectionCount} sections`}>
                {imageCount}
                {sectionCount > 0 && (
                  <span className="text-slate-600">/{sectionCount}</span>
                )}
              </span>
            )}
            {onRefreshImages && (
              <button
                onClick={onRefreshImages}
                disabled={imageLoading}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50"
                title="Re-match images to current content"
              >
                <RefreshCw className={`h-3 w-3 ${imageLoading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        )}

        {/* Provider badge */}
        {availableProviders && availableProviders.length > 0 && (
          <span className="text-[9px] text-muted-foreground/50 hidden sm:inline border border-border/30 rounded px-1.5 py-0.5">
            {availableProviders.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
