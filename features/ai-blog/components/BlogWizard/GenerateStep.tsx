"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, CheckCircle2, ChevronRight, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast as sonnerToast } from "sonner";
import { streamGenerateArticle } from "../../actions/blog-generation.actions";
import { BlogPreview } from "../BlogPreview/BlogPreview";
import { BlogImageService } from "../../services/blog-image.service";
import type { BlogOutline } from "../../types/blog.types";
import type { ImageRecord } from "../../types/blog-image.types";

interface GenerateStepProps {
  data: {
    topic: string;
    targetKeywords: string[];
    secondaryKeywords: string[];
    tone: string;
    language: string;
    outline: BlogOutline | null;
  };
}

export function GenerateStep({ data }: GenerateStepProps) {
  const [status, setStatus] = useState<"saving" | "writing" | "done" | "error">("saving");
  const [errorMsg, setErrorMsg] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [topicImages, setTopicImages] = useState<ImageRecord[]>([]);
  const router = useRouter();

  const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Error", { description });
    } else {
      sonnerToast.success(title || "Success", { description });
    }
  };

  const runGeneration = async () => {
    try {
      // 1. Create the article draft shell in DB
      setStatus("saving");
      const createRes = await fetch("/api/blog/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.outline?.title || data.topic,
          topic: data.topic,
          targetKeywords: data.targetKeywords,
          secondaryKeywords: data.secondaryKeywords,
          tone: data.tone,
          language: data.language,
        }),
      });

      const createJson = await createRes.json();
      if (!createJson.success) {
        setStatus("error");
        setErrorMsg(createJson.error || "Failed to create article shell");
        return;
      }

      const articleId = createJson.data.id;
      setCreatedId(articleId);

      // 2. Generate full text using BlogStreamService via server action
      setStatus("writing");
      const genResult = await streamGenerateArticle(
        articleId,
        data.outline!,
        {
          topic: data.outline?.title || data.topic,
          targetKeywords: data.targetKeywords,
          secondaryKeywords: data.secondaryKeywords,
          tone: data.tone as any,
          language: data.language,
          wordCountTarget: (data.outline as any)?.estimatedWordCount || 1500,
        },
      );

      if (genResult.success) {
        setStatus("done");
        toast({
          title: "Blog generated successfully",
          description: "Your rank-ready article is complete and scored.",
        });
      } else {
        setStatus("error");
        setErrorMsg(genResult.error || "Generation timed out or failed");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("An unexpected error occurred during writing.");
    }
  };

  useEffect(() => {
    runGeneration();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-md mx-auto text-center py-6 sm:py-8 px-2 sm:px-0">
      {status === "saving" && (
        <div className="space-y-4">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Saving Article Draft...</h3>
          <p className="text-slate-400 text-sm">Storing outline settings and target keywords in database.</p>
        </div>
      )}

      {status === "writing" && (
        <div className="space-y-4">
          <Loader2 className="h-12 w-12 text-violet-500 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Writing Article Content...</h3>
          <p className="text-slate-400 text-sm">
            Generating full HTML body. Incorporating focus keywords naturally. This may take up to 60 seconds.
          </p>
        </div>
      )}

      {status === "done" && (
        <div className="space-y-6">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Article Draft Complete!</h3>
            <p className="text-slate-400 text-sm">
              Your article has been generated and real-time SEO scoring has been completed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={async () => {
                setShowPreview(true);
                const topic = data.targetKeywords?.[0] || data.topic || "";
                const images = await BlogImageService.getImagesForTopic(topic, 3);
                setTopicImages(images);
              }}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2 border border-slate-700"
            >
              <Eye className="h-4 w-4" />
              Preview Article
            </Button>
            <Button
              onClick={() => router.push(`/blog/${createdId}`)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold flex items-center justify-center gap-2"
            >
              Open Article Workspace
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {showPreview && createdId && (
            <div className="mt-6 border border-slate-800 rounded-xl overflow-hidden max-h-[70vh] sm:max-h-[600px] overflow-y-auto bg-slate-950/50">
              <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Preview</span>
              </div>
              <div className="p-3 sm:p-4">
                <BlogPreview
                  title={data.outline?.title || data.topic}
                  content="<p>Article content has been saved. Open the workspace to view the full generated content with live preview.</p>"
                  metaDescription={data.outline?.metaDescription || ""}
                  enableImages={topicImages.length > 0}
                  topic={data.topic}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Generation Failed</h3>
            <p className="text-slate-400 text-sm">{errorMsg}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full text-slate-400" onClick={() => router.push("/blog")}>
              Go to Dashboard
            </Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white" onClick={runGeneration}>
              Retry Writing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
