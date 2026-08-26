"use client";

import React from "react";

const networks = [
  "LINKEDIN",
  "X / TWITTER",
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "WORDPRESS",
  "GHOST",
  "SHOPIFY",
  "WEBFLOW",
  "NOTION",
  "MEDIUM",
];

export const BrandLogos = () => {
  return (
    <div className="py-16 bg-muted/20 border-y border-border/60 overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
          COMPATIBLE WITH ENTERPRISE CMS &amp; SOCIAL PLATFORMS
        </p>
      </div>

      <div className="flex animate-marquee whitespace-nowrap opacity-60 hover:opacity-90 transition-opacity">
        {[...networks, ...networks].map((network, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 mx-8 text-sm font-semibold tracking-wider text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            {network}
          </div>
        ))}
      </div>
    </div>
  );
};
