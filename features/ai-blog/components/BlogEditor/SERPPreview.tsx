"use client";

import { useState } from "react";
import { Globe, Monitor, Smartphone, Search } from "lucide-react";

interface SERPPreviewProps {
  title: string;
  metaDescription: string;
  slug: string;
}

export function SERPPreview({ title, metaDescription, slug }: SERPPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const displayUrl = `https://yourbrand.com/blog/${slug || "article-slug"}`;

  return (
    <div className="space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
            <Search className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Google SERP Preview
          </h3>
        </div>

        <div className="flex gap-0.5 bg-slate-800/50 p-0.5 rounded-lg">
          {[
            { id: "desktop" as const, icon: Monitor },
            { id: "mobile" as const, icon: Smartphone },
          ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDevice(id)}
              className={`p-1.5 rounded-md transition-all ${
                device === id
                  ? "bg-slate-700 text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      <div
        className={`bg-white rounded-lg shadow-sm border border-slate-200 font-sans overflow-hidden transition-all duration-300 ${
          device === "mobile" ? "max-w-[360px] mx-auto" : "w-full"
        }`}
      >
        {/* Google search bar mockup */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
          <div className="w-3 h-3 rounded-full border-2 border-slate-300 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
          <div className="h-2 flex-1 rounded bg-slate-200" />
        </div>

        <div className="p-4">
          {/* Site link & breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 shrink-0">
                Y
              </div>
              <span className="text-[10px] text-slate-800 font-medium">Your Brand</span>
            </div>
            <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            <span className="text-[9px] text-slate-500 truncate">{displayUrl}</span>
          </div>

          {/* Title */}
          <h4 className="text-blue-800 hover:underline font-medium text-sm mt-1 leading-snug line-clamp-2 cursor-pointer">
            {title || "Please enter an SEO title..."}
          </h4>

          {/* Snippet text */}
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
            {metaDescription || "Please provide a meta description to preview snippet content here."}
          </p>
        </div>
      </div>
    </div>
  );
}
