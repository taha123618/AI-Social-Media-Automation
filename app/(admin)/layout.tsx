import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
   variable: "--font-geist-sans",
   subsets: ["latin"],
});

const geistMono = Geist_Mono({
   variable: "--font-geist-mono",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Social AI Admin Panel",
   description: "Social AI Admin Panel",
};

export default function RootAdminLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <main
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            suppressHydrationWarning
      >
         {children}
      </main>
   )
}
