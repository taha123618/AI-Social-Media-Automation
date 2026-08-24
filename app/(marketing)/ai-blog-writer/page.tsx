import { Suspense } from "react";
import type { Metadata } from "next";
import Hero from "@/app/(marketing)/ai-blog-writer/_components/Hero";
import Stats from "@/app/(marketing)/ai-blog-writer/_components/Stats";
import Features from "@/app/(marketing)/ai-blog-writer/_components/Features";
import SEOBenefits from "@/app/(marketing)/ai-blog-writer/_components/SEOBenefits";
import Workflow from "@/app/(marketing)/ai-blog-writer/_components/Workflow";
import Examples from "@/app/(marketing)/ai-blog-writer/_components/Examples";
import Comparison from "@/app/(marketing)/ai-blog-writer/_components/Comparison";
import Pricing from "@/app/(marketing)/ai-blog-writer/_components/Pricing";
import FAQ from "@/app/(marketing)/ai-blog-writer/_components/FAQ";
import CTA from "@/app/(marketing)/ai-blog-writer/_components/CTA";
import Loading from "./loading";
import BlogSEOBenefits from "./_components/BlogSEOBenefits";

function PageContent() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      {/* <SEOBenefits /> */}
      <BlogSEOBenefits />
      <Workflow />
      <Examples />
      <Comparison />
      <Pricing />
      <CTA />
    </>
  );
}

export const metadata: Metadata = {
  title: "AI Blog Writer — Generate SEO-Optimized Long-Form Articles | SocialAI",
  description:
    "Create 2,500–8,000 word blog articles that rank on Google in under 10 minutes. Real-time SEO scoring, AI detection bypass, brand voice training, and one-click CMS publishing.",
  keywords: [
    "AI blog writer",
    "AI content generator",
    "SEO content writer",
    "AI article generator",
    "long-form content AI",
    "automated blog writing",
    "GPT blog writer",
    "AI SEO writer",
  ],
  openGraph: {
    title: "AI Blog Writer — Rank on Google with AI-Generated Long-Form Content",
    description:
      "Generate SEO-optimized blog posts in minutes. Trusted by 24,700+ creators worldwide.",
    type: "website",
    images: [
      {
        url: "/og-blog-writer.png",
        width: 1200,
        height: 630,
        alt: "SocialAI Blog Writer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Blog Writer — Generate SEO Articles in Minutes",
    description:
      "From keyword to publish-ready article in under 10 minutes. Try free.",
    images: ["/og-blog-writer.png"],
  },
};

export default function AIBlogWriterPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}
