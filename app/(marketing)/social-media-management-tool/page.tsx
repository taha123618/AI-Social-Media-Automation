import HeroSection from "./_components/HeroSection";
import HowToStartSection from "./_components/HowToStartSection";
import BrandReachSection from "./_components/BrandReachSection";
import SmartFeaturesSection from "./_components/SmartFeaturesSection";
import StatsSection from "./_components/StatsSection";
import WhyChooseSection from "./_components/WhyChooseSection";
import { Metadata } from "next";

export const metadata: Metadata = {
   title: "Social Media Management Tool | Autonomous Multi-Platform AI | SocialAI",
   description:
      "Simplify your workflow with our AI-powered social media management tool — from automated post creation and visual calendar scheduling to real-time telemetry and multi-channel dispatch across LinkedIn, X, Instagram, Facebook, and YouTube.",
   keywords: [
      "social media management tool",
      "AI social media automation",
      "social media scheduler",
      "multi-channel social dispatcher",
      "automated social posting",
      "content calendar AI",
      "social media analytics",
   ],
   openGraph: {
      title: "Social Media Management Tool | SocialAI",
      description:
         "AI-powered social media management. Create, schedule, and manage posts across all platforms with autonomous AI agents built for creators, marketers, and growth teams.",
      type: "website",
   },
};

export default function SocialMediaManagementTool() {
   return (
      <>
         <HeroSection />
         <HowToStartSection />
         <BrandReachSection />
         <SmartFeaturesSection />
         <StatsSection />
         <WhyChooseSection />
      </>
   );
}
