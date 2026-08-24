import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ClientWrapper from "@/app/wrapper/client-wrapper";
import FAQ from "@/components/common/FAQ";
import CTA from "@/components/common/CTA";
import Testimonials from "@/components/home/Testimonials";
import HeroSection from "./_components/HeroSection";
import HowToStartSection from "./_components/HowToStartSection";
import BrandReachSection from "./_components/BrandReachSection";
import SmartFeaturesSection from "./_components/SmartFeaturesSection";
import StatsSection from "./_components/StatsSection";
import WhyChooseSection from "./_components/WhyChooseSection";
import { Metadata } from "next";

export const metadata: Metadata = {
   title: "Social Media Management Tool | SocialAI",
   description:
      "Simplify your workflow with our AI-powered social media management tool — from post creation, scheduling to real-time analytics, manage it all in one place. Try it today!",
   openGraph: {
      title: "Social Media Management Tool | SocialAI",
      description:
         "AI-powered social media management. Create, schedule, and manage posts for all your platforms — powered by AI, built for creators, marketers & teams.",
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
