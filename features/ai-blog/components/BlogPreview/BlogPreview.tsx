"use client";

import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { BlogImageService } from "../../services/blog-image.service";
import type { ImageRecord, ImageAspectRatio } from "../../types/blog-image.types";
import { ContextImage } from "./ContextImage";

interface SectionWithImage {
  heading: string;
  content: string;
  image: ImageRecord | null;
}

interface BlogPreviewProps {
  title: string;
  content: string;
  metaDescription?: string;
  author?: string;
  publishedDate?: string;
  enableImages?: boolean;
  topic?: string;
  keywords?: string[];
  aspectRatio?: ImageAspectRatio;
  enableOverlay?: boolean;
  generatingImages?: boolean;
  sectionImages?: Record<string, ImageRecord>;
}

const EMPTY: Record<string, ImageRecord> = {};

export function BlogPreview({
  title,
  content,
  metaDescription,
  author,
  publishedDate,
  enableImages = false,
  topic = "",
  keywords = [],
  aspectRatio = "16:9",
  enableOverlay = false,
  generatingImages = false,
  sectionImages = EMPTY,
}: BlogPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const patchImages = useCallback(() => {
    if (!contentRef.current) return;
    const imgs = contentRef.current.querySelectorAll<HTMLImageElement>(".blog-context-image");
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth === 0) showImageFallback(img);
      img.addEventListener("error", () => showImageFallback(img), { once: true });
    });
  }, []);

  useEffect(() => {
    if (enableImages) {
      const timer = setTimeout(patchImages, 500);
      return () => clearTimeout(timer);
    }
  }, [enableImages, content, topic, patchImages]);

  const imagesList = useMemo(() => Object.values(sectionImages), [sectionImages]);

  const processedContent = useMemo(() => {
    if (!enableImages) return content;
    return BlogImageService.injectImagesIntoContent(content, imagesList, topic);
  }, [content, enableImages, imagesList, topic]);

  const sections = useMemo<SectionWithImage[]>(() => {
    if (!enableImages || !topic) return [];
    return BlogImageService.extractSections(content).map((s) => ({
      ...s,
      image: sectionImages[s.heading] || null,
    }));
  }, [content, enableImages, topic, sectionImages]);

  if (!content && !title) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <p className="text-sm font-medium">No content to preview</p>
        <p className="text-xs mt-1">Write or generate an article to see the live preview.</p>
      </div>
    );
  }

  const heroImage = sections.length > 0 ? sections[0].image : null;

  return (
    <article className="blog-preview max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {title && (
        <header className="mb-8 pb-8 border-b border-border">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-4">
            {title}
          </h1>

          {(metaDescription || author || publishedDate) && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {author && (
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {author.charAt(0).toUpperCase()}
                  </span>
                  {author}
                </span>
              )}
              {publishedDate && (
                <time dateTime={publishedDate}>{publishedDate}</time>
              )}
              {metaDescription && (
                <p className="w-full mt-2 text-base text-muted-foreground leading-relaxed">
                  {metaDescription}
                </p>
              )}
            </div>
          )}

          {/* Featured section image after the header */}
          {enableImages && (heroImage || generatingImages) && (
            <div className="mt-6 -mx-4 sm:-mx-6 relative">
              <ContextImage
                image={heroImage}
                alt={`Featured image for: ${sections[0]?.heading || title}`}
                aspectRatio={aspectRatio}
                imageStyle="hero"
                priority
                loading={generatingImages && !heroImage}
              />
              {enableOverlay && (
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
              )}
            </div>
          )}
        </header>
      )}

      <div
        ref={contentRef}
        className="blog-preview-content prose prose-slate dark:prose-invert max-w-none
          prose-headings:scroll-mt-20
          prose-h1:text-foreground prose-h2:text-foreground prose-h3:text-foreground prose-h4:text-foreground
          prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
          prose-h1:font-extrabold prose-h2:font-bold prose-h3:font-bold
          prose-h1:mt-10 prose-h2:mt-8 prose-h3:mt-6
          prose-h1:mb-4 prose-h2:mb-3 prose-h3:mb-2
          prose-p:text-base prose-p:leading-relaxed prose-p:mb-4
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:font-bold prose-strong:text-foreground
          prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
          prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-4
          prose-pre:overflow-x-auto
          prose-blockquote:border-l-4 prose-blockquote:border-primary/40
          prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-muted-foreground
          prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
          prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-1.5
          prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-1.5
          prose-li:text-base prose-li:leading-relaxed
          prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full prose-img:h-auto prose-img:object-cover
          prose-table:w-full prose-table:border-collapse
          prose-th:bg-muted prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:text-sm prose-th:font-bold prose-th:text-foreground
          prose-td:px-4 prose-td:py-2.5 prose-td:text-sm prose-td:border-b prose-td:border-border
          prose-hr:border-border prose-hr:my-8
          [&_.blog-context-image-wrap]:my-6
          [&_.blog-context-image]:w-full [&_.blog-context-image]:rounded-xl [&_.blog-context-image]:shadow-lg
          [&_.blog-context-image]:border [&_.blog-context-image]:border-border
          [&_.blog-context-image]:transition-opacity [&_.blog-context-image]:duration-300
        "
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </article>
  );
}

function showImageFallback(img: HTMLImageElement) {
  const fallback = document.createElement("div");
  fallback.className = "flex items-center justify-center h-48 bg-slate-900/40 rounded-xl border border-border";
  fallback.innerHTML = `
    <div class="flex flex-col items-center gap-2 text-slate-500">
      <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2 2l20 20M6 6l-2 2v10a2 2 0 002 2h12a2 2 0 002-2v-2M14 10l4-4m0 0l-4-4m4 4H8" />
      </svg>
      <span class="text-xs">Image unavailable</span>
    </div>
  `;
  img.parentElement?.replaceChild(fallback, img);
}
