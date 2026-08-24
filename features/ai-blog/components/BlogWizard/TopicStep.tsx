"use client";

import { useState } from "react";
import { Sparkles, Key, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TopicStepProps {
  data: {
    topic: string;
    targetKeywords: string[];
    secondaryKeywords: string[];
  };
  updateData: (fields: Partial<TopicStepProps["data"]>) => void;
  onNext: () => void;
}

export function TopicStep({ data, updateData, onNext }: TopicStepProps) {
  const [primaryInput, setPrimaryInput] = useState(data.targetKeywords[0] || "");
  const [secondaryInput, setSecondaryInput] = useState(data.secondaryKeywords.join(", "));
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!data.topic.trim()) {
      setError("Please describe the topic or objective for the blog article.");
      return;
    }

    if (!primaryInput.trim()) {
      setError("At least one primary focus keyword is required for SEO targeting.");
      return;
    }

    setError("");

    const primaryKeywords = primaryInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const secondaryKeywords = secondaryInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    updateData({
      targetKeywords: primaryKeywords,
      secondaryKeywords,
    });

    onNext();
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          Define Topic & Target Keywords
        </h2>
        <p className="text-slate-400 text-sm">
          Specify what you want to write about, along with the key search terms you want to rank for.
        </p>
      </div>

      <div className="space-y-4">
        {/* Topic Input */}
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-slate-300 font-semibold">
            Article Topic or Core Concept
          </Label>
          <Input
            id="topic"
            placeholder="e.g., How to Scale Organic Traffic for SaaS Businesses in 2026"
            value={data.topic}
            onChange={(e) => updateData({ topic: e.target.value })}
            className="bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700"
          />
        </div>

        {/* Primary Keyword */}
        <div className="space-y-2">
          <Label htmlFor="primaryKeyword" className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Key className="h-4 w-4 text-emerald-500" />
            Primary Keyword (SEO focus)
          </Label>
          <Input
            id="primaryKeyword"
            placeholder="e.g., saas organic traffic"
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value)}
            className="bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700"
          />
          <p className="text-xs text-slate-500">
            This will be targeted as the primary keyword for title placement, density, and first paragraph scoring.
          </p>
        </div>

        {/* Secondary Keywords */}
        <div className="space-y-2">
          <Label htmlFor="secondaryKeywords" className="text-slate-300 font-semibold">
            Secondary Keywords (comma separated)
          </Label>
          <Input
            id="secondaryKeywords"
            placeholder="e.g., saas SEO strategy, lead generation, organic marketing"
            value={secondaryInput}
            onChange={(e) => setSecondaryInput(e.target.value)}
            className="bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700"
          />
          <p className="text-xs text-slate-500">
            These are auxiliary LSI/semantic terms targeted for natural coverage.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold mt-4"
        >
          Generate Outline Step
        </Button>
      </div>
    </div>
  );
}
