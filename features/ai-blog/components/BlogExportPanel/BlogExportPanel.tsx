"use client";

import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  type Ref,
} from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  Loader2,
  FileType,
  Globe,
  StickyNote,
  ExternalLink,
  FileSpreadsheet,
  Replace,
  FileDown,
  ClipboardList,
  Share2,
  ArrowRight,
  Newspaper,
  Layout,
  ShoppingCart,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast as sonnerToast } from "sonner";
import { BlogExportService } from "../../services/blog-export.service";
import { BlogClipboardService } from "../../services/blog-clipboard.service";
import { BlogHtmlSerializer } from "../../services/blog-html-serializer.service";

const escapeHtml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

const toast = ({
  title,
  description,
  variant,
}: {
  title?: string;
  description?: string;
  variant?: string;
}) => {
  if (variant === "destructive") {
    sonnerToast.error(title || "Error", { description });
  } else {
    sonnerToast.success(title || "Success", { description });
  }
};

export interface BlogExportPanelHandle {
  exportPDF: () => Promise<void>;
  exportDOCX: () => Promise<void>;
  copyToClipboard: () => Promise<void>;
  exportHTML: () => void;
  exportMarkdown: () => void;
}

interface BlogExportPanelProps {
  title: string;
  contentHtml: string;
  slug?: string;
  meta?: {
    metaDescription?: string;
    featuredImage?: string;
    siteName?: string;
    authorName?: string;
    publishedDate?: string;
  };
}

