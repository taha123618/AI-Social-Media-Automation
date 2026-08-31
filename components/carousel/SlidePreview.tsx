"use client";

import React from "react";
import { CarouselSlide, CarouselThemeConfig, CarouselAspectRatio } from "@/features/carousel_builder/types/carousel.types";
import { Sparkles, Quote, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

interface SlidePreviewProps {
  slide: CarouselSlide;
  theme: CarouselThemeConfig;
  aspectRatio: CarouselAspectRatio;
  totalSlides: number;
  businessName?: string;
}

export function SlidePreview({
  slide,
  theme,
  aspectRatio,
  totalSlides,
  businessName = "Brand Insights",
}: SlidePreviewProps) {
  // Aspect ratio class calculation
  const ratioClass =
    aspectRatio === "1:1"
      ? "aspect-square"
      : aspectRatio === "4:5"
      ? "aspect-[4/5]"
      : "aspect-[16/9]";

  return (
    <div
      className={`w-full ${ratioClass} rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xl border ${theme.borderColor} ${theme.bgClass}`}
    >
      {/* Background radial glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Slide Header: Brand Badge & Slide Counter */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-current opacity-80" />
          <span className="text-xs font-semibold tracking-wider uppercase opacity-80">
            {businessName}
          </span>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${theme.badgeBg}`}>
          {slide.slideNumber} / {totalSlides}
        </div>
      </div>

      {/* Slide Body Content */}
      <div className="my-auto z-10 flex flex-col justify-center space-y-4">
        {/* Layout: TITLE */}
        {slide.layout === "TITLE" && (
          <div className="space-y-3 text-center sm:text-left">
            {slide.highlightText && (
              <span className={`inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-md border ${theme.accentBg}`}>
                {slide.highlightText}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {slide.headline}
            </h2>
            {slide.subheadline && (
              <p className={`text-sm sm:text-base leading-relaxed ${theme.secondaryTextColor}`}>
                {slide.subheadline}
              </p>
            )}
          </div>
        )}

        {/* Layout: CONTENT / STEPS */}
        {(slide.layout === "CONTENT" || slide.layout === "STEPS") && (
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
              {slide.headline}
            </h3>
            {slide.bodyText && (
              <p className={`text-sm sm:text-base leading-relaxed ${theme.secondaryTextColor}`}>
                {slide.bodyText}
              </p>
            )}
            {slide.bulletPoints && slide.bulletPoints.length > 0 && (
              <div className="space-y-2 pt-2">
                {slide.bulletPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${theme.accentColor}`} />
                    <span className={theme.primaryTextColor}>{pt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Layout: STATISTIC */}
        {slide.layout === "STATISTIC" && (
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-white/5 mb-1">
              <TrendingUp className={`w-6 h-6 ${theme.accentColor}`} />
            </div>
            {slide.statValue && (
              <div className={`text-4xl sm:text-6xl font-black tracking-tight ${theme.accentColor}`}>
                {slide.statValue}
              </div>
            )}
            {slide.statLabel && (
              <h4 className="text-lg sm:text-xl font-bold tracking-tight">
                {slide.statLabel}
              </h4>
            )}
            {slide.bodyText && (
              <p className={`text-xs sm:text-sm max-w-md mx-auto ${theme.secondaryTextColor}`}>
                {slide.bodyText}
              </p>
            )}
          </div>
        )}

        {/* Layout: QUOTE */}
        {slide.layout === "QUOTE" && (
          <div className="space-y-4 text-center relative py-2">
            <Quote className={`w-8 h-8 mx-auto opacity-30 ${theme.accentColor}`} />
            <p className="text-lg sm:text-xl font-semibold italic leading-relaxed">
              "{slide.bodyText || slide.headline}"
            </p>
            {slide.authorOrAttribution && (
              <div className={`text-xs uppercase tracking-widest font-mono font-medium ${theme.accentColor}`}>
                — {slide.authorOrAttribution}
              </div>
            )}
          </div>
        )}

        {/* Layout: CTA */}
        {slide.layout === "CTA" && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2">
              <Sparkles className={`w-6 h-6 ${theme.accentColor}`} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {slide.headline}
            </h3>
            {slide.subheadline && (
              <p className={`text-sm ${theme.secondaryTextColor}`}>
                {slide.subheadline}
              </p>
            )}
            {slide.ctaButtonText && (
              <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md border ${theme.accentBg}`}>
                <span>{slide.ctaButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide Footer: Swipe Prompt */}
      <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10 text-[11px]">
        <span className={`flex items-center gap-1.5 ${theme.secondaryTextColor}`}>
          <span>Swipe next</span>
          <ArrowRight className="w-3 h-3" />
        </span>
        <span className="font-mono opacity-60">PDF / Social Ready</span>
      </div>
    </div>
  );
}
