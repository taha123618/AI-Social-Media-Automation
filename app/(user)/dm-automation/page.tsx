"use client";

import React, { useState, useEffect } from "react";
import { AutoReplyRule, DMPlatform, SimulateDMResponse } from "@/features/dm_automation/types/dm-automation.types";
import {
  MessageSquare,
  Bot,
  Send,
  Plus,
  Zap,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";

export default function DMAutomationPage() {
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulation State
  const [simPlatform, setSimPlatform] = useState<DMPlatform>("INSTAGRAM");
  const [simSender, setSimSender] = useState("Sarah Jenkins");
  const [simMessage, setSimMessage] = useState("Hey, how much are your monthly plans and can we book a quick demo?");
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulateDMResponse | null>(null);

  // New Rule Modal
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [rulePlatform, setRulePlatform] = useState<DMPlatform>("INSTAGRAM");
  const [ruleKeywords, setRuleKeywords] = useState("pricing, cost, how much, demo");
  const [ruleTemplate, setRuleTemplate] = useState("Thanks for reaching out! Check our transparent pricing or book a call.");

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/dm-automation/rules");
      const data = await res.json();
      if (data.rules) setRules(data.rules);
    } catch (err) {
      console.warn("Failed to load rules:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;

    setSimulating(true);
    try {
      const res = await fetch("/api/dm-automation/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: "active-workspace",
          platform: simPlatform,
          senderName: simSender,
          messageText: simMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation error");

      setSimResult(data.reply);
      toast.success("AI DM reply generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to simulate DM");
    } finally {
      setSimulating(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !ruleKeywords.trim()) {
      toast.error("Please fill in required rule fields");
      return;
    }

    try {
      const keywordsArray = ruleKeywords.split(",").map((k) => k.trim()).filter(Boolean);
      const res = await fetch("/api/dm-automation/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: "active-workspace",
          name: ruleName,
          platform: rulePlatform,
          triggerKeywords: keywordsArray,
          replyTemplate: ruleTemplate,
          aiEnhance: true,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save rule");

      toast.success("Auto-reply rule created!");
      setIsCreatingRule(false);
      setRuleName("");
      fetchRules();
    } catch (err: any) {
      toast.error(err.message || "Rule creation failed");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-card via-card/80 to-muted/40 border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Autonomous Social DM & Comment Bot
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Automate customer replies, lead capture, and appointment bookings on Instagram, LinkedIn, and Facebook.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingRule(!isCreatingRule)}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-primary/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreatingRule ? "Cancel" : "Add Trigger Rule"}</span>
        </button>
      </div>

      {/* Rule Creator */}
      {isCreatingRule && (
        <form onSubmit={handleCreateRule} className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-foreground">Configure New Auto-Reply Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Rule Name</label>
              <input
                type="text"
                required
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g. Pricing FAQ Responder"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Platform</label>
              <select
                value={rulePlatform}
                onChange={(e: any) => setRulePlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              >
                <option value="INSTAGRAM">Instagram DMs</option>
                <option value="LINKEDIN">LinkedIn InMail</option>
                <option value="FACEBOOK">Facebook Messenger</option>
                <option value="TWITTER">X (Twitter) DMs</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Trigger Keywords (comma separated)</label>
              <input
                type="text"
                required
                value={ruleKeywords}
                onChange={(e) => setRuleKeywords(e.target.value)}
                placeholder="pricing, cost, quote, price"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Base Reply / Knowledge Guidance</label>
            <textarea
              value={ruleTemplate}
              onChange={(e) => setRuleTemplate(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
            >
              Save Rule
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Rules list on left, Live Simulator on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Rules */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Configured Triggers ({rules.length})
          </h2>

          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r.id} className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{r.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {r.platform}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{r.triggerCount} triggered</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {r.triggerKeywords.map((kw) => (
                    <span key={kw} className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      #{kw}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground bg-background p-2.5 rounded-xl border border-border/70 line-clamp-2">
                  {r.replyTemplate}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Chat Bot Simulator */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Interactive DM Simulator</span>
          </h2>

          <div className="p-6 rounded-3xl bg-card border border-border space-y-5 shadow-sm">
            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Channel</label>
                  <select
                    value={simPlatform}
                    onChange={(e: any) => setSimPlatform(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-xs"
                  >
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="TWITTER">X (Twitter)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Customer Name</label>
                  <input
                    type="text"
                    value={simSender}
                    onChange={(e) => setSimSender(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Incoming Direct Message</label>
                <textarea
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{simulating ? "Processing AI Intent..." : "Simulate Incoming DM"}</span>
              </button>
            </form>

            {/* Chat Simulator Bubbles */}
            {simResult && (
              <div className="space-y-4 pt-4 border-t border-border">
                {/* Incoming Message Bubble */}
                <div className="flex flex-col items-start space-y-1">
                  <span className="text-[10px] text-muted-foreground px-1">{simSender}</span>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-muted text-foreground text-xs max-w-[85%]">
                    {simMessage}
                  </div>
                </div>

                {/* AI Bot Response Bubble */}
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-primary px-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Assistant Auto-Reply</span>
                  </div>
                  <div className="p-3 rounded-2xl rounded-tr-none bg-primary text-primary-foreground text-xs max-w-[85%] shadow-md">
                    {simResult.replyText}
                  </div>
                </div>

                {/* Intent & Metadata Strip */}
                <div className="p-3 rounded-xl bg-background border border-border/80 text-[11px] grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Intent:</span>{" "}
                    <span className="font-bold text-foreground capitalize">{simResult.intent.replace("_", " ")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>{" "}
                    <span className="font-bold text-emerald-500">{simResult.confidenceScore}%</span>
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    Action: <span className="text-foreground">{simResult.recommendedAction}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
