import React from "react";
import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user/layout/user-sidebar";
import { UserNavbar } from "@/components/user/layout/user-navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import QueryProvider from "@/app/providers/query-provider";

export const metadata: Metadata = {
  title: "Workspace Dashboard | SocialAI",
  description: "Manage your AI content generation, campaigns, and publishing workflows.",
};

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    user = session?.user || null;
  } catch (error) {
    // Graceful fallback for preview / guest context
  }

  return (
    <QueryProvider>
      <SidebarProvider defaultOpen={true}>
        <UserSidebar user={user} />
        <SidebarInset className="bg-background">
          <UserNavbar />
          <main className="flex-1 p-6 bg-muted/40 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  );
}
