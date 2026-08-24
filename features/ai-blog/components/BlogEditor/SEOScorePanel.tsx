"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Wand2,
  Loader2,
} from "lucide-react";
import type { SEOReport } from "../../types/blog.types";
import { useAnimatedScore } from "../../hooks/use-animated-score";

interface SEOScorePanelProps {
  report: SEOReport | null;
  onRegenerate?: () => Promise<void>;
  isRegenerating?: boolean;
  onApplySuggestions?: () => Promise<void>;
  isApplying?: boolean;
}

const SHIMMER_CLASS = "animate-pulse bg-slate-800/60 rounded";

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const animatedScore = useAnimatedScore(score);
  const radius = size * 0.375;
  const strokeWidth = size * 0.083;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return { text: "text-emerald-500", stroke: "stroke-emerald-500" };
    if (s >= 55) return { text: "text-amber-500", stroke: "stroke-amber-500" };
    return { text: "text-red-500", stroke: "stroke-red-500" };
  };

  const color = getColor(animatedScore);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="rgba(30, 41, 59, 0.5)"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          className={`transition-all duration-500 ease-out ${color.stroke}`}
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
        <span className="text-2xl font-black text-white leading-none tabular-nums">
          {animatedScore}
        </span>
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
          Score
        </span>
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading?: boolean;
}) {
  const animatedVal = useAnimatedScore(value);

  if (loading) {
    return (
      <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 space-y-1.5">
        <div className={`h-3 w-16 ${SHIMMER_CLASS}`} />
        <div className={`h-1.5 w-full ${SHIMMER_CLASS}`} />
      </div>
    );
  }

  const getBarColor = (v: number) => {
    if (v >= 80) return "bg-emerald-500";
    if (v >= 55) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">{label}</span>
        <span className="text-[11px] font-bold text-slate-200 tabular-nums">{animatedVal}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(animatedVal)}`}
          style={{ width: `${animatedVal}%` }}
        />
      </div>
    </div>
  );
}

function IssueCard({
  issue,
  index,
}: {
  issue: SEOReport["issues"][0];
  index: number;
}) {
  const severityIcon = {
    error: <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />,
    warning: <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />,
    info: <HelpCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />,
  };

  const severityBg = {
    error: "border-red-500/10 bg-red-500/5",
    warning: "border-amber-500/10 bg-amber-500/5",
    info: "border-blue-500/10 bg-blue-500/5",
  };

  return (
    <div
      className={`rounded-lg p-3 border flex items-start gap-2.5 transition-all duration-300 animate-in fade-in slide-in-from-top-1 ${severityBg[issue.severity]}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {severityIcon[issue.severity]}
      <div className="space-y-1 text-xs min-w-0">
        <div className="font-bold text-slate-200">{issue.message}</div>
        <div className="text-slate-400 leading-relaxed">{issue.suggestion}</div>
      </div>
    </div>
  );
}

function ShimmerPlaceholder() {
  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-6 p-5 rounded-xl border border-slate-900 ${SHIMMER_CLASS}`}>
        <div className="h-24 w-24 rounded-full bg-slate-800/80" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-slate-800/80 rounded" />
          <div className="h-3 w-48 bg-slate-800/60 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-2.5 rounded-lg border border-slate-900 space-y-1.5">
            <div className="h-3 w-16 bg-slate-800/60 rounded" />
            <div className="h-1.5 w-full bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SEOScorePanel({
  report,
  onRegenerate,
  isRegenerating = false,
  onApplySuggestions,
  isApplying = false,
}: SEOScorePanelProps) {
  const [showAll, setShowAll] = useState(false);

  const sortedIssues = useMemo(() => {
    if (!report?.issues) return [];
    const order = { error: 0, warning: 1, info: 2 };
    return [...report.issues].sort((a, b) => order[a.severity] - order[b.severity]);
  }, [report?.issues]);

  const visibleIssues = showAll ? sortedIssues : sortedIssues.slice(0, 6);

  const score = report?.overallScore ?? 0;

  if (isRegenerating) {
    return (
      <div className="space-y-6">
        <ShimmerPlaceholder />
        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Re-analyzing SEO...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-500 text-sm">
          Save or update content to run SEO analysis.
        </div>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold
              text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20
              rounded-lg px-3 py-2 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Run SEO Analysis
          </button>
        )}
      </div>
    );
  }

  const issueCount = sortedIssues.length;

  return (
    <div className="space-y-6">
      {/* Score ring + grade */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-slate-900/20 p-5 rounded-xl border border-slate-900">
        <ScoreRing score={score} />
        <div className="text-center sm:text-left space-y-1 flex-1">
          <h4 className="font-bold text-white text-sm">
            {score >= 80
              ? "Excellent SEO Health"
              : score >= 55
                ? "Needs Improvement"
                : "Critical Issues Found"}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            {score >= 80
              ? "Your content is well-optimized and ready to rank."
              : score >= 55
                ? "Review the suggestions below to improve your SEO score."
                : "Major SEO issues detected. Address errors first for better visibility."}
          </p>
        </div>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 text-xs font-semibold shrink-0
              text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              rounded-lg px-3 py-2 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Re-analyze</span>
          </button>
        )}
      </div>

      {/* Category breakdown */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Breakdown
        </h5>
        <div className="grid grid-cols-2 gap-3">
          <BreakdownBar label="Title" value={report.titleScore} />
          <BreakdownBar label="Meta Desc" value={report.metaDescriptionScore} />
          <BreakdownBar label="Headings" value={report.headingStructureScore} />
          <BreakdownBar label="Keywords" value={report.keywordDensityScore} />
          <BreakdownBar label="Readability" value={report.readabilityScore} />
          <BreakdownBar label="Content" value={report.contentLengthScore} />
        </div>
      </div>

      {/* Auto-fix button */}
      {onApplySuggestions && issueCount > 0 && (
        <button
          onClick={onApplySuggestions}
          disabled={isApplying}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold
            bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500
            text-white disabled:opacity-50 disabled:cursor-not-allowed
            rounded-xl px-4 py-3 transition-all duration-200 shadow-lg shadow-blue-600/20"
        >
          {isApplying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Applying SEO Optimizations...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Apply SEO Suggestions ({issueCount})
            </>
          )}
        </button>
      )}

      {/* Issues checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            SEO Suggestion List
            {issueCount > 0 && (
              <span className="ml-1.5 text-slate-500 font-mono">({issueCount})</span>
            )}
          </h5>
        </div>

        {issueCount === 0 ? (
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4 flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h6 className="font-bold text-emerald-400">Zero issues found!</h6>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Your post is fully optimized with excellent keyword placements and structured hierarchy.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleIssues.map((issue, idx) => (
              <IssueCard key={`${issue.type}-${idx}`} issue={issue} index={idx} />
            ))}
            {sortedIssues.length > 6 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-xs text-blue-400 hover:text-blue-300 font-semibold py-2 transition-colors"
              >
                {showAll
                  ? "Show fewer"
                  : `Show all ${sortedIssues.length} issues`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
