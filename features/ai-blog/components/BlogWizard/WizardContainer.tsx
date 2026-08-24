"use client";

import { useState } from "react";
import { TopicStep } from "./TopicStep";
import { ToneStep } from "./ToneStep";
import { OutlineStep } from "./OutlineStep";
import { GenerateStep } from "./GenerateStep";
import type { BlogOutline } from "../../types/blog.types";

export default function WizardContainer() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    topic: "",
    targetKeywords: [] as string[],
    secondaryKeywords: [] as string[],
    tone: "PROFESSIONAL",
    language: "en",
    outline: null as BlogOutline | null,
  });

  const updateData = (fields: Partial<typeof data>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const steps = [
    { number: 1, label: "Topic & Keywords" },
    { number: 2, label: "Tone & Voice" },
    { number: 3, label: "Refine Outline" },
    { number: 4, label: "Write Article" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Steps Indicator Progress bar */}
      <div className="relative flex items-center justify-between max-w-xl mx-auto px-2 sm:px-0">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-900 -z-10" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 transition-all duration-500 -z-10"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((s) => (
          <div key={s.number} className="flex flex-col items-center gap-1 sm:gap-2">
            <div
              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 border ${
                step >= s.number
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-500"
              }`}
            >
              {s.number}
            </div>
            <span className={`hidden sm:block text-[10px] sm:text-xs font-semibold leading-tight text-center ${step >= s.number ? "text-slate-200" : "text-slate-500"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main step container */}
      <div className="bg-slate-900/10 border border-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-md">
        {step === 1 && (
          <TopicStep data={data} updateData={updateData} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <ToneStep data={data} updateData={updateData} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <OutlineStep data={data} updateData={updateData} onNext={() => setStep(4)} onBack={() => setStep(2)} />
        )}
        {step === 4 && (
          <GenerateStep data={data} />
        )}
      </div>
    </div>
  );
}
