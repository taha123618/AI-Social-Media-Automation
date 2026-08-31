"use client";

import { VoiceId, VoiceProfile, VoiceGenerationResult, AVAILABLE_VOICES } from "@/features/voice_studio/types/voice.types";
import {
  Mic,
  Play,
  Pause,
  Download,
  Sparkles,
  RefreshCw,
  Volume2,
  Sliders,
  Share2,
  Check,
  ShieldCheck,
  Zap,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface VoiceStudioProps {
  businessId?: string;
  planId?: "free" | "starter" | "pro" | "enterprise";
}

export function VoiceStudio({ businessId = "", planId = "free" }: VoiceStudioProps) {
  const [text, setText] = useState(
    "Stop wasting 15 hours a week creating social media content manually. Our AI multi-agent orchestration engine researches trends, drafts posts, and publishes across all channels on autopilot."
  );
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>("nova");
  const [speed, setSpeed] = useState(1.0);
  const [platform, setPlatform] = useState<"INSTAGRAM_REELS" | "TIKTOK" | "YOUTUBE_SHORTS" | "PODCAST">("INSTAGRAM_REELS");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<VoiceGenerationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Storage Keys
  const getResultKey = (bId: string) => `socialai_voice_result_${bId || "default"}`;
  const getFormKey = (bId: string) => `socialai_voice_form_${bId || "default"}`;
  const LATEST_RESULT_KEY = "socialai_voice_result_latest";

  // Hydrate from localStorage on mount / hard refresh
  useEffect(() => {
    try {
      const formStr = localStorage.getItem(getFormKey(businessId)) || localStorage.getItem(getFormKey("default"));
      if (formStr) {
        const form = JSON.parse(formStr);
        if (form.text) setText(form.text);
        if (form.selectedVoice) setSelectedVoice(form.selectedVoice);
        if (form.speed) setSpeed(form.speed);
        if (form.platform) setPlatform(form.platform);
      }

      const resultStr =
        localStorage.getItem(getResultKey(businessId)) ||
        localStorage.getItem(LATEST_RESULT_KEY) ||
        localStorage.getItem(getResultKey("default"));

      if (resultStr) {
        const parsedResult = JSON.parse(resultStr);
        if (parsedResult && (parsedResult.audioUrl || parsedResult.spokenText)) {
          setResult(parsedResult);
          if (parsedResult.voiceId) setSelectedVoice(parsedResult.voiceId);
          if (parsedResult.speed) setSpeed(parsedResult.speed);
        }
      }
    } catch (e) {
      console.warn("Failed to read voice data from local storage", e);
    }
  }, [businessId]);

  // Stop any active speech/audio when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Please enter narration text");
      return;
    }

    // Stop current audio before new generation
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId || undefined,
          text,
          voiceId: selectedVoice,
          speed,
          targetPlatform: platform,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Voice generation failed");

      setResult(data.voice);

      // Persist to local storage immediately
      try {
        const payload = JSON.stringify(data.voice);
        localStorage.setItem(getResultKey(businessId), payload);
        localStorage.setItem(LATEST_RESULT_KEY, payload);
        localStorage.setItem(
          getFormKey(businessId),
          JSON.stringify({ text, selectedVoice, speed, platform })
        );
      } catch (storeErr) {
        console.warn("Storage error", storeErr);
      }

      toast.success("Voice narration synthesized for script!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate voice");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    try {
      localStorage.removeItem(getResultKey(businessId));
      localStorage.removeItem(LATEST_RESULT_KEY);
      localStorage.removeItem(getResultKey("default"));
    } catch (e) {}
    toast.info("Cleared voice preview");
  };

  const togglePlayAudio = () => {
    if (!result) return;

    if (isPlaying) {
      // Pause action
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    // If we have actual synthesized OpenAI audio binary
    if (result.audioUrl && result.audioUrl.startsWith("data:audio")) {
      if (!audioRef.current) {
        audioRef.current = new Audio(result.audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setIsPlaying(false);
          fallbackBrowserSpeech();
        };
      } else {
        audioRef.current.src = result.audioUrl;
      }

      audioRef.current.playbackRate = result.speed || speed;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        fallbackBrowserSpeech();
      });
    } else {
      // Fallback directly to speaking the exact script text via Browser Speech Synthesis
      fallbackBrowserSpeech();
    }
  };

  const fallbackBrowserSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Browser speech playback is not supported on this device.");
      return;
    }

    window.speechSynthesis.cancel();

    const scriptToSpeak = result?.spokenText || text;
    const utterance = new SpeechSynthesisUtterance(scriptToSpeak);
    utterance.rate = result?.speed || speed;

    // Map voice persona to pitch and available browser voices
    const browserVoices = window.speechSynthesis.getVoices();
    if (selectedVoice === "nova" || selectedVoice === "shimmer" || selectedVoice === "rachel" || selectedVoice === "bella") {
      utterance.pitch = 1.15;
      const femaleVoice = browserVoices.find(
        (v) => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("victoria") || v.name.toLowerCase().includes("karen")
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    } else if (selectedVoice === "onyx" || selectedVoice === "echo") {
      utterance.pitch = 0.85;
      const maleVoice = browserVoices.find(
        (v) => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("alex") || v.name.toLowerCase().includes("fred")
      );
      if (maleVoice) utterance.voice = maleVoice;
    } else if (selectedVoice === "fable") {
      utterance.pitch = 1.0;
      const britishVoice = browserVoices.find(
        (v) => v.lang.includes("en-GB") || v.name.toLowerCase().includes("george") || v.name.toLowerCase().includes("oliver")
      );
      if (britishVoice) utterance.voice = britishVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleDownload = () => {
    if (!result) return;
    if (result.audioUrl && result.audioUrl.startsWith("data:audio")) {
      const anchor = document.createElement("a");
      anchor.href = result.audioUrl;
      anchor.download = `voice_${result.voiceId}_${Date.now()}.mp3`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      toast.success("Downloaded narration MP3");
    } else {
      // Download script transcript and audio spec
      const scriptBlob = new Blob([`VOICEOVER SCRIPT:\n${result.spokenText || text}\n\nVOICE: ${result.voiceId}\nSPEED: ${result.speed || speed}x\nPLATFORM: ${platform}`], { type: "text/plain" });
      const scriptUrl = URL.createObjectURL(scriptBlob);
      const anchor = document.createElement("a");
      anchor.href = scriptUrl;
      anchor.download = `voice_script_${result.voiceId}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      toast.success("Downloaded Voiceover Script & Spec");
    }
  };

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-card via-card/80 to-muted/40 border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                AI Voice Cloning & Narration Studio
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">
                {planId === "free" ? "Free Trial" : `${planId} Plan`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Produce natural, high-energy studio voiceovers for Reels, TikToks, Shorts, and Audio Ads in seconds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {result && (
            <button
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-all"
              title="Clear active preview"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {planId === "free" && (
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Upgrade to Unlimited</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Script & Config */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleGenerate} className="p-6 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
            {/* Script Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Voiceover Script / Spoken Narrative
                </label>
                <span className="text-xs font-mono text-muted-foreground">
                  {text.split(/\s+/).filter(Boolean).length} words (~{Math.round(text.split(/\s+/).filter(Boolean).length / 2.5)}s)
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste the narrative script here..."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-sans"
              />
            </div>

            {/* Voice Timbre Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Voice Persona
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AVAILABLE_VOICES.map((v) => {
                  const isSelected = selectedVoice === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVoice(v.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30 text-foreground"
                          : "border-border bg-background/50 hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-foreground">{v.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted">
                          {v.gender}
                        </span>
                      </div>
                      <p className="text-[10px] leading-tight opacity-75 line-clamp-2">
                        {v.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders & Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Pacing / Speed: {speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Target Format</label>
                <select
                  value={platform}
                  onChange={(e: any) => setPlatform(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none"
                >
                  <option value="INSTAGRAM_REELS">Instagram Reels</option>
                  <option value="TIKTOK">TikTok Sound</option>
                  <option value="YOUTUBE_SHORTS">YouTube Shorts</option>
                  <option value="PODCAST">Podcast Audio</option>
                </select>
              </div>
            </div>

            {/* Generate Trigger */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating || !text.trim()}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isGenerating ? "Synthesizing Audio..." : "Generate Studio Voiceover"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Audio Player & Waveform Visualizer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <span>Audio Master Preview</span>
            </h3>

            {result ? (
              <div className="space-y-6">
                {/* Visualizer Waveform Box */}
                <div className="p-6 rounded-2xl bg-background border border-border flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center gap-1.5 h-16 w-full justify-center">
                    {[40, 65, 80, 45, 90, 75, 30, 85, 60, 95, 40, 70, 85, 50, 65, 90, 45, 75, 60, 40].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-300 ${
                          isPlaying ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                        }`}
                        style={{ height: `${isPlaying ? Math.max(15, Math.round(h * (0.6 + 0.4 * Math.random()))) : h}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between w-full text-xs font-mono text-muted-foreground px-2">
                    <span>0:00</span>
                    <span>0:{result.durationSeconds < 10 ? `0${result.durationSeconds}` : result.durationSeconds}</span>
                  </div>
                </div>

                {/* Spoken text quote snippet */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 text-xs text-foreground/90 italic leading-relaxed">
                  &ldquo;{result.spokenText || text}&rdquo;
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={togglePlayAudio}
                    className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-all"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-3.5 rounded-2xl border border-border hover:bg-muted text-foreground transition-all flex items-center gap-2 text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Narration</span>
                  </button>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 p-4 rounded-2xl border border-border/60">
                  <div>
                    <span className="text-muted-foreground">Voice:</span>{" "}
                    <span className="font-semibold text-foreground capitalize">{result.voiceId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    <span className="font-semibold text-foreground">{result.durationSeconds}s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Words:</span>{" "}
                    <span className="font-semibold text-foreground">{result.wordCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Engine:</span>{" "}
                    <span className="font-semibold text-foreground capitalize">
                      {result.source === "openai_tts" ? "OpenAI TTS-1 HD" : "Neural TTS Synthesizer"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground space-y-2">
                <Mic className="w-8 h-8 opacity-30" />
                <p className="text-xs font-medium">No voice generated yet</p>
                <p className="text-[10px] opacity-60">
                  Write your script and click Generate to produce high-fidelity speech.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
