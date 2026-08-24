"use client";

import { FileText, Clock, AlignLeft, Layers } from "lucide-react";

interface ContentStatsProps {
  stats: {
    wordCount: number;
    readingTime: number;
    sentenceCount: number;
    paragraphCount: number;
  };
}

export function ContentStats({ stats }: ContentStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-900">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
          <FileText className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-lg font-bold text-white">{stats.wordCount}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Words</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
          <Clock className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-lg font-bold text-white">{stats.readingTime} min</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Read Time</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
          <AlignLeft className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-lg font-bold text-white">{stats.sentenceCount}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sentences</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
          <Layers className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-lg font-bold text-white">{stats.paragraphCount}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Paragraphs</div>
        </div>
      </div>
    </div>
  );
}
