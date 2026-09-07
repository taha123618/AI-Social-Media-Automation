"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthTestimonialSlider } from "@/components/auth/auth-testimonial-slider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* LEFT COLUMN: Subtle graph-paper grid, Back button, and centered AuthCard */}
      <div className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 pt-16 pb-8 sm:px-6 sm:py-12 lg:px-8 xl:px-12 bg-[#FAFAFC] dark:bg-[#09090D] bg-[linear-gradient(to_right,#E6E6EA_1px,transparent_1px),linear-gradient(to_bottom,#E6E6EA_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#191922_1px,transparent_1px),linear-gradient(to_bottom,#191922_1px,transparent_1px)] bg-[size:24px_24px] overflow-y-auto">
        {/* Floating Back Button */}
        <Link
          href="/"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground bg-card/90 backdrop-blur-md border border-border rounded-lg hover:bg-muted transition-all duration-200 shadow-2xs z-30"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {/* Center Container for AuthCard */}
        <div className="w-full max-w-[420px] sm:max-w-md my-auto flex flex-col justify-center">
          {children}
        </div>

        {/* Subtle Security Footnote */}
        <p className="text-[11px] font-medium text-muted-foreground mt-6 text-center select-none">
          Enterprise SOC 2 Type II Certified • 256-bit Encryption
        </p>
      </div>

      {/* RIGHT COLUMN: Dark SocialAI Showcase & Testimonials */}
      <div className="hidden lg:flex flex-col justify-between p-8 lg:p-10 xl:p-14 2xl:p-16 bg-[#0B0B12] relative overflow-hidden min-h-[100dvh] select-none">
        {/* Ambient Violet/Purple Lighting */}
        <div className="absolute -top-24 -right-24 w-[550px] h-[550px] bg-primary/20 blur-[150px] rounded-full pointer-events-none -z-0" />
        <div className="absolute top-1/2 -right-24 w-[400px] h-[400px] bg-purple-600/15 blur-[130px] rounded-full pointer-events-none -z-0" />

        {/* Top Header: SocialAI Brand */}
        <div className="flex items-center justify-between relative z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Social<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary tracking-tight">v2.0 Autonomous Fleet</span>
          </div>
        </div>

        {/* Hero Copy (Autonomous Social Automation Engineered for Scale) */}
        <div className="space-y-5 lg:space-y-6 max-w-xl my-auto py-8 lg:py-12 relative z-10">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
            Autonomous Social Automation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-300">
              Engineered for Scale.
            </span>
          </h1>
          <p className="text-[#9CA3AF] text-sm lg:text-base font-normal leading-relaxed">
            Deploy 13 autonomous AI agents that analyze trends, research high-ranking content, and publish multi-channel campaigns seamlessly across YouTube, Instagram, X, and LinkedIn.
          </p>

          <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs font-medium text-gray-400 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Multi-Platform Auto-Publishing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> 13 Autonomous Agents
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> RAG Semantic Memory
            </span>
          </div>

          <div className="pt-2">
            <Link
              href="/social-media-management-tool"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline underline-offset-4 decoration-primary/60 hover:decoration-primary transition-all"
            >
              Explore platform capabilities <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Testimonial Slider */}
        <div className="w-full relative z-10 pt-2 lg:pt-4">
          <AuthTestimonialSlider />
        </div>
      </div>
    </div>
  );
}