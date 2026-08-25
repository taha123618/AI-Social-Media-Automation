"use client";

import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  PenTool,
  Hash,
  Image as ImageIcon,
  Video,
  MessageSquare,
  FileText,
  BarChart,
  Calendar,
  Share2,
  Zap,
  Target,
  Globe
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tools = [
  { name: "Instagram Bio Gen", icon: <FaInstagram className="w-4 h-4" />, category: "Social" },
  { name: "Viral Post Synthesizer", icon: <FaXTwitter className="w-4 h-4" />, category: "Social" },
  { name: "LinkedIn Thought Leader", icon: <FaLinkedin className="w-4 h-4" />, category: "B2B" },
  { name: "YouTube Script Pro", icon: <FaYoutube className="w-4 h-4" />, category: "Video" },
  { name: "Semantic Tag Scanner", icon: <Hash className="w-4 h-4" />, category: "Growth" },
  { name: "AI Image Prompt Studio", icon: <ImageIcon className="w-4 h-4" />, category: "Creative" },
  { name: "TikTok Hook Architect", icon: <Zap className="w-4 h-4" />, category: "Shortform" },
  { name: "Bio URL Optimizer", icon: <Share2 className="w-4 h-4" />, category: "Conversion" },
  { name: "Content Multiplier", icon: <Target className="w-4 h-4" />, category: "Ops" },
  { name: "SEO Meta Generator", icon: <Globe className="w-4 h-4" />, category: "SEO" },
  { name: "Ad Copy Matrix", icon: <PenTool className="w-4 h-4" />, category: "Paid Media" },
  { name: "Caption Polisher", icon: <MessageSquare className="w-4 h-4" />, category: "Copy" },
  { name: "Blog-to-Thread Porter", icon: <FileText className="w-4 h-4" />, category: "Distribution" },
  { name: "Engagement Predictor", icon: <BarChart className="w-4 h-4" />, category: "Analytics" },
  { name: "Peak-Hour Dispatcher", icon: <Calendar className="w-4 h-4" />, category: "Scheduler" },
  { name: "Video Description Engine", icon: <Video className="w-4 h-4" />, category: "Video" },
];

export default function ToolsShowcase() {
  return (
    <section id="tools" className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 text-center max-w-6xl">
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-1">
            INTEGRATED CAPABILITIES
          </p>
          <h2 className="text-2xl md:text-4xl font-mono font-black uppercase text-foreground mb-3 tracking-tight">
            AUTONOMOUS TOOL FLEET // <span className="text-primary">80+ MODULES</span>
          </h2>
          <p className="text-xs font-mono text-muted-foreground">
            From high-conversion hook synthesis to automated multi-location distribution.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="p-4 rounded-none border border-border bg-card hover:border-primary/60 transition-none text-left"
            >
              <div className="w-8 h-8 rounded-none bg-secondary border border-border flex items-center justify-center text-primary mb-3">
                {tool.icon}
              </div>
              <h4 className="text-xs font-mono font-bold uppercase text-foreground truncate mb-1">
                {tool.name}
              </h4>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                {tool.category}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/register">
            <Button size="lg">
              DEPLOY FULL TOOL FLEET
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
