import React from 'react';
import { LayoutConditionalWrapper } from "@/wrapper/LayoutConditionalWrapper";
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
   title: "Social AI User Panel",
   description: "Social AI User Panel",
};

export default async function UserLayout({
   children,
}: Readonly<{
   children: React.ReactNode; //suppressHydrationWarning
}>) {
   return (
      <div
         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
         suppressHydrationWarning
         >
         <LayoutConditionalWrapper>{children}</LayoutConditionalWrapper>
      </div>
   )

}
