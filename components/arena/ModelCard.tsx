"use client";

import { ModelExecutionResult, SUPPORTED_ARENA_MODELS } from "@/features/ai_arena/types/ai-arena.types";
import { Clock, DollarSign, Cpu, Copy, Check, ThumbsUp, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ModelCardProps {
  result: ModelExecutionResult;
  isRecommended?: boolean;
  isFastest?: boolean;
  isCheapest?: boolean;
}

export function ModelCard({
  result,
  isRecommended,
  isFastest,
  isCheapest,
}: ModelCardProps) {
  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState(false);

  const meta = SUPPORTED_ARENA_MODELS[result.modelId];

  const handleCopy = () => {
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    toast.success(`Copied output from ${result.modelName}!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = () => {
    setVoted(!voted);
    if (!voted) {
      toast.success(`Marked ${result.modelName} as the winner! 🏆`);
    }
  };

  return (
    <div
      className={`rounded-2xl border bg-card p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden shadow-sm ${isRecommended
          ? "border-primary/60 ring-2 ring-primary/20 shadow-lg shadow-primary/5"
          : "border-border hover:border-border/80"
        }`}
    >
      {/* Top Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground">{result.modelName}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${meta?.badgeColor || "bg-muted text-muted-foreground"}`}>
              {result.provider}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isRecommended && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Recommended</span>
              </span>
            )}
            {isFastest && !isRecommended && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ⚡ Fastest
              </span>
            )}
            {isCheapest && !isRecommended && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                💰 Lowest Cost
              </span>
            )}
          </div>
        </div>

        {/* Telemetry Strip: Latency, Cost, Tokens */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{(result.latencyMs / 1000).toFixed(2)}s</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>${result.estimatedCostUsd.toFixed(5)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>{result.totalTokens} tok</span>
          </div>
        </div>

        {/* Main Content Box */}
        <div className="pt-2">
          {result.status === "ERROR" ? (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{result.output}</span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-background border border-border/80 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto font-sans">
              {result.output}
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
        <button
          onClick={handleVote}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${voted
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{voted ? "Winner Selected" : "Vote Winner"}</span>
        </button>

        <button
          onClick={handleCopy}
          disabled={result.status === "ERROR"}
          className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all disabled:opacity-30"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}
