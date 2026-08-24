import type { Metadata } from "next";
import Form from "./_components/Form";
import HowItWorks from "./_components/HowItWorks";

export const metadata: Metadata = {
  title: "Schedule a Demo — See SocialAI in Action | SocialAI",
  description:
    "Book a personalized demo with our product experts. See how SocialAI helps teams create, schedule, and analyze content at scale with AI-powered automation.",
  keywords: [
    "schedule a demo",
    "SocialAI demo",
    "AI social media demo",
    "social media management demo",
    "book a demo",
    "product walkthrough",
    "social media tool demo",
  ],
  // openGraph: {
  //   title: "Schedule a Demo — See Why Teams Choose SocialAI",
  //   description:
  //     "Book a personalized walkthrough. See how SocialAI transforms your social media workflow with AI-powered automation.",
  //   type: "website",
  //   images: [
  //     {
  //       url: "/og-demo.png",
  //       width: 1200,
  //       height: 630,
  //       alt: "SocialAI Demo",
  //     },
  //   ],
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Schedule a Demo — SocialAI",
  //   description:
  //     "Book a personalized walkthrough of SocialAI's AI-powered social media platform.",
  //   images: ["/og-demo.png"],
  // },
};

export default function TalkToSalesPage() {
  return (
    <>
      <Form />
      <HowItWorks />
    </>
  );
}




