import dynamic from "next/dynamic";

// Dynamic imports for optimized hydration
const Hero = dynamic(() => import("@/components/home/Hero"));
const Features = dynamic(() => import("@/components/home/Features"));
const ToolsShowcase = dynamic(() => import("@/components/home/ToolsShowcase"));
const UseCases = dynamic(() => import("@/components/home/UseCases"));
const Workflow = dynamic(() => import("@/components/home/Workflow"));
// const Pricing = dynamic(() => import("@/components/home/Pricing"));

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soscial Media Management Tool | SocialAI",
  description:
    "Simplify your workflow with our AI-powered social media management tool — from post creation, scheduling to real-time analytics, manage it all in one place. Try it today!",
  openGraph: {
    title: "Social Media Management Tool | SocialAI",
    description:
      "AI-powered social media management. Create, schedule, and manage posts for all your platforms — powered by AI, built for creators, marketers & teams.",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <div className="relative z-10">
        <Features />
        <ToolsShowcase />
        <UseCases />
        <Workflow />
        {/* <Pricing /> */}
      </div>
    </>
  );
}
