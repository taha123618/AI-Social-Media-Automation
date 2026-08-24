"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, Plus, Trash2, Edit2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner";
import type { BlogOutline, BlogOutlineSection } from "../../types/blog.types";

interface OutlineStepProps {
  data: {
    topic: string;
    targetKeywords: string[];
    secondaryKeywords: string[];
    tone: string;
    language: string;
    outline: BlogOutline | null;
  };
  updateData: (fields: Partial<OutlineStepProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OutlineStep({ data, updateData, onNext, onBack }: OutlineStepProps) {
  const [generating, setGenerating] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempMeta, setTempMeta] = useState("");
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Error", { description });
    } else {
      sonnerToast.success(title || "Success", { description });
    }
  };

  const generateOutline = async () => {
    try {
      setGenerating(true);
      const res = await fetch("/api/blog/generate/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: data.topic,
          targetKeywords: data.targetKeywords,
          secondaryKeywords: data.secondaryKeywords,
          tone: data.tone,
        }),
      });

      const json = await res.json();
      if (json.success) {
        updateData({ outline: json.data });
        setTempTitle(json.data.title);
        setTempMeta(json.data.metaDescription);
      } else {
        toast({
          title: "Outline generation failed",
          description: json.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection error",
        description: "Failed to connect to the outline generator API.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!data.outline) {
      generateOutline();
    } else {
      setTempTitle(data.outline.title);
      setTempMeta(data.outline.metaDescription);
    }
  }, []);

  const handleSaveTitle = () => {
    if (data.outline) {
      updateData({
        outline: {
          ...data.outline,
          title: tempTitle,
        },
      });
    }
    setEditingTitle(false);
  };

  const handleSaveMeta = () => {
    if (data.outline) {
      updateData({
        outline: {
          ...data.outline,
          metaDescription: tempMeta,
        },
      });
    }
    setEditingMeta(false);
  };

  const handleUpdateSectionHeading = (index: number, newHeading: string) => {
    if (!data.outline) return;
    const updatedSections = [...data.outline.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      heading: newHeading,
    };
    updateData({
      outline: {
        ...data.outline,
        sections: updatedSections,
      },
    });
  };

  const handleDeleteSection = (index: number) => {
    if (!data.outline) return;
    const updatedSections = data.outline.sections.filter((_, i) => i !== index);
    updateData({
      outline: {
        ...data.outline,
        sections: updatedSections,
      },
    });
  };

  const handleAddSection = () => {
    if (!data.outline) return;
    const newSection: BlogOutlineSection = {
      heading: "New Heading Section",
      level: 2,
      keyPoints: ["Point to expand on"],
      targetWordCount: 200,
      suggestedKeywords: [],
    };
    updateData({
      outline: {
        ...data.outline,
        sections: [...data.outline.sections, newSection],
      },
    });
    setExpandedSection(data.outline.sections.length);
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">Structuring Outline...</h3>
          <p className="text-slate-500 text-xs max-w-xs">
            Using AI to research headings, keyword distributions, and optimal semantic structure.
          </p>
        </div>
      </div>
    );
  }

  if (!data.outline) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          Review & Refine Outline
        </h2>
        <p className="text-slate-400 text-sm">
          Customize the headings, target word counts, and meta parameters before writing the article.
        </p>
      </div>

      <div className="space-y-5 bg-slate-900/30 p-4 sm:p-5 rounded-xl border border-slate-900">
        {/* Title editing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">SEO Title Tag</Label>
            <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-400" onClick={() => setEditingTitle(!editingTitle)}>
              {editingTitle ? "Cancel" : "Edit"}
            </Button>
          </div>
          {editingTitle ? (
            <div className="flex gap-2">
              <Input value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-200" />
              <Button size="sm" onClick={handleSaveTitle} className="bg-blue-600 hover:bg-blue-500">Save</Button>
            </div>
          ) : (
            <div className="text-lg font-extrabold text-white">{data.outline.title}</div>
          )}
        </div>

        {/* Meta Description editing */}
        <div className="space-y-2 border-t border-slate-900/60 pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Meta Description</Label>
            <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-400" onClick={() => setEditingMeta(!editingMeta)}>
              {editingMeta ? "Cancel" : "Edit"}
            </Button>
          </div>
          {editingMeta ? (
            <div className="flex gap-2">
              <Input value={tempMeta} onChange={(e) => setTempMeta(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-200" />
              <Button size="sm" onClick={handleSaveMeta} className="bg-blue-600 hover:bg-blue-500">Save</Button>
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic">"{data.outline.metaDescription}"</div>
          )}
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap gap-2 sm:gap-4 border-t border-slate-900/60 pt-4 text-xs text-slate-400">
          <Badge variant="outline" className="bg-slate-950 border-slate-850 text-slate-300">
            {data.outline.sections.length} Sections
          </Badge>
          <Badge variant="outline" className="bg-slate-950 border-slate-850 text-slate-300">
            ~{data.outline.estimatedWordCount} Total Words
          </Badge>
          <Badge variant="outline" className="bg-slate-950 border-slate-850 text-slate-300">
            {data.outline.estimatedReadingTime} Min Reading Time
          </Badge>
        </div>
      </div>

      {/* Headings list */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Headings & Key Points</h3>
        <div className="space-y-3">
          {data.outline.sections.map((section, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-900 bg-slate-950/20 overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer" onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="text-xs font-mono text-slate-600 shrink-0">H{section.level}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{section.heading}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-red-400" onClick={() => handleDeleteSection(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400">
                    {expandedSection === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {expandedSection === idx && (
                <div className="p-4 border-t border-slate-900 bg-slate-950/60 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Edit Heading Title</Label>
                    <Input
                      value={section.heading}
                      onChange={(e) => handleUpdateSectionHeading(idx, e.target.value)}
                      className="bg-slate-950 border-slate-850 text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Key Points / Talking Points</Label>
                    <ul className="list-disc pl-5 space-y-1">
                      {section.keyPoints.map((kp, kpIdx) => (
                        <li key={kpIdx} className="text-xs text-slate-400">{kp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleAddSection}
          variant="outline"
          size="sm"
          className="border-slate-800 bg-slate-950 text-slate-400 hover:text-white flex items-center gap-1 mx-auto mt-2"
        >
          <Plus className="h-3.5 w-3.5" /> Add Heading Section
        </Button>
      </div>

      <div className="flex gap-4 pt-4 justify-end">
        <Button variant="secondary" onClick={onBack} className=" text-slate-400 border border-slate-850 hover:text-white">
          Back
        </Button>
        <Button onClick={onNext} className=" bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold">
          Approve & Save Article
        </Button>
      </div>
    </div>
  );
}
