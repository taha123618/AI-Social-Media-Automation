import { FeatureComparison } from "./_components/FeatureComparison";
import { TrustMetrics } from "./_components/TrustMetrics";
import { BrandLogos } from "./_components/BrandLogos";
import { TrustFeatures } from "./_components/TrustFeatures";
import PricingHeader from "./_components/PricingHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
   title: "Pricing | SocialAI",
   description:
      "Choose the perfect plan for your social media needs. Start free, scale with Pro, or elevate with Enterprise. All plans include AI-powered content creation, scheduling, and analytics.",
   openGraph: {
      title: "Pricing | SocialAI",
      description:
         "Choose the perfect plan for your social media needs. Start free, scale with Pro, or elevate with Enterprise. All plans include AI-powered content creation, scheduling, and analytics.",
      type: "website",
   },
};
export default function PricingPage() {
   return (

      <>
         {/* Page-specific: headline, toggle, cards, enterprise CTA */}
         <PricingHeader />
         {/* Shared reusable components */}
         <TrustMetrics />
         <FeatureComparison />
         <BrandLogos />
         <TrustFeatures />
      </>
   );
}
