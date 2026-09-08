"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, Sparkles, BarChart3, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  FolderOpen, Workflow, Calendar, Target, Settings,
  FileText, Globe, Brain, TrendingUp, Megaphone,
} from "lucide-react";

const primaryTabs = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Posts", href: "/posts", icon: Send },
  { label: "Studio", href: "/studio", icon: Sparkles },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const moreItems = [
  { label: "AI Blog Writer", href: "/blog", icon: FileText },
  { label: "Contents Library", href: "/contents", icon: FolderOpen },
  { label: "Workflows", href: "/workflows", icon: Workflow },
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Competitors", href: "/competitors", icon: Target },
  { label: "Ad Campaigns", href: "/ad-campaigns", icon: Megaphone },
  { label: "Brand Voice", href: "/brand-voice", icon: Brain },
  { label: "Multi-Location", href: "/multi-location", icon: Globe },
  { label: "Trends", href: "/trends", icon: TrendingUp },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isTabActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Bottom nav bar */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "bg-card/95 backdrop-blur-xl border-t border-border/70",
          "pb-safe" // safe-area-inset-bottom from globals.css
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around px-2 h-16">
          {primaryTabs.map((tab) => {
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full touch-manipulation",
                  "transition-colors duration-150",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute top-2 w-8 h-8 rounded-xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon className={cn("w-5 h-5 relative z-10", active && "text-primary")} />
                <span className={cn("text-[10px] font-semibold relative z-10", active ? "text-primary" : "text-muted-foreground")}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-muted-foreground touch-manipulation transition-colors hover:text-foreground"
            aria-label="More navigation options"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>

      {/* "More" sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-safe max-h-[70vh] overflow-y-auto">
          <SheetTitle className="text-sm font-bold mb-4 px-1">Navigation</SheetTitle>
          <div className="grid grid-cols-3 gap-2 pb-4">
            {moreItems.map((item) => {
              const active = isTabActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-150 touch-manipulation",
                    active
                      ? "border-primary/40 bg-primary/8 text-primary"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
