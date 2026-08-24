"use client";

import React from "react";

const logos = [
  { name: "Hootsuite", placeholder: "HO" },
  { name: "Accenture", placeholder: "accenture", isLogo: true },
  { name: "TikTok", placeholder: "TikTok", isLogo: true },
  { name: "Swiggy", placeholder: "SWIGGY", isLogo: true },
  { name: "Comcast", placeholder: "COMCAST", isLogo: true },
  { name: "Byjus", placeholder: "BYJU'S", isLogo: true },
];

export const BrandLogos = () => {
  return (
    <div className="py-16 bg-white dark:bg-slate-950 border-y border-slate-50 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-4 text-center">
        <p className="text-[#2D46FF] dark:text-blue-400 font-black text-sm mb-12 tracking-tight">
          Trusted by 1 Million+ Professionals & Brands
        </p>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          {logos.map((logo, index) => (
            <div key={index} className="flex items-center justify-center">
              {logo.isLogo ? (
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter lowercase">
                  {logo.placeholder}
                </span>
              ) : (
                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 dark:text-slate-500">
                  {logo.placeholder}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
