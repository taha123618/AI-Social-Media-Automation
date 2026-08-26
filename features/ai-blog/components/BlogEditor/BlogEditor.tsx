"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

import {
  Save,
  Settings,
  Sparkles,
  BarChart2,
  History,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Eye,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner";

import { BlogImageService, getAvailableProviders } from "../../services/blog-image.service";
import { analyzeSEO } from "../../actions/blog-generation.actions";
import { applySEOFixes } from "../../actions/blog-seo-optimizer.actions";
import { EditorToolbar } from "./EditorToolbar";
import { ContentStats } from "./ContentStats";
import { SERPPreview } from "./SERPPreview";
import { SEOScorePanel } from "./SEOScorePanel";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { BlogPreview } from "../BlogPreview/BlogPreview";
import { PreviewToolbar, type PreviewDevice } from "../BlogPreview/PreviewToolbar";
import { BlogExportPanel, type BlogExportPanelHandle } from "../BlogExportPanel/BlogExportPanel";
import type { SEOReport } from "../../types/blog.types";
import type { ImageRecord, ImageAspectRatio } from "../../types/blog-image.types";

interface BlogEditorProps {
  articleId: string;
}

export default function BlogEditor({ articleId }: BlogEditorProps) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"seo" | "ai" | "settings" | "versions" | "preview" | "export">("seo");
  const [selectedText, setSelectedText] = useState("");

  // Article settings state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [seoReport, setSeoReport] = useState<SEOReport | null>(null);

  // Versions state
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // SEO regenerate state
  const [isRegeneratingSEO, setIsRegeneratingSEO] = useState(false);
  const [isApplyingSEO, setIsApplyingSEO] = useState(false);
  // Track highlighted sections after SEO apply
  const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set());

  // Real-time editor content for preview sync
  const [editorContent, setEditorContent] = useState("");

  const exportPanelRef = useRef<BlogExportPanelHandle>(null);

  // Preview state
  const [enableImages, setEnableImages] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [sectionImages, setSectionImages] = useState<Record<string, ImageRecord>>({});
  const [generatingImages, setGeneratingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<ImageAspectRatio>("16:9");
  const [enableImageOverlay, setEnableImageOverlay] = useState(false);
  const [availableImgProviders] = useState(() => getAvailableProviders());

  const router = useRouter();
  
  const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Error", { description });
    } else {
      sonnerToast.success(title || "Success", { description });
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "",
    onUpdate({ editor }) {
      setEditorContent(editor.getHTML());
    },
    onSelectionUpdate({ editor }) {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      setSelectedText(text.trim());
    },
  });

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/blog/articles/${articleId}`);
      const json = await res.json();
      if (json.success) {
        setArticle(json.data);
        setTitle(json.data.title || "");
        setSlug(json.data.slug || "");
        setMetaDescription(json.data.metaDescription || "");
        setSeoScore(json.data.seoScore);

        if (editor && json.data.content) {
          editor.commands.setContent(json.data.content);
          setEditorContent(json.data.content);
        }

        // Fetch SEO Report if available
        if (json.data.seoReports?.[0]) {
          setSeoReport(json.data.seoReports[0]);
        }
      } else {
        toast({
          title: "Error fetching article",
          description: json.error || "Article not found",
          variant: "destructive",
        });
        router.push("/blog");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection error",
        description: "Failed to retrieve article details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      setLoadingVersions(true);
      const res = await fetch(`/api/blog/articles/${articleId}/versions`);
      const json = await res.json();
      if (json.success) {
        setVersions(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVersions(false);
    }
  };

  useEffect(() => {
    if (editor) {
      fetchArticle();
    }
  }, [articleId, editor]);

  useEffect(() => {
    if (activeTab === "versions") {
      fetchVersions();
    }
  }, [activeTab]);

  // Auto-trigger AI image generation when content changes (debounced) or images enabled
  useEffect(() => {
    if (!enableImages || !article) return;
    const timer = setTimeout(() => {
      handleGenerateImages();
    }, 2000);
    return () => clearTimeout(timer);
  }, [enableImages, editorContent, article]);

  // Debounced auto-regeneration when content changes (with images already enabled)
  const contentRef = useRef(editorContent);
  useEffect(() => {
    if (!enableImages || !article || !contentRef.current) return;
    if (contentRef.current === editorContent) return;
    contentRef.current = editorContent;
    const timer = setTimeout(() => {
      if (enableImages) handleGenerateImages();
    }, 3000);
    return () => clearTimeout(timer);
  }, [editorContent]);

  const handleSave = async (showNotification = true) => {
    if (!editor) return;
    try {
      setSaving(true);
      const htmlContent = editor.getHTML();
      const contentWithImages = Object.keys(sectionImages).length > 0
        ? BlogImageService.injectImagesIntoContent(htmlContent, Object.values(sectionImages), article?.title || title)
        : htmlContent;

      const res = await fetch(`/api/blog/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          metaDescription,
          content: contentWithImages,
          status: article.status === "GENERATING" ? "REVIEW" : article.status,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setArticle(json.data);
        setSeoScore(json.data.seoScore);

        // Fetch updated SEO report
        const seoRes = await fetch(`/api/blog/articles/${articleId}/seo`, { method: "POST" });
        const seoJson = await seoRes.json();
        if (seoJson.success) {
          setSeoReport(seoJson.data);
        }

        if (showNotification) {
          toast({
            title: "Article saved",
            description: "All content, SEO metrics, and metadata updated.",
          });
        }
      } else {
        toast({
          title: "Save failed",
          description: json.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection issue",
        description: "Failed to sync updates to the server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm("Are you sure you want to restore this version? Your current unsaved edits will be overwritten.")) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/blog/articles/${articleId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });

      const body = await res.text();
      let json: any;
      try {
        json = JSON.parse(body);
      } catch {
        toast({
          title: "Version restore failed",
          description: `Server returned ${res.status}: ${body || "empty response"}`,
          variant: "destructive",
        });
        return;
      }

      if (!res.ok || !json.success) {
        toast({
          title: "Restore failed",
          description: json?.error || `Server error (${res.status})`,
          variant: "destructive",
        });
        return;
      }

      editor?.commands.setContent(json.data.content);
      setTitle(json.data.title || "");
      setMetaDescription(json.data.metaDescription || "");
      toast({
        title: "Version restored",
        description: "Article content reverted back successfully.",
      });
      setActiveTab("seo");
      setTimeout(() => handleSave(false), 500);
    } catch (err) {
      console.error(err);
      toast({
        title: "Restore failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateSEO = async () => {
    if (!editor) return;
    setIsRegeneratingSEO(true);
    try {
      const articleTitle = title || article?.title || "";
      const htmlContent = editor.getHTML();
      const description = metaDescription || article?.metaDescription || "";
      const keywords = article?.targetKeywords || [];

      const result = await analyzeSEO(articleId, articleTitle, htmlContent, description, keywords);

      if (result.success && result.data) {
        setSeoReport(result.data);
        setSeoScore(result.data.overallScore);
      } else {
        toast({
          title: "SEO analysis failed",
          description: result.error || "Could not regenerate analysis.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("SEO regenerate error:", err);
      toast({
        title: "SEO analysis error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsRegeneratingSEO(false);
    }
  };

  const handleApplySEOFixes = async () => {
    if (!editor || !article) return;
    setIsApplyingSEO(true);
    try {
      const articleTitle = title || article?.title || "";
      const htmlContent = editor.getHTML();
      const description = metaDescription || article?.metaDescription || "";
      const keywords = article?.targetKeywords || [];

      const result = await applySEOFixes(articleId, articleTitle, htmlContent, description, keywords);

      if (result.success && result.data) {
        const { title: newTitle, metaDescription: newMeta, content: newContent, changes, report } = result.data;

        if (newTitle !== articleTitle) setTitle(newTitle);
        if (newMeta !== description) setMetaDescription(newMeta);

        if (editor && newContent) {
          editor.commands.setContent(newContent);
          setEditorContent(newContent);
        }

        if (report) {
          setSeoReport(report);
          setSeoScore(report.overallScore);
        }

        // Highlight changed sections
        if (changes.length > 0) {
          const changeTypes = new Set(changes.map((c: any) => c.type));
          setHighlightedSections(changeTypes);
          setTimeout(() => setHighlightedSections(new Set()), 6000);
        }

        toast({
          title: "SEO optimizations applied",
          description: `${changes.length} improvement(s) made. Regenerating SEO analysis...`,
        });

        handleRegenerateSEO();
      } else {
        toast({
          title: "SEO optimization failed",
          description: result.error || "Could not apply changes.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("SEO apply error:", err);
      toast({
        title: "SEO optimization error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingSEO(false);
    }
  };

  const handleGenerateImages = useCallback(async (forceRegenerate = false) => {
    if (!editor || !article) return;
    const topic = article?.targetKeywords?.[0] || article?.title || "";
    if (!topic) return;

    setGeneratingImages(true);
    setImageError(null);

    try {
      if (forceRegenerate) BlogImageService.clearCache();

      const html = editor.getHTML();
      const keywords = article?.targetKeywords || [];

      const images = await BlogImageService.generateAllSectionImages(
        html,
        topic,
        keywords,
      );

      const record: Record<string, ImageRecord> = {};
      images.forEach((img, heading) => {
        record[heading] = img;
      });
      setSectionImages(record);
    } catch (err: any) {
      console.error("[AI Images] Generation failed:", err);
      setImageError(err.message || "Image generation failed");
    } finally {
      setGeneratingImages(false);
    }
  }, [editor, article]);

  const handlePublish = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/blog/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      const json = await res.json();
      if (json.success) {
        setArticle(json.data);
        toast({
          title: "Article published",
          description: "The article status is now set to published.",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Derive stats dynamically from editor text
  const getStats = () => {
    if (!editor) return { wordCount: 0, readingTime: 0, sentenceCount: 0, paragraphCount: 0 };
    const text = editor.getText().trim();
    if (!text) return { wordCount: 0, readingTime: 0, sentenceCount: 0, paragraphCount: 0 };

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 225));
    const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphCount = text.split(/\n+/).filter((p) => p.trim().length > 0).length;

    return { wordCount, readingTime, sentenceCount, paragraphCount };
  };

  const handleInsertText = (text: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(text).run();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading article workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Nav Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-slate-400 hover:text-white"
            onClick={() => router.push("/blog")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white max-w-md line-clamp-1">
                {title || "Untitled Article"}
              </h1>
              <Badge variant="outline" className={`text-[10px] px-2 py-0 ${
                article.status === "PUBLISHED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : article.status === "DRAFT"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}>
                {article.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-slate-400 border border-slate-700/50">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                keyword: <span className="text-emerald-400 font-semibold font-mono">{(article.targetKeywords || [])[0] || "None"}</span>
              </span>
              <span className="text-[10px] text-slate-600">
                {article.wordCount || 0} words
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("export")}
            className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>

          {article.status !== "PUBLISHED" && (
            <Button
              size="sm"
              onClick={handlePublish}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              Publish Article
            </Button>
          )}
        </div>
      </div>

      {/* Main workspace layout splitting */}
      <div className={`grid grid-cols-1 gap-8 items-start ${
        activeTab === "preview" || activeTab === "export" ? "lg:grid-cols-12" : "lg:grid-cols-12"
      }`}>
        {/* Left Side: Editor column */}
        <div className={`space-y-6 ${
          activeTab === "preview" || activeTab === "export" ? "lg:col-span-5" : "lg:col-span-8"
        }`}>
          <ContentStats stats={getStats()} />

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20 backdrop-blur-md">
            <EditorToolbar editor={editor} />
            <div className="p-6 min-h-[460px] max-h-[700px] overflow-y-auto prose prose-invert max-w-none focus:outline-none select-text">
              <EditorContent editor={editor} className="outline-none" />
            </div>
          </div>
        </div>

        {/* Right Side: Control panel tabs panel */}
        <div className={`space-y-6 ${
          activeTab === "preview" || activeTab === "export" ? "lg:col-span-7" : "lg:col-span-4"
        }`}>
          {/* Panel navigation tabs — responsive: scrollable on mobile, full on desktop */}
          <div className="relative">
            <div className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-slate-800 bg-slate-900/60 p-1 rounded-xl gap-0.5 backdrop-blur-sm">
              {[
                { id: "seo" as const, icon: BarChart2, label: "SEO", labelFull: "SEO Audit" },
                { id: "ai" as const, icon: Sparkles, label: "AI", labelFull: "AI Helper" },
                { id: "settings" as const, icon: Settings, label: "Settings", labelFull: "Settings" },
                { id: "versions" as const, icon: History, label: "History", labelFull: "History" },
                { id: "preview" as const, icon: Eye, label: "Preview", labelFull: "Preview" },
                { id: "export" as const, icon: Share2, label: "Export", labelFull: "Export" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                      transition-all duration-200 whitespace-nowrap shrink-0
                      ${isActive
                        ? "bg-gradient-to-r from-blue-600/25 to-violet-600/25 text-blue-200 shadow-sm shadow-blue-600/10 ring-1 ring-blue-500/20"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                      }
                    `}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                    <span className="hidden sm:inline">{tab.labelFull}</span>
                    <span className="sm:hidden">{tab.label}</span>
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab 1: SEO Score Audit */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <SERPPreview title={title} metaDescription={metaDescription} slug={slug} />
              <SEOScorePanel
                report={seoReport}
                onRegenerate={handleRegenerateSEO}
                isRegenerating={isRegeneratingSEO}
                onApplySuggestions={handleApplySEOFixes}
                isApplying={isApplyingSEO}
              />
            </div>
          )}

          {/* Tab 2: AI writing assistant */}
          {activeTab === "ai" && (
            <AIAssistantPanel
              articleId={articleId}
              selectedText={selectedText}
              onInsertText={handleInsertText}
            />
          )}

          {/* Tab 3: Settings panel */}
          {activeTab === "settings" && (
            <div className="space-y-4 bg-slate-900/30 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <Settings className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Article Parameters</h3>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-slate-400 text-[10px] font-semibold">SEO Document Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-950/80 border-slate-700/50 text-xs text-slate-200 focus:border-slate-500 h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-slate-400 text-[10px] font-semibold">Custom Slug / URL path</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-slate-950/80 border-slate-700/50 text-xs text-slate-200 focus:border-slate-500 h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="meta" className="text-slate-400 text-[10px] font-semibold">Meta Description Tag</Label>
                <Textarea
                  id="meta"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="bg-slate-950/80 border-slate-700/50 text-xs text-slate-350 focus:border-slate-500 min-h-[80px]"
                />
              </div>

              <Button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold text-xs h-9 mt-1 transition-all duration-200"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                Apply Parameters
              </Button>
            </div>
          )}

          {/* Tab 5: Live Preview (real-time sync) */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <PreviewToolbar
                enableImages={enableImages}
                onToggleImages={(enabled) => {
                  setEnableImages(enabled);
                  if (enabled && Object.keys(sectionImages).length === 0 && !generatingImages) {
                    handleGenerateImages();
                  }
                }}
                device={previewDevice}
                onDeviceChange={setPreviewDevice}
                imageCount={Object.keys(sectionImages).length}
                imageLoading={generatingImages}
                imageError={imageError}
                sectionCount={BlogImageService.extractSections(editorContent || "").length}
                onRefreshImages={() => handleGenerateImages(true)}
                aspectRatio={imageAspectRatio}
                onAspectRatioChange={setImageAspectRatio}
                enableOverlay={enableImageOverlay}
                onToggleOverlay={setEnableImageOverlay}
                availableProviders={availableImgProviders}
              />
              <div
                className={`overflow-y-auto border border-border rounded-xl bg-background ${
                  previewDevice === "mobile"
                    ? "max-w-[375px] mx-auto"
                    : previewDevice === "tablet"
                      ? "max-w-[768px] mx-auto"
                      : "max-w-full"
                }`}
                style={{ maxHeight: "calc(100vh - 320px)" }}
              >
                <BlogPreview
                  title={title}
                  content={editorContent || ""}
                  metaDescription={metaDescription}
                  author={article?.creator?.name || "Author"}
                  publishedDate={article?.updatedAt ? new Date(article.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined}
                  enableImages={enableImages}
                  topic={article?.targetKeywords?.[0] || article?.title || ""}
                  keywords={article?.targetKeywords || []}
                  aspectRatio={imageAspectRatio}
                  enableOverlay={enableImageOverlay}
                  generatingImages={generatingImages}
                  sectionImages={sectionImages}
                />
              </div>
            </div>
          )}

          {/* Tab 6: Export Panel */}
          {activeTab === "export" && (
            <BlogExportPanel
              ref={exportPanelRef}
              title={title}
              contentHtml={
                enableImages && Object.keys(sectionImages).length > 0
                  ? BlogImageService.injectImagesIntoContent(editorContent || "", Object.values(sectionImages), article?.targetKeywords?.[0] || article?.title || "")
                  : (editorContent || "")
              }
              slug={slug}
              meta={{
                metaDescription,
                authorName: article?.creator?.name,
                siteName: process.env.NEXT_PUBLIC_SITE_NAME || "AI Blog Writer",
                publishedDate: article?.updatedAt ? new Date(article.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined,
              }}
            />
          )}

          {/* Tab 4: Version history */}
          {activeTab === "versions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <History className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Saved Revisions</h3>
              </div>
              {loadingVersions ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 text-blue-500 animate-spin" /></div>
              ) : versions.length === 0 ? (
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-8 text-center">
                  <History className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-xs">No previous versions exist yet.</p>
                  <p className="text-slate-600 text-[10px] mt-1">Versions are auto-saved each time content changes.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {versions.map((ver, i) => (
                    <div
                      key={ver.id}
                      className="group bg-slate-900/30 border border-slate-800 rounded-lg p-3 flex flex-col gap-2 hover:bg-slate-900/50 hover:border-slate-700 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400 border border-slate-700">
                            #{versions.length - i}
                          </div>
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors line-clamp-1">
                            {ver.title}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-600 whitespace-nowrap ml-2">{new Date(ver.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50" onClick={() => handleRestoreVersion(ver.id)}>
                          <History className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
