import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "./providers/query-provider";
import { ThemeProvider } from "./providers/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { WorkspaceProvider } from "@/contexts/workspace-context";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SocialAI — Autonomous Social Media & Content Automation",
    template: "%s | SocialAI",
  },
  description: "Deploy 13 autonomous AI agents that analyze trends, research high-ranking content, and publish multi-channel campaigns seamlessly.",
  keywords: ["AI", "Social Media Automation", "Content Generation", "Multi-Agent", "Blog Writer", "Scheduling"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SocialAI",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <WorkspaceProvider>
              <TooltipProvider>
              {children}
              </TooltipProvider>
            </WorkspaceProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
