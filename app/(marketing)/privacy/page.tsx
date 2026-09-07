import type { Metadata } from "next";
import PrivacyViewer from "./_components/PrivacyViewer";

export const metadata: Metadata = {
  title: "Privacy Policy | SocialAI — Enterprise Data Protection & Security",
  description:
    "Learn how SocialAI protects your privacy, secures multi-tenant data, and guarantees that your proprietary content is never used to train public AI models.",
  keywords: [
    "SocialAI privacy policy",
    "AI data security",
    "zero model training",
    "multi-tenant data isolation",
    "GDPR AI compliance",
    "enterprise content privacy",
    "pgvector security",
  ],
  openGraph: {
    title: "Privacy Policy | SocialAI — Enterprise Data Protection",
    description:
      "Deterministic multi-tenant data isolation, zero model training, and AES-256 encryption. Read our enterprise privacy policy.",
    type: "website",
    url: "https://socialai.io/privacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | SocialAI",
    description:
      "Deterministic multi-tenant data isolation and zero model training. Read how SocialAI protects your content.",
  },
};

export default function PrivacyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "SocialAI Privacy Policy",
    description:
      "Enterprise Privacy Policy detailing data handling, multi-tenant isolation, and zero-training guarantees for SocialAI.",
    url: "https://socialai.io/privacy",
    datePublished: "2025-01-01",
    dateModified: "2026-09-01",
    publisher: {
      "@type": "Organization",
      name: "SocialAI Inc.",
      url: "https://socialai.io",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrivacyViewer />
    </>
  );
}
