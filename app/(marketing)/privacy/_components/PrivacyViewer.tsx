"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  FileText,
  CheckCircle2,
  Clock,
  Mail,
  Download,
  Trash2,
  KeyRound,
  Share2,
  Scale,
  Globe,
  Server,
  ArrowRight,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";

interface Section {
  id: string;
  title: string;
  badge?: string;
}

const sections: Section[] = [
  { id: "overview", title: "1. Overview & Privacy Pledge", badge: "Core" },
  { id: "commitments", title: "2. Zero AI Training & Data Isolation", badge: "Critical" },
  { id: "collection", title: "3. Information We Collect", badge: "Data" },
  { id: "usage", title: "4. How We Use Information", badge: "Processing" },
  { id: "ai-providers", title: "5. AI Sub-Processors & Models", badge: "Third-Party" },
  { id: "retention-deletion", title: "6. Retention & Erasure Rights", badge: "Your Rights" },
  { id: "security-measures", title: "7. Security & Encryption", badge: "SOC-2" },
  { id: "compliance-gdpr", title: "8. GDPR & CCPA Compliance", badge: "Global" },
  { id: "contact-dpo", title: "9. Contact Our Legal Team", badge: "Contact" },
];

export default function PrivacyViewer() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const filteredSections = searchQuery
    ? sections.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground pt-12 pb-24">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="container mx-auto px-4 max-w-6xl mb-16">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
          <Link href="/" className="hover:underline text-muted-foreground">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-primary">Legal &amp; Trust Center</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/80 pb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>ENTERPRISE DATA GOVERNANCE</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4 leading-[1.1]">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
              How SocialAI protects your proprietary content, secures workspace data
              with deterministic multi-tenant isolation, and ensures zero public model training.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-xs font-mono text-muted-foreground bg-card/80 border border-border/80 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Updated: Sept 2026</span>
            </div>
            <span className="hidden sm:inline text-border">|</span>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Version: 2.4 (Enterprise)</span>
            </div>
          </div>
        </div>

        {/* 4 Trust Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <EyeOff className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-foreground mb-1">
              Zero Model Training
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your drafts, prompts, and brand files are never used to train public LLMs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-foreground mb-1">
              Tenant Data Isolation
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Strict multi-tenancy enforced at both Prisma ORM and pgvector RAG boundaries.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-foreground mb-1">
              AES-256 &amp; TLS 1.3
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Military-grade cryptographic encryption at rest and in transit across all endpoints.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-foreground mb-1">
              GDPR &amp; CCPA Ready
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Full data portability, instant deletion rights, and automated DSR workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sticky TOC + Document Body */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Sticky Navigation Table of Contents */}
          <aside className="lg:col-span-4 sticky top-28 hidden lg:block">
            <div className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Table of Contents
                </span>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  9 SECTIONS
                </span>
              </div>

              {/* Quick Search */}
              <div className="relative mb-4">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary/60 border border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground font-mono"
                />
              </div>

              <nav className="space-y-1">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between group cursor-pointer ${
                      activeSection === sec.id
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80 font-medium"
                    }`}
                  >
                    <span className="truncate pr-2">{sec.title}</span>
                    {sec.badge && (
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded tracking-wider ${
                          activeSection === sec.id
                            ? "bg-white/20 text-white"
                            : "bg-secondary text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {sec.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">Need legal counsel?</p>
                    <a
                      href="mailto:privacy@socialai.io"
                      className="text-primary hover:underline font-mono text-[11px]"
                    >
                      privacy@socialai.io
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Policy Document Body */}
          <main className="lg:col-span-8 space-y-16">
            {/* Section 1: Overview */}
            <section id="overview" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  Section 01
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Overview &amp; Privacy Pledge
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                SocialAI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Platform&rdquo;) is an enterprise autonomous social media orchestration and content generation SaaS engine. We are committed to upholding the highest standards of data security, user confidentiality, and intellectual property ownership.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                This Privacy Policy explains the specific types of information we process when you interact with our web applications, autonomous agent workflows, scheduling workers, API endpoints, and knowledge management systems.
              </p>
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                <strong className="text-primary font-semibold">Our Guarantee:</strong> You retain complete ownership of all prompt inputs, brand guidelines, audio assets, video scripts, and generated post outputs. We act strictly as a data processor on your behalf.
              </div>
            </section>

            {/* Section 2: Zero AI Training & Multi-Tenancy */}
            <section id="commitments" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Section 02 — Critical Architecture
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Zero Public Model Training &amp; Strict Multi-Tenancy
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                A primary concern with generative AI platforms is unintentional data leakage into public foundational model weights. We have engineered hard architectural controls to eliminate this risk:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-card border border-border flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">
                      Stateless API Processing
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All LLM inference calls to OpenAI, Anthropic Claude, and OpenRouter utilize enterprise-tier endpoints bound by strict zero-data-retention agreements. Your text is processed ephemerally in RAM and discarded immediately upon response generation.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">
                      PostgreSQL + pgvector Tenant Boundary
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every semantic vector embedding stored in our knowledge base is indexed with a required <code className="text-primary font-mono text-[11px] bg-primary/10 px-1 py-0.5 rounded">businessId</code> foreign key. Queries are deterministically scoped to your active workspace session.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">
                      No Human Review of Raw Prompt Vectors
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our engineering and support staff never inspect or read your raw prompt vectors unless you explicitly authorize temporary access for a dedicated support ticket.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Information We Collect */}
            <section id="collection" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  Section 03
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Information We Collect
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We collect only the minimum necessary information required to orchestrate campaigns, generate content, and maintain billing accounts:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <KeyRound className="w-4 h-4" />
                    <span>Identity &amp; Credentials</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li>Full name, email address, and avatar</li>
                    <li>Bcrypt-hashed passwords (salted at cost factor 12)</li>
                    <li>Better Auth session tokens and verification state</li>
                    <li>Workspace role (Owner, Admin, Member)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Share2 className="w-4 h-4" />
                    <span>Social Media Tokens</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li>Encrypted OAuth access and refresh tokens</li>
                    <li>Connected profile IDs for X, LinkedIn, IG, FB</li>
                    <li>Publishing permissions granted during OAuth grant</li>
                    <li>Never stores account master passwords</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Content &amp; Knowledge Files</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li>Brand voice profiles and forbidden word linters</li>
                    <li>Uploaded PDFs, website scans, and knowledge vectors</li>
                    <li>Post draft history and scheduled publication queues</li>
                    <li>AI audio narration clips and carousel PDFs</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Server className="w-4 h-4" />
                    <span>Billing &amp; Telemetry</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li>Stripe Customer IDs (no card data held on servers)</li>
                    <li>Seat quotas, token consumption, and tier status</li>
                    <li>Anonymized IP telemetry for DDoS &amp; SSRF defense</li>
                    <li>BullMQ cron execution logs and status codes</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: How We Use Information */}
            <section id="usage" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  Section 04
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                How We Use Information
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                All data collected is utilized solely to provide deterministic SaaS functionality:
              </p>
              <div className="space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><strong>Autonomous Multi-Agent Workflows:</strong> Orchestrating content generation pipelines (e.g. YouTube transcription to LinkedIn carousel).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><strong>Channel Publishing:</strong> Dispatching approved drafts through verified social APIs according to your BullMQ posting schedule.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><strong>Revenue Attribution &amp; Analytics:</strong> Calculating organic reach acceleration, click-through rates, and lead pipeline conversion ROI.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><strong>Security &amp; Defenses:</strong> Validating outbound target URLs via <code className="text-primary font-mono text-[11px] bg-primary/10 px-1 py-0.5 rounded">SecurityService.validateSafeUrl()</code> to protect against Server-Side Request Forgery.</span>
                </div>
              </div>
            </section>

            {/* Section 5: AI Sub-Processors */}
            <section id="ai-providers" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  Section 05
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                AI Sub-Processors &amp; External Model Providers
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                To provide state-of-the-art multimodal generation, SocialAI dynamically routes requests to verified sub-processors under binding Business Associate and Data Processing Agreements (DPAs):
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-border rounded-xl">
                  <thead>
                    <tr className="bg-secondary/70 border-b border-border text-foreground font-mono uppercase">
                      <th className="py-3 px-4">Sub-Processor</th>
                      <th className="py-3 px-4">Function</th>
                      <th className="py-3 px-4">Data Retention</th>
                      <th className="py-3 px-4">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-muted-foreground">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-foreground">OpenAI Inc.</td>
                      <td className="py-3 px-4">Text generation &amp; embedding</td>
                      <td className="py-3 px-4 text-emerald-400 font-mono">0 Days (Stateless)</td>
                      <td className="py-3 px-4">United States</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-foreground">Anthropic PBC</td>
                      <td className="py-3 px-4">Claude 3.5 Sonnet writing</td>
                      <td className="py-3 px-4 text-emerald-400 font-mono">0 Days (Stateless)</td>
                      <td className="py-3 px-4">United States</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-foreground">OpenRouter</td>
                      <td className="py-3 px-4">Dev router &amp; model arena</td>
                      <td className="py-3 px-4 text-emerald-400 font-mono">0 Days (No Logs)</td>
                      <td className="py-3 px-4">Global / US</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-foreground">Amazon Web Services</td>
                      <td className="py-3 px-4">S3 asset storage &amp; RDS</td>
                      <td className="py-3 px-4 font-mono">Subscription Term</td>
                      <td className="py-3 px-4">US-East (Encrypted)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-foreground">Stripe Inc.</td>
                      <td className="py-3 px-4">Payment processing &amp; tax</td>
                      <td className="py-3 px-4 font-mono">PCI-DSS Compliant</td>
                      <td className="py-3 px-4">United States</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6: Retention & Deletion */}
            <section id="retention-deletion" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  Section 06
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Data Retention &amp; Erasure Rights
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                You possess irrevocable control over your workspace information:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Download className="w-4 h-4" />
                    <span>Data Portability (1-Click Export)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Export your complete database of scheduled posts, campaign metrics, brand voices, and AI articles in standardized JSON and CSV formats at any time from your settings console.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <Trash2 className="w-4 h-4" />
                    <span>Immediate Purge (Right to be Forgotten)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When you delete an asset, draft, or workspace, our backend immediately triggers a hard delete across PostgreSQL records, pgvector index points, and AWS S3 media storage.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: Security Measures */}
            <section id="security-measures" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Section 07 — Technical Safeguards
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Enterprise Security &amp; Encryption Standards
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Our infrastructure is engineered with defense-in-depth security principles:
              </p>

              <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <div className="p-3.5 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                  <span>TLS 1.3 Transmission with HSTS (Strict-Transport-Security)</span>
                  <span className="text-emerald-400 font-mono font-bold text-xs">ENFORCED</span>
                </div>
                <div className="p-3.5 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                  <span>AES-256 Volume &amp; Database Encryption at Rest</span>
                  <span className="text-emerald-400 font-mono font-bold text-xs">ENFORCED</span>
                </div>
                <div className="p-3.5 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                  <span>SSRF Defense Engine with RFC 1918 &amp; Cloud IMDS Blocking</span>
                  <span className="text-emerald-400 font-mono font-bold text-xs">ACTIVE</span>
                </div>
                <div className="p-3.5 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                  <span>Automated 58-Suite CI/CD Cybersecurity Regression Testing</span>
                  <span className="text-emerald-400 font-mono font-bold text-xs">PASSED</span>
                </div>
              </div>
            </section>

            {/* Section 8: GDPR & CCPA Compliance */}
            <section id="compliance-gdpr" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  Section 08
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                GDPR &amp; CCPA/CPRA Compliance
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We support and comply with major global data privacy frameworks:
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <p>
                  <strong>For European Economic Area (EEA) &amp; UK Residents:</strong> In accordance with the General Data Protection Regulation (GDPR), you possess rights of access, rectification, erasure, restriction of processing, data portability, and the right to lodge a complaint with your local supervisory authority.
                </p>
                <p>
                  <strong>For California Residents:</strong> Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), you have the right to know what personal information is collected, request deletion, and opt-out of data sharing. <strong>SocialAI does not sell or share personal data with third-party advertisers.</strong>
                </p>
              </div>
            </section>

            {/* Section 9: Contact & DPO */}
            <section id="contact-dpo" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  Section 09
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Contact Our Data Protection Officer (DPO)
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                If you have questions, inquiries regarding our sub-processors, or wish to exercise your data protection rights, please contact our legal and compliance desk:
              </p>

              <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">
                    SocialAI Legal &amp; Data Privacy Office
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Attn: Data Protection Officer (DPO)
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Email: <a href="mailto:privacy@socialai.io" className="text-primary hover:underline font-bold">privacy@socialai.io</a>
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Turnaround SLA: Within 24-48 business hours
                  </p>
                </div>

                <a
                  href="mailto:privacy@socialai.io?subject=Privacy%20Inquiry%20-%20Data%20Subject%20Request"
                  className="px-6 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-full hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20 shrink-0 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Submit DSR Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
