"use client";

import { Check, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ToneStepProps {
  data: {
    tone: string;
    language: string;
  };
  updateData: (fields: Partial<ToneStepProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TONES = [
  { id: "PROFESSIONAL", name: "Professional", desc: "Polished, authoritative, business-standard" },
  { id: "CONVERSATIONAL", name: "Conversational", desc: "Friendly, engaging, reader-focused" },
  { id: "TECHNICAL", name: "Technical", desc: "Precise, deeply detailed, developer/engineer target" },
  { id: "CASUAL", name: "Casual", desc: "Relaxed, informal, contraction-friendly" },
  { id: "PERSUASIVE", name: "Persuasive", desc: "Action-driven, high-converting power words" },
  { id: "STORYTELLING", name: "Storytelling", desc: "Narrative, narrative hooks, case-study ready" },
];

export function ToneStep({ data, updateData, onNext, onBack }: ToneStepProps) {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          Select Tone & Style Voice
        </h2>
        <p className="text-slate-400 text-sm">
          Pick the tone of voice that best aligns with your target audience.
        </p>
      </div>

      <div className="space-y-4">
        {/* Tone Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => updateData({ tone: t.id })}
              className={`p-4 rounded-xl text-left border transition-all duration-300 relative overflow-hidden ${
                data.tone === t.id
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/20"
              }`}
            >
              <div className="font-bold text-sm text-slate-200">{t.name}</div>
              <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
              {data.tone === t.id && (
                <div className="absolute right-3 top-3">
                  <Check className="h-4 w-4 text-blue-400" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Language setting */}
        <div className="space-y-2 pt-4 border-t border-slate-900/60">
          <Label className="text-slate-300 font-semibold">Article Language</Label>
          <select
            value={data.language}
            onChange={(e) => updateData({ language: e.target.value })}
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-slate-700 focus:outline-none"
          >
            <option value="en">English (US/UK)</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4 justify-end">
          <Button variant="secondary" onClick={onBack} className="text-white font-semibold">
            Back
          </Button>
          <Button variant="default" onClick={onNext} className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold">
            Proceed to Outline
          </Button>
        </div>
      </div>
    </div>
  );
}
