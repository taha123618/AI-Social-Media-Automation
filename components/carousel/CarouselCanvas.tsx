"use client";

import React, { useState, useEffect } from "react";
import {
  CarouselDeck,
  CarouselSlide,
  CarouselTheme,
  CarouselAspectRatio,
  CAROUSEL_THEMES,
} from "@/features/carousel_builder/types/carousel.types";
import { SlidePreview } from "./SlidePreview";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Copy,
  Layout,
  Palette,
  Layers,
  Share2,
  Check,
  Plus,
  Trash2,
  Save,
  FolderOpen,
  FileDown,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CarouselCanvasProps {
  initialDeck?: CarouselDeck | null;
  businessId: string;
  businessName?: string;
  onSendToScheduler?: (deck: CarouselDeck) => void;
}

export function CarouselCanvas({
  initialDeck,
  businessId,
  businessName = "Apex Studio",
  onSendToScheduler,
}: CarouselCanvasProps) {
  const router = useRouter();

  // Generator State
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<"LINKEDIN" | "INSTAGRAM" | "TWITTER">("LINKEDIN");
  const [slideCount, setSlideCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Deck & Editor State
  const [deck, setDeck] = useState<CarouselDeck | null>(initialDeck || null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<CarouselTheme>("DARK_GLASS");
  const [aspectRatio, setAspectRatio] = useState<CarouselAspectRatio>("4:5");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [showSavedDecks, setShowSavedDecks] = useState(false);
  const [savedDecks, setSavedDecks] = useState<CarouselDeck[]>([]);

  // Storage key helpers
  const getDraftKey = (bId: string) => `socialai_carousel_draft_${bId || "default"}`;
  const getSavedKey = (bId: string) => `socialai_carousel_saved_${bId || "default"}`;
  const LATEST_DRAFT_KEY = "socialai_carousel_draft_latest";
  const FORM_KEY = `socialai_carousel_form_${businessId || "default"}`;

  // Load drafts and saved decks on mount / hard refresh
  useEffect(() => {
    try {
      const savedKey = getSavedKey(businessId);
      const savedListStr =
        localStorage.getItem(savedKey) || localStorage.getItem(getSavedKey("default"));
      if (savedListStr) {
        setSavedDecks(JSON.parse(savedListStr));
      }

      const formStr = localStorage.getItem(FORM_KEY);
      if (formStr) {
        const form = JSON.parse(formStr);
        if (form.topic) setTopic(form.topic);
        if (form.sourceText) setSourceText(form.sourceText);
        if (form.targetPlatform) setTargetPlatform(form.targetPlatform);
        if (form.slideCount) setSlideCount(form.slideCount);
      }

      if (!initialDeck) {
        const draftStr =
          localStorage.getItem(getDraftKey(businessId)) ||
          localStorage.getItem(LATEST_DRAFT_KEY) ||
          localStorage.getItem(getDraftKey("default"));

        if (draftStr) {
          const draft = JSON.parse(draftStr);
          if (draft && Array.isArray(draft.slides) && draft.slides.length > 0) {
            setDeck(draft);
            if (draft.theme) setSelectedTheme(draft.theme);
            if (draft.aspectRatio) setAspectRatio(draft.aspectRatio);
            if (draft.topic && !topic) setTopic(draft.topic);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to read carousel from local storage", e);
    }
  }, [businessId, initialDeck]);

  // Auto-persist draft to localStorage whenever deck changes
  useEffect(() => {
    if (deck) {
      try {
        const payload = JSON.stringify(deck);
        localStorage.setItem(getDraftKey(businessId), payload);
        localStorage.setItem(LATEST_DRAFT_KEY, payload);
      } catch (e) {
        console.warn("Failed to auto-save carousel draft", e);
      }
    }
  }, [deck, businessId]);

  // Generate Deck via API
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a topic or concept");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/carousel/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          topic,
          sourceText: sourceText.trim() || undefined,
          targetPlatform,
          aspectRatio,
          theme: selectedTheme,
          slideCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate carousel");
      }

      setDeck(data.deck);
      setActiveSlideIndex(0);

      // Persist immediately
      try {
        const payload = JSON.stringify(data.deck);
        localStorage.setItem(getDraftKey(businessId), payload);
        localStorage.setItem(LATEST_DRAFT_KEY, payload);
        localStorage.setItem(
          FORM_KEY,
          JSON.stringify({ topic, sourceText, targetPlatform, slideCount })
        );
      } catch (storeErr) {
        console.warn("Storage save error", storeErr);
      }

      toast.success("✨ Carousel synthesized successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate carousel");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Current Deck to Saved Library
  const handleSaveDeck = () => {
    if (!deck) return;
    try {
      const existing = savedDecks.filter((d) => d.id !== deck.id);
      const updatedDeck = {
        ...deck,
        theme: selectedTheme,
        aspectRatio,
        updatedAt: new Date().toISOString(),
      };
      const newList = [updatedDeck, ...existing];
      setSavedDecks(newList);
      localStorage.setItem(getSavedKey(businessId), JSON.stringify(newList));
      localStorage.setItem(getSavedKey("default"), JSON.stringify(newList));
      toast.success("💾 Carousel deck saved to your library!");
    } catch (err) {
      toast.error("Failed to save deck to library");
    }
  };

  // Restore Saved Deck
  const handleRestoreDeck = (selectedSavedDeck: CarouselDeck) => {
    setDeck(selectedSavedDeck);
    if (selectedSavedDeck.theme) setSelectedTheme(selectedSavedDeck.theme);
    if (selectedSavedDeck.aspectRatio) setAspectRatio(selectedSavedDeck.aspectRatio);
    setActiveSlideIndex(0);
    setShowSavedDecks(false);
    toast.success(`Loaded "${selectedSavedDeck.title}"`);
  };

  // Delete Saved Deck
  const handleDeleteSavedDeck = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDecks.filter((d) => d.id !== deckId);
    setSavedDecks(updated);
    localStorage.setItem(getSavedKey(businessId), JSON.stringify(updated));
    localStorage.setItem(getSavedKey("default"), JSON.stringify(updated));
    toast.info("Carousel removed from saved library");
  };

  // Clear Draft / Start New
  const handleClearDraft = () => {
    setDeck(null);
    try {
      localStorage.removeItem(getDraftKey(businessId));
      localStorage.removeItem(LATEST_DRAFT_KEY);
      localStorage.removeItem(getDraftKey("default"));
    } catch (e) {}
    toast.info("Started new carousel draft");
  };

  // Export Deck as JSON
  const handleExportJSON = () => {
    if (!deck) return;
    const exportData = {
      ...deck,
      theme: selectedTheme,
      aspectRatio,
      exportedAt: new Date().toISOString(),
    };
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${deck.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_carousel.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Downloaded Carousel JSON deck");
  };

  // Update Active Slide Field
  const handleUpdateActiveSlide = (field: keyof CarouselSlide, value: any) => {
    if (!deck) return;
    const updatedSlides = [...deck.slides];
    updatedSlides[activeSlideIndex] = {
      ...updatedSlides[activeSlideIndex],
      [field]: value,
    };
    setDeck({ ...deck, slides: updatedSlides });
  };

  // Add Slide
  const handleAddSlide = () => {
    if (!deck) return;
    const newSlide: CarouselSlide = {
      id: `slide_${Date.now()}_${deck.slides.length + 1}`,
      slideNumber: deck.slides.length + 1,
      layout: "CONTENT",
      headline: "New Key Point",
      bodyText: "Describe your core takeaway here.",
    };
    setDeck({ ...deck, slides: [...deck.slides, newSlide] });
    setActiveSlideIndex(deck.slides.length);
  };

  // Remove Active Slide
  const handleDeleteSlide = () => {
    if (!deck || deck.slides.length <= 2) {
      toast.error("Carousels require at least 2 slides");
      return;
    }
    const updated = deck.slides
      .filter((_, idx) => idx !== activeSlideIndex)
      .map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    setDeck({ ...deck, slides: updated });
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
  };

  // Copy Caption
  const handleCopyCaption = () => {
    if (!deck) return;
    const fullText = `${deck.caption}\n\n${deck.hashtags.join(" ")}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    toast.success("Caption & hashtags copied to clipboard!");
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Dispatch to Social Composer
  const handleSendToComposer = () => {
    if (!deck) return;
    if (onSendToScheduler) {
      onSendToScheduler(deck);
    } else {
      sessionStorage.setItem(
        "socialai_prefill_post",
        JSON.stringify({
          content: `${deck.caption}\n\n${deck.hashtags.join(" ")}`,
          title: deck.title,
          platform: deck.targetPlatform,
        })
      );
      toast.success("Sending to Post Composer...");
      router.push("/social-media-management-tool");
    }
  };

  const activeSlide = deck?.slides[activeSlideIndex];
  const currentTheme = CAROUSEL_THEMES[selectedTheme] || CAROUSEL_THEMES.DARK_GLASS;

  return (
    <div className="space-y-8">
      {/* Top Generator Input Deck */}
      <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AI Carousel & Slide Studio</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Synthesize multi-slide LinkedIn PDF decks and Instagram swipe carousels from any topic or article.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {deck && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-all"
                title="Start a new carousel"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            )}

            {/* Saved Decks Toggle */}
            {savedDecks.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSavedDecks(!showSavedDecks)}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-2 transition-all"
              >
                <FolderOpen className="w-4 h-4 text-primary" />
                <span>Saved Decks ({savedDecks.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Saved Decks Drawer */}
        {showSavedDecks && (
          <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Saved Carousel Library
              </span>
              <button
                onClick={() => setShowSavedDecks(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {savedDecks.map((sDeck) => (
                <div
                  key={sDeck.id}
                  onClick={() => handleRestoreDeck(sDeck)}
                  className="p-3 rounded-xl border border-border/80 bg-card hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary">
                      {sDeck.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                      {sDeck.topic}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                    <span>
                      {sDeck.slides.length} slides • {sDeck.theme}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSavedDeck(sDeck.id, e)}
                      className="text-destructive hover:text-destructive/80 p-1"
                      title="Delete deck"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Carousel Topic or Core Hook
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 5 Non-Obvious Ways AI Multi-Agents Boost SaaS Revenue"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Platform
              </label>
              <select
                value={targetPlatform}
                onChange={(e: any) => setTargetPlatform(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="LINKEDIN">LinkedIn (PDF Carousel)</option>
                <option value="INSTAGRAM">Instagram (Swipe Posts)</option>
                <option value="TWITTER">X / Twitter (Thread Slides)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Optional Long-Form Source Copy or Notes
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste article excerpts, podcast transcripts, or raw notes to distill into slides..."
              rows={2}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Slides:</span>
              {[3, 5, 7, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSlideCount(count)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                    slideCount === count
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-border hover:bg-muted text-foreground"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-primary/20"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Synthesizing Slides..." : "Generate AI Carousel"}
            </button>
          </div>
        </form>
      </div>

      {/* Editor & Preview Split Workspace */}
      {deck && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Center: Live Interactive Slide Card & Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Toolbar: Actions, Aspect Ratio & Theme Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
              {/* Aspect Ratio */}
              <div className="flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-muted-foreground ml-1 mr-0.5" />
                {(["4:5", "1:1", "16:9"] as CarouselAspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      aspectRatio === ratio
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Theme Picker */}
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-muted-foreground mr-0.5" />
                <select
                  value={selectedTheme}
                  onChange={(e: any) => setSelectedTheme(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:outline-none"
                >
                  {Object.values(CAROUSEL_THEMES).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save & Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDeck}
                  title="Save Carousel Deck to Library"
                  className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Deck</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  title="Download JSON Deck"
                  className="px-2.5 py-1 rounded-lg bg-muted border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs transition-all"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Slide Canvas */}
            {activeSlide && (
              <div className="max-w-lg mx-auto">
                <SlidePreview
                  slide={activeSlide}
                  theme={currentTheme}
                  aspectRatio={aspectRatio}
                  totalSlides={deck.slides.length}
                  businessName={businessName}
                />
              </div>
            )}

            {/* Slide Navigation Strip */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border">
              <button
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeSlideIndex === 0}
                className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-30 text-foreground transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Slide Number Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto px-2">
                {deck.slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center border ${
                      activeSlideIndex === idx
                        ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md"
                        : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={handleAddSlide}
                  title="Add Slide"
                  className="w-8 h-8 rounded-xl border border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary flex items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setActiveSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1))}
                disabled={activeSlideIndex === deck.slides.length - 1}
                className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-30 text-foreground transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Slide Inspector & Social Caption Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Slide Customizer */}
            {activeSlide && (
              <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">
                      Slide {activeSlide.slideNumber} Inspector
                    </h3>
                  </div>
                  {deck.slides.length > 2 && (
                    <button
                      onClick={handleDeleteSlide}
                      className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                {/* Layout Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Slide Layout Style
                  </label>
                  <select
                    value={activeSlide.layout}
                    onChange={(e: any) => handleUpdateActiveSlide("layout", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none"
                  >
                    <option value="TITLE">Title / Hero Hook</option>
                    <option value="CONTENT">Content / List</option>
                    <option value="STATISTIC">Statistic / Metric Callout</option>
                    <option value="QUOTE">Quote / Philosophy</option>
                    <option value="CTA">Call to Action</option>
                  </select>
                </div>

                {/* Headline */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={activeSlide.headline}
                    onChange={(e) => handleUpdateActiveSlide("headline", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Subheadline / Highlight */}
                {activeSlide.layout === "TITLE" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={activeSlide.highlightText || ""}
                      onChange={(e) => handleUpdateActiveSlide("highlightText", e.target.value)}
                      placeholder="e.g. MASTERCLASS"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                    />
                  </div>
                )}

                {/* Body Text */}
                {(activeSlide.layout === "CONTENT" || activeSlide.layout === "QUOTE" || activeSlide.layout === "STATISTIC") && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Body Narrative
                    </label>
                    <textarea
                      value={activeSlide.bodyText || ""}
                      onChange={(e) => handleUpdateActiveSlide("bodyText", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs resize-none"
                    />
                  </div>
                )}

                {/* Statistic Fields */}
                {activeSlide.layout === "STATISTIC" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                        Stat Value
                      </label>
                      <input
                        type="text"
                        value={activeSlide.statValue || ""}
                        onChange={(e) => handleUpdateActiveSlide("statValue", e.target.value)}
                        placeholder="e.g. 94%"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                        Stat Label
                      </label>
                      <input
                        type="text"
                        value={activeSlide.statLabel || ""}
                        onChange={(e) => handleUpdateActiveSlide("statLabel", e.target.value)}
                        placeholder="e.g. Increase in CTR"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                {activeSlide.layout === "CTA" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={activeSlide.ctaButtonText || ""}
                      onChange={(e) => handleUpdateActiveSlide("ctaButtonText", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Generated Caption & Hashtags Card */}
            <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground">Post Caption & Hashtags</h3>
                <button
                  onClick={handleCopyCaption}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? "Copied" : "Copy Caption"}</span>
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/40 p-3 rounded-xl border border-border/50">
                {deck.caption}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {deck.hashtags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={handleSendToComposer}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
              >
                <Share2 className="w-4 h-4" />
                <span>Send to Post Composer / Scheduler</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
