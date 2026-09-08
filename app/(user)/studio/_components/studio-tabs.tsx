"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Image as ImageIcon, Video, Layers, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageDashboard from "@/features/image_generation/components/image-dashboard";
import { RagVideoDashboard } from "@/features/video_generation/components/rag-video-dashboard";
import GalleryTabs from "@/app/(user)/gallery/_components/gallery-tabs";
import { cn } from "@/lib/utils";

interface StudioTabsProps {
  businessId: string;
  userId: string;
}

type TabType = "images" | "videos" | "gallery";

const TABS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; description: string; badge?: string }[] = [
  {
    id: "images",
    label: "AI Image Studio",
    icon: ImageIcon,
    description: "Generate multi-format social graphics, product banners & visuals",
    badge: "Flux Pro",
  },
  {
    id: "videos",
    label: "AI Video Studio",
    icon: Video,
    description: "Render high-impact cinematic reels with Runway & Luma models",
    badge: "Gen-4.5",
  },
  {
    id: "gallery",
    label: "Media Library",
    icon: Layers,
    description: "Unified repository of all generated assets and cloud renders",
  },
];

export function StudioTabs({ businessId, userId }: StudioTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as TabType) || "images";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabType;
    if (tabParam && (tabParam === "images" || tabParam === "videos" || tabParam === "gallery")) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/studio?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & Tab Navigation Bar */}
      <div className="rounded-xl border border-border/80 bg-card p-2 sm:p-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-lg text-left transition-all duration-200 relative",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/25 shadow-xs ring-1 ring-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg shrink-0 mt-0.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-foreground leading-tight">
                      {tab.label}
                    </span>
                    {tab.badge && (
                      <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary border border-primary/25 px-1.5 py-0.2 rounded">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "images" && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <ImageDashboard businessId={businessId} userId={userId} />
            </div>
          )}

          {activeTab === "videos" && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <RagVideoDashboard businessId={businessId} />
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <GalleryTabs />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