export const BlogExportPanel = forwardRef(function BlogExportPanel(
  {
    title,
    contentHtml,
    slug,
    meta,
  }: BlogExportPanelProps,
  ref: Ref<BlogExportPanelHandle>,
) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    exportPDF: handleExportPDF,
    exportDOCX: handleExportDOCX,
    copyToClipboard: handleCopy,
    exportHTML: () => handleExportFile("html"),
    exportMarkdown: () => handleExportFile("markdown"),
  }));

  const handleCopy = async () => {
    try {
      setExporting("copy");
      await BlogClipboardService.copyToClipboard(title, contentHtml, {
        metaDescription: meta?.metaDescription,
        author: meta?.authorName,
        publishedDate: meta?.publishedDate,
        featuredImage: meta?.featuredImage,
        siteName: meta?.siteName,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      toast({
        title: "Copied!",
        description: "Full formatting preserved. Paste into WordPress, Notion, Medium, Webflow, or any editor.",
      });
    } catch (err: any) {
      toast({
        title: "Copy failed",
        description: err.message || "Clipboard API unavailable.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    try {
      setExporting("pdf");
      const previewRoot = previewRef.current.querySelector("#pdf-preview-root");
      if (!previewRoot) {
        toast({ title: "PDF failed", description: "Preview element not found.", variant: "destructive" });
        return;
      }
      const result = await BlogExportService.exportPDF(title, contentHtml, previewRoot as HTMLElement);
      if (result.success && result.blob) {
        BlogExportService.downloadBlob(result.blob, `${slug || "article"}.pdf`);
        toast({ title: "PDF exported", description: "Document downloaded successfully." });
      } else {
        toast({ title: "PDF failed", description: result.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "PDF error", description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const handleExportDOCX = async () => {
    try {
      setExporting("docx");
      const result = await BlogExportService.exportDOCX(title, contentHtml, {
        authorName: meta?.authorName,
        featuredImage: meta?.featuredImage,
      });
      if (result.success && result.blob) {
        BlogExportService.downloadBlob(result.blob, `${slug || "article"}.docx`);
        toast({ title: "Word document exported", description: "Compatible with Microsoft Word, Google Docs, and LibreOffice." });
      } else {
        toast({ title: "DOCX failed", description: result.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "DOCX error", description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const handleExportFile = (format: "html" | "markdown") => {
    try {
      setExporting(format);
      const filename = `${slug || "article"}.${format === "markdown" ? "md" : "html"}`;
      if (format === "html") {
        const html = BlogExportService.exportHTML(title, contentHtml, meta);
        BlogExportService.downloadString(html, filename, "text/html");
      } else {
        const md = BlogExportService.htmlToMarkdown(contentHtml);
        BlogExportService.downloadString(md, filename, "text/plain");
      }
      toast({
        title: `${format === "html" ? "HTML" : "Markdown"} exported`,
        description: "File downloaded to your device.",
      });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const platformLinks = [
    {
      label: "WordPress",
      icon: Globe,
      desc: "Import via Tools → Import → HTML",
      onClick: () => {
        const wp = BlogHtmlSerializer.serializeForWordPress(title, contentHtml, meta?.authorName);
        BlogExportService.downloadString(wp, `${slug || "article"}-wordpress.html`, "text/html");
        toast({ title: "WordPress HTML downloaded", description: "Import via Tools → Import → HTML." });
      },
    },
    {
      label: "Medium",
      icon: Newspaper,
      desc: "Paste directly into Medium's editor",
      onClick: () => {
        const m = BlogHtmlSerializer.serializeForMedium(title, contentHtml);
        BlogClipboardService.copyToClipboard(title, m).then(() => {
          toast({ title: "Medium ready", description: "Paste directly into Medium's editor." });
        });
      },
    },
    {
      label: "Webflow",
      icon: Layout,
      desc: "Paste into Rich Text element",
      onClick: () => {
        const wf = BlogHtmlSerializer.serializeForWebflow(title, contentHtml);
        BlogExportService.downloadString(wf, `${slug || "article"}-webflow.html`, "text/html");
        toast({ title: "Webflow HTML ready", description: "Import via CMS or paste into Rich Text element." });
      },
    },
    {
      label: "Shopify",
      icon: ShoppingCart,
      desc: "Paste into blog post editor",
      onClick: () => {
        const sh = BlogHtmlSerializer.serializeForShopify(title, contentHtml);
        BlogClipboardService.copyToClipboard(title, sh).then(() => {
          toast({ title: "Shopify ready", description: "Paste into the blog post editor." });
        });
      },
    },
    {
      label: "Notion",
      icon: BookOpen,
      desc: "Paste into any Notion page",
      onClick: () => {
        const n = BlogHtmlSerializer.serializeForNotion(title, contentHtml);
        BlogClipboardService.copyToClipboard(title, n).then(() => {
          toast({ title: "Notion ready", description: "Paste into any Notion page." });
        });
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden preview element for PDF rendering.
          Builds full HTML with inline styles to ensure correct rendering in html2canvas.
          The onclone callback in exportPDF strips any remaining problematic CSS. */}
      <div ref={previewRef} style={{ position: "absolute", left: "-9999px", top: 0, width: "800px", zIndex: -1 }}>
        <div
          id="pdf-preview-root"
          style={{
            padding: "40px",
            maxWidth: "800px",
            margin: "0 auto",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            lineHeight: "1.8",
            color: "#1a1a2e",
            background: "#ffffff",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
          dangerouslySetInnerHTML={{
            __html: `<h1 style="font-size:2.25rem;font-weight:800;line-height:1.2;margin-bottom:1rem;color:#111827">${escapeHtml(title)}</h1>\n${contentHtml}`,
          }}
        />
      </div>

      {/* Quick Copy */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 to-blue-800/5 p-5 rounded-xl border border-blue-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
            <ClipboardList className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
            Quick Copy
          </h3>
        </div>
        <Button
          onClick={handleCopy}
          disabled={exporting === "copy"}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm h-11 shadow-lg shadow-blue-600/20 transition-all duration-200"
        >
          {exporting === "copy" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : copied ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? "Copied!" : exporting === "copy" ? "Copying..." : "Copy with Formatting"}
        </Button>
        <p className="text-[10px] text-blue-300/50 mt-2 text-center">
          Preserves headings, lists, tables, code blocks, images, and typography — paste into any CMS or editor
        </p>
      </div>

      {/* Download Formats */}
      <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
            <FileDown className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Download File
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handleExportFile("html")}
            disabled={exporting === "html"}
            className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600 text-xs h-10 transition-all"
          >
            {exporting === "html" ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5 mr-1.5" />
            )}
            HTML
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportFile("markdown")}
            disabled={exporting === "markdown"}
            className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600 text-xs h-10 transition-all"
          >
            {exporting === "markdown" ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <FileType className="h-3.5 w-3.5 mr-1.5" />
            )}
            Markdown
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exporting === "pdf"}
            className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600 text-xs h-10 transition-all"
          >
            {exporting === "pdf" ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 mr-1.5" />
            )}
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExportDOCX}
            disabled={exporting === "docx"}
            className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600 text-xs h-10 transition-all"
          >
            {exporting === "docx" ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
            )}
            Word
          </Button>
        </div>
      </div>

      {/* Platform-specific exports */}
      <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
            <Share2 className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Export for Platform
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {platformLinks.map((platform) => (
            <button
              key={platform.label}
              onClick={platform.onClick}
              disabled={!!exporting}
              className="group flex items-center gap-3 p-3 rounded-lg border border-slate-800/50 bg-slate-900/20
                hover:bg-slate-800/40 hover:border-slate-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="p-2 rounded-lg bg-slate-800/50 text-slate-400 group-hover:text-slate-300 group-hover:bg-slate-700/50 transition-colors shrink-0">
                <platform.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {platform.label}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {platform.desc}
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
