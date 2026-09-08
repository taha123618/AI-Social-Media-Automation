"use client";

import React, { useState } from "react";
import { BrandGuardianAuditResult } from "@/features/brand_guardian/types/brand-guardian.types";
import { ShieldCheck, ShieldAlert, Sparkles, Check, AlertTriangle, RefreshCw, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface BrandGuardianWidgetProps {
  businessId: string;
  text: string;
  platform?: "LINKEDIN" | "TWITTER" | "INSTAGRAM" | "BLOG" | "EMAIL";
  onApplyFix?: (fixedText: string) => void;
}

export function BrandGuardianWidget({
  businessId,
  text,
  platform = "LINKEDIN",
  onApplyFix,
}: BrandGuardianWidgetProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<BrandGuardianAuditResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAudit = async () => {
    if (!text || text.trim().length === 0) {
      toast.error("Please enter some copy to audit");
      return;
    }

    setIsAuditing(true);
    try {
      const res = await fetch("/api/brand-guardian/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          text,
          platform,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to audit copy");
      }

      setResult(data.result);
      setIsOpen(true);
      if (data.result.isCompliant) {
        toast.success(`Score: ${data.result.overallScore}% (Grade ${data.result.grade}) - Brand Compliant!`);
      } else {
        toast.warning(`Score: ${data.result.overallScore}% (Grade ${data.result.grade}) - Suggestions found`);
      }
    } catch (err: any) {
      toast.error(err.message || "Audit failed");
    } finally {
      setIsAuditing(false);
    }
  };

  const gradeColors: Record<string, string> = {
    "A+": "bg-emerald-500 text-white",
    A: "bg-emerald-500 text-white",
    B: "bg-blue-500 text-white",
    C: "bg-amber-500 text-white",
    D: "bg-orange-500 text-white",
    F: "bg-red-500 text-white",
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      {/* Header & Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Brand Guardian Linter</h4>
            <p className="text-[10px] text-muted-foreground">Tone scoring, forbidden word detection & readability</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAudit}
          disabled={isAuditing || !text.trim()}
          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
        >
          {isAuditing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isAuditing ? "Auditing..." : "Audit Copy"}</span>
        </button>
      </div>

      {/* Audit Results Panel */}
      {result && isOpen && (
        <div className="pt-2 border-t border-border space-y-3">
          {/* Top Score Strip */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-muted/40 border border-border">
              <span className="block text-[10px] text-muted-foreground uppercase font-medium">Grade</span>
              <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-md text-xs font-bold ${gradeColors[result.grade] || "bg-muted text-foreground"}`}>
                {result.grade} ({result.overallScore}%)
              </span>
            </div>

            <div className="p-2 rounded-xl bg-muted/40 border border-border">
              <span className="block text-[10px] text-muted-foreground uppercase font-medium">Tone Match</span>
              <span className="text-xs font-bold text-foreground">{result.toneAlignmentScore}%</span>
            </div>

            <div className="p-2 rounded-xl bg-muted/40 border border-border">
              <span className="block text-[10px] text-muted-foreground uppercase font-medium">Reading Ease</span>
              <span className="text-xs font-bold text-foreground">{result.readingEaseScore}/100</span>
            </div>

            <div className="p-2 rounded-xl bg-muted/40 border border-border">
              <span className="block text-[10px] text-muted-foreground uppercase font-medium">Sentiment</span>
              <span className="text-xs font-bold text-primary">{result.sentiment}</span>
            </div>
          </div>

          {/* Analysis Summary */}
          <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/20 p-2.5 rounded-xl">
            "{result.analysisSummary}"
          </p>

          {/* Violations List */}
          {result.violations.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Detected Violations ({result.violations.length})</span>
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {result.violations.map((v) => (
                  <div key={v.id} className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-destructive">
                      <span>{v.type}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-destructive/20">{v.severity}</span>
                    </div>
                    <p className="text-foreground">{v.message}</p>
                    {v.suggestedReplacement && (
                      <p className="text-[11px] text-muted-foreground">
                        Suggested: <span className="text-emerald-500 font-medium">{v.suggestedReplacement}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Check className="w-4 h-4" />
              <span>Zero style violations detected. Ready to publish!</span>
            </div>
          )}

          {/* 1-Click Fix Button */}
          {result.suggestedCopy && result.suggestedCopy !== text && onApplyFix && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onApplyFix(result.suggestedCopy!);
                  toast.success("Applied AI Brand Guardian optimized copy!");
                }}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>1-Click Apply AI Polished Copy</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
