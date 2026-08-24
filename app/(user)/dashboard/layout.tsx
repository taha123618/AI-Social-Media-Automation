import type { Metadata } from 'next';

export const metadata: Metadata = {
   title: "AI Social Media Automation",
   description: "Generate brand-aligned content with AI-powered automation. Manage workflows, schedule posts, and analyze engagement across all social platforms.",
   keywords: [
      "AI",
      "Social Media",
      "Content Generation",
      "Automation",
      "Brand Management",
      "RAG",
   ],
   authors: [
      {
         name: "DevTeamPro",
         url: "https://devteampro.com",
      },
   ],
   // viewport moved to top-level `viewport` export per Next.js requirements
   openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://contentengine.yourcompany.com",
      title: "Content Engine - AI Social Media Automation",
      description:
         "Generate brand-aligned content with AI-powered automation",
   },
};

export const viewport = {
   width: 'device-width',
   initialScale: 1,
   maximumScale: 1,
};

export default function DashboardLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return children;
}
