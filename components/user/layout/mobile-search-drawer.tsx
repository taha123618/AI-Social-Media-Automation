"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, FileText, Send, BarChart3, Workflow, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const quickLinks = [
  { label: "AI Blog Writer", href: "/blog", icon: FileText, desc: "Generate long-form articles" },
  { label: "Posts Feed", href: "/posts", icon: Send, desc: "Manage scheduled posts" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, desc: "Performance & attribution" },
  { label: "Workflows", href: "/workflows", icon: Workflow, desc: "Autonomous agent pipelines" },
  { label: "Creative Studio", href: "/studio", icon: Sparkles, desc: "Image, video & gallery" },
];

interface MobileSearchDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSearchDrawer({ open, onClose }: MobileSearchDrawerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Lock body scroll while open
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border/70 shadow-2xl pb-safe md:hidden"
            style={{ maxHeight: "85vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="px-4 pb-6 overflow-y-auto overscroll-contain">
              {/* Search input */}
              <div className="relative mb-4 mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="search"
                  placeholder="Search posts, analytics, tools..."
                  className="w-full pl-10 pr-10 h-11 text-sm bg-secondary/50 rounded-xl border-border/60 focus-visible:ring-primary"
                />
                <button
                  onClick={onClose}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick links */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-0.5">
                  Quick Access
                </p>
                <div className="space-y-1.5">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/50 transition-all touch-manipulation group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <link.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {link.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{link.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
