"use client";

import { Check, Minus } from "lucide-react";
import React from "react";

const comparisonSections = [
  {
    category: "AI Content & Media Studios",
    items: [
      { name: "AI Social Posts & Captions", free: "5 / mo", starter: "50 / mo", pro: "Unlimited" },
      { name: "AI Visual Carousel Builder", free: "3 decks / mo", starter: "25 decks / mo", pro: "Unlimited" },
      { name: "AI Voice Cloning & Narration", free: "5 mins / mo", starter: "60 mins / mo", pro: "Unlimited" },
      { name: "Brand Voice & Style Guardian Linter", free: "Basic Check", starter: "Advanced Linter", pro: "Real-Time 1-Click Polisher" },
      { name: "AI Blog Articles (Gutenberg)", free: "3 / mo", starter: "50 / mo", pro: "Unlimited" },
      { name: "Article Word Limit", free: "3,000 words", starter: "8,000 words", pro: "Unlimited" },
      { name: "Brand Voice Personas", free: "1 persona", starter: "5 personas", pro: "Unlimited" },
    ]
  },
  {
    category: "Autonomous Agents & Growth Radar",
    items: [
      { name: "Autonomous DM & Lead Bot", free: false, starter: "100 replies / mo", pro: "Unlimited Auto-Replies" },
      { name: "Social Listening & Sentiment Radar", free: false, starter: "1 Brand Tracker", pro: "Omnichannel Radar + Alerts" },
      { name: "Competitor Share of Voice Radar", free: false, starter: "2 Competitors", pro: "Unlimited Competitors" },
      { name: "AI Multi-Model Comparison Arena", free: "Basic", starter: "Standard (4 Models)", pro: "Full Telemetry + Custom Models" },
      { name: "Autonomous Swarm Workflows", free: false, starter: true, pro: true },
    ]
  },
  {
    category: "Publishing, Social & CMS",
    items: [
      { name: "Social Post Scheduling (X, LinkedIn, IG, TikTok)", free: false, starter: true, pro: true },
      { name: "WordPress, Webflow & Ghost CMS Export", free: true, starter: true, pro: true },
      { name: "Real-time Predictive SEO Scorer", free: true, starter: true, pro: true },
      { name: "Revenue Attribution Analytics", free: "Basic", starter: "Advanced", pro: "Full Multi-Touch Attribution" },
    ]
  },
  {
    category: "Enterprise, Ecosystem & Support",
    items: [
      { name: "Enterprise Webhooks Gateway (HMAC SHA-256)", free: false, starter: "3 Endpoints", pro: "Unlimited Endpoints" },
      { name: "Zapier & Make.com No-Code Triggers", free: false, starter: true, pro: true },
      { name: "Team Collaboration & Role RBAC", free: false, starter: false, pro: "Unlimited Seats" },
      { name: "White-Label Reports & Custom Branding", free: false, starter: false, pro: true },
      { name: "Support SLA", free: "Community", starter: "Priority Email", pro: "Dedicated CSM + 99.9% SLA" },
    ]
  }
];

export const FeatureComparison = () => {
  return (
    <div className="py-20 max-w-5xl mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
          MATRIX COMPARISON
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Comprehensive Feature <span className="text-primary">Breakdown</span>
        </h2>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/70">
                <th className="py-3.5 px-5 font-bold text-foreground">Capability</th>
                <th className="py-3.5 px-4 font-bold text-foreground text-center w-28">Free</th>
                <th className="py-3.5 px-4 font-bold text-primary text-center w-36 bg-primary/5">Starter</th>
                <th className="py-3.5 px-4 font-bold text-foreground text-center w-40">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {comparisonSections.map((section) => (
                <React.Fragment key={section.category}>
                  <tr className="bg-muted/20">
                    <td colSpan={4} className="py-2.5 px-5 font-bold uppercase tracking-wider text-[11px] text-foreground/80">
                      {section.category}
                    </td>
                  </tr>
                  {section.items.map((item) => (
                    <tr key={item.name} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-5 text-foreground font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground font-mono">
                        {typeof item.free === "boolean" ? (
                          item.free ? <Check className="w-3.5 h-3.5 text-primary mx-auto" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />
                        ) : (
                          item.free
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-primary bg-primary/5">
                        {typeof item.starter === "boolean" ? (
                          item.starter ? <Check className="w-3.5 h-3.5 text-primary mx-auto" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />
                        ) : (
                          item.starter
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-foreground">
                        {typeof item.pro === "boolean" ? (
                          item.pro ? <Check className="w-3.5 h-3.5 text-primary mx-auto" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />
                        ) : (
                          item.pro
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
