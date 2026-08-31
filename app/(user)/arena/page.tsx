"use client";

import React, { useState, useEffect } from "react";
import {
  ArenaComparisonResponse,
  SupportedModelId,
  SUPPORTED_ARENA_MODELS,
} from "@/features/ai_arena/types/ai-arena.types";
import { ModelCard } from "@/components/arena/ModelCard";
import { Swords, Sparkles, RefreshCw, Zap, Sliders, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function AIArenaPage() {
  const [prompt, setPrompt] = useState(
    "Draft an attention-grabbing LinkedIn post announcing our new AI Multi-Agent orchestration engine for enterprise marketing automation."
  );
  const [selectedModels, setSelectedModels] = useState<SupportedModelId[]>([
    "gpt-4o",
    "claude-3-5-sonnet",
    "deepseek-r1",
    "gemini-2-0-flash",
  ]);
  const [temperature, setTemperature] = useState(0.7);
  const [isRunning, setIsRunning] = useState(false);
  const [comparison, setComparison] = useState<ArenaComparisonResponse | null>(null);

  const STORAGE_ARENA_KEY = "socialai_arena_comparison_latest";
  const STORAGE_FORM_KEY = "socialai_arena_form_latest";

  // Hydrate on mount / hard refresh
  useEffect(() => {
    try {
      const savedComparison = localStorage.getItem(STORAGE_ARENA_KEY);
      if (savedComparison) {
        const parsed = JSON.parse(savedComparison);
        if (parsed && Array.isArray(parsed.results) && parsed.results.length > 0) {
          setComparison(parsed);
          if (parsed.prompt) setPrompt(parsed.prompt);
        }
      }

      const savedForm = localStorage.getItem(STORAGE_FORM_KEY);
      if (savedForm) {
        const parsedForm = JSON.parse(savedForm);
        if (parsedForm.prompt) setPrompt(parsedForm.prompt);
        if (parsedForm.selectedModels && Array.isArray(parsedForm.selectedModels)) {
          setSelectedModels(parsedForm.selectedModels);
        }
        if (parsedForm.temperature) setTemperature(parsedForm.temperature);
      }
    } catch (e) {
      console.warn("Error reading arena data from local storage", e);
    }
  }, []);

  const toggleModel = (id: SupportedModelId) => {
    if (selectedModels.includes(id)) {
      if (selectedModels.length <= 1) {
        toast.error("Select at least 1 model to benchmark");
        return;
      }
      setSelectedModels(selectedModels.filter((m) => m !== id));
    } else {
      setSelectedModels([...selectedModels, id]);
    }
  };

  const handleRunComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsRunning(true);
    try {
      const res = await fetch("/api/ai-arena/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          models: selectedModels,
          temperature,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Comparison failed");
      }

      setComparison(data.comparison);

      // Persist to local storage immediately
      try {
        localStorage.setItem(STORAGE_ARENA_KEY, JSON.stringify(data.comparison));
        localStorage.setItem(
          STORAGE_FORM_KEY,
          JSON.stringify({ prompt, selectedModels, temperature })
        );
      } catch (storeErr) {
        console.warn("Storage error", storeErr);
      }

      toast.success(
        `Benchmarked ${data.comparison.results.length} models in ${(
          data.comparison.totalExecutionTimeMs / 1000
        ).toFixed(2)}s!`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to run comparison");
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setComparison(null);
    try {
      localStorage.removeItem(STORAGE_ARENA_KEY);
    } catch (e) {}
    toast.info("Cleared benchmark results");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-card via-card/80 to-muted/40 border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Swords className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              AI Multi-Model Arena
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Benchmark Claude 3.5 Sonnet, GPT-4o, DeepSeek-R1, and Gemini 2.0 side-by-side with live latency & token cost telemetry.
            </p>
          </div>
        </div>

        {comparison && (
          <button
            onClick={handleClear}
            className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-all self-start sm:self-auto"
            title="Clear benchmark results"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Arena</span>
          </button>
        )}
      </div>

      {/* Input Prompt & Model Selector Console */}
      <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border space-y-6 shadow-sm">
        <form onSubmit={handleRunComparison} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Test Prompt / Generation Directive
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to compare creative reasoning, tone, latency and cost..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-sans"
            />
          </div>

          {/* Model Toggle Chips */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Competitor Models
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(SUPPORTED_ARENA_MODELS) as SupportedModelId[]).map((id) => {
                const model = SUPPORTED_ARENA_MODELS[id];
                const isSelected = selectedModels.includes(id);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleModel(id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30 text-foreground"
                        : "border-border bg-background/50 hover:bg-muted/40 text-muted-foreground opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-foreground">{model.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border bg-card">
                        {model.provider}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground mb-3 line-clamp-2">
                      {model.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono border-t border-border/50 pt-2 text-muted-foreground">
                      <span>Window: {model.contextWindow}</span>
                      <span>${model.costPer1kOutputTokens}/1k tokens</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature slider & Run Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Sliders className="w-4 h-4 text-primary" />
              <span>Creativity / Temperature: {temperature}</span>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-28 accent-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isRunning || !prompt.trim() || selectedModels.length === 0}
              className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{isRunning ? "Running Parallel Inference..." : "Launch Arena Benchmark"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Summary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-card to-primary/5 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Recommendation & Telemetry Insights</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                Recommended Model:{" "}
                <span className="text-primary font-bold">
                  {SUPPORTED_ARENA_MODELS[comparison.recommendedModelId]?.name ||
                    comparison.recommendedModelId}
                </span>
              </p>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {comparison.recommendationReason}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-xl bg-background border border-border">
                ⚡ Fastest: <span className="text-emerald-400 font-bold">{comparison.fastestModelId}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-background border border-border">
                💰 Most Cost Efficient:{" "}
                <span className="text-blue-400 font-bold">{comparison.cheapestModelId}</span>
              </div>
            </div>
          </div>

          {/* Model Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparison.results.map((res) => (
              <ModelCard key={res.modelId} result={res} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
