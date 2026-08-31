"use client";

import React, { useState, useEffect } from "react";
import { SocialListeningReport } from "@/features/social_listening/types/social-listening.types";
import {
  Radar,
  TrendingUp,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Users,
  BarChart3,
  ThumbsUp,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

export default function SocialListeningPage() {
  const [report, setReport] = useState<SocialListeningReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const STORAGE_KEY = "socialai_listening_report_latest";

  const fetchRadar = async (showToast = false) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/social-listening/radar");
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.report));
        } catch (e) {}
        if (showToast) toast.success("Social radar synchronized with live channels");
      }
    } catch (err) {
      console.warn("Failed to load listening report:", err);
      if (showToast) toast.error("Failed to refresh social radar");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Hydrate immediately from local storage on hard refresh
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.mentions)) {
          setReport(parsed);
          setIsLoading(false);
        }
      }
    } catch (e) {}

    fetchRadar();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-card via-card/80 to-muted/40 border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Social Listening & Competitor Sentiment Radar
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Real-time omnichannel brand monitoring across X, Reddit, and LinkedIn with AI threat detection.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchRadar(true)}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Radar</span>
        </button>
      </div>

      {isLoading && !report ? (
        <div className="p-16 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary opacity-60" />
          <p>Scanning social networks for brand mentions and sentiment signals...</p>
        </div>
      ) : report ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Executive AI Briefing Box */}
          <div className="p-5 sm:p-6 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <Sparkles className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-foreground">AI Intelligence Briefing</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {report.aiExecutiveSummary}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-emerald-500">{report.overallSentimentScore}/100</span>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Brand Health</p>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Tracked Mentions</span>
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{report.totalMentionsTracked}</div>
              <div className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>+24% vs last week</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Positive Sentiment</span>
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-500">{report.sentimentDistribution.positive}%</div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {report.sentimentDistribution.neutral}% neutral, {report.sentimentDistribution.negative}% neg
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Top Competitor</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-foreground">{report.competitors[0]?.competitorName}</div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {report.competitors[0]?.shareOfVoice}% Share of Voice
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Sentiment Risk</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-500">LOW</div>
              <div className="text-[11px] text-muted-foreground font-mono">0 critical threats</div>
            </div>
          </div>

          {/* Two Columns: Live Mentions on Left, Competitor Radar & Keywords on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Live Mentions Feed */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span>Real-Time Omnichannel Mentions</span>
                </h3>
                <span className="text-xs font-mono text-muted-foreground">Live Feed</span>
              </div>

              <div className="space-y-3">
                {report.mentions.map((mention) => (
                  <div
                    key={mention.id}
                    className="p-5 rounded-3xl bg-card border border-border space-y-3 shadow-sm hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted font-bold">
                          {mention.platform}
                        </span>
                        <span className="font-semibold text-xs text-foreground">{mention.author}</span>
                        <span className="text-[11px] text-muted-foreground">{mention.authorHandle}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          mention.sentiment === "POSITIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : mention.sentiment === "NEGATIVE"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {mention.sentiment}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed">{mention.content}</p>

                    {mention.aiSuggestedAction && (
                      <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 text-[11px] text-primary flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-foreground">AI Action:</strong> {mention.aiSuggestedAction}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-2.5">
                      <span>{mention.timestamp}</span>
                      <span className="font-mono">Score: {mention.engagementScore} eng</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Competitor Radar & Trending Topics */}
            <div className="lg:col-span-5 space-y-6">
              {/* Competitor Radar Table */}
              <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>Competitor Share of Voice</span>
                </h3>

                <div className="space-y-4">
                  {report.competitors.map((comp) => (
                    <div key={comp.competitorName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground">{comp.competitorName}</span>
                        <span className="font-mono text-muted-foreground">{comp.shareOfVoice}% SoV</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-primary rounded-full"
                          style={{ width: `${comp.shareOfVoice}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>{comp.weeklyPostCount} posts/wk</span>
                        <span>Trend: {comp.topTrendingTopic}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Keywords */}
              <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-400" />
                  <span>Top Market Keywords</span>
                </h3>

                <div className="flex flex-wrap gap-2">
                  {report.trendingKeywords.map((tk) => (
                    <div
                      key={tk.keyword}
                      className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-mono flex items-center gap-2 shadow-sm"
                    >
                      <span className="text-foreground font-semibold">{tk.keyword}</span>
                      <span className="text-[10px] text-muted-foreground">({tk.volume})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
