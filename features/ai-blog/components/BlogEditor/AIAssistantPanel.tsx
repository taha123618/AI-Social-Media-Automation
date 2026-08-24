"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Maximize2, UserCheck, HelpCircle, LayoutGrid, Copy, Check, Text, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast as sonnerToast } from "sonner";

interface AIAssistantPanelProps {
  articleId: string;
  selectedText: string;
  onInsertText: (text: string) => void;
}

export function AIAssistantPanel({ articleId, selectedText, onInsertText }: AIAssistantPanelProps) {
  const [inputText, setInputText] = useState("");
  const [outputResult, setOutputResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Error", { description });
    } else {
      sonnerToast.success(title || "Success", { description });
    }
  };

  const activeInput = inputText || selectedText;

  const handleCopy = () => {
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runStreamAction = async (action: string, customInput: any = {}) => {
    try {
      setLoading(true);
      setOutputResult("");

      const res = await fetch(`/api/blog/articles/${articleId}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          input: {
            content: activeInput,
            section: activeInput,
            intensity: "medium",
            ...customInput,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setOutputResult((prev) => prev + chunk);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Action failed",
        description: err.message || "An error occurred during generation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor selection context check */}
      <div className="space-y-2 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
            <Text className="h-3.5 w-3.5" />
          </div>
          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Source Text Input
          </Label>
        </div>
        {selectedText ? (
          <div className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-700/50 line-clamp-3">
            "{selectedText}"
          </div>
        ) : (
          <Textarea
            placeholder="Type or paste text here, or highlight text inside the editor to auto-fill..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="bg-slate-950/80 border-slate-700/50 text-xs text-slate-300 focus:border-slate-500 min-h-[80px]"
          />
        )}
      </div>

      {/* Action buttons grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
            <Wand2 className="h-3.5 w-3.5" />
          </div>
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Editor Operations</h5>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600 flex items-center justify-start gap-2 h-9 text-xs transition-all"
            disabled={loading || !activeInput}
            onClick={() => runStreamAction("HUMANIZE")}
          >
            <UserCheck className="h-4 w-4 text-violet-400 shrink-0" />
            Humanize Tone
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600 flex items-center justify-start gap-2 h-9 text-xs transition-all"
            disabled={loading || !activeInput}
            onClick={() => runStreamAction("REWRITE_SECTION", { instruction: "Make it more engaging and conversational." })}
          >
            <RefreshCw className="h-4 w-4 text-blue-400 shrink-0" />
            Rewrite Smart
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600 flex items-center justify-start gap-2 h-9 text-xs transition-all"
            disabled={loading || !activeInput}
            onClick={() => runStreamAction("EXPAND_SECTION")}
          >
            <Maximize2 className="h-4 w-4 text-emerald-400 shrink-0" />
            Expand Selection
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600 flex items-center justify-start gap-2 h-9 text-xs transition-all"
            disabled={loading}
            onClick={() => runStreamAction("GENERATE_FAQ")}
          >
            <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
            Generate FAQ
          </Button>
        </div>
      </div>

      {/* Output preview container */}
      {(outputResult || loading) && (
        <div className="space-y-3 border-t border-slate-800/60 pt-5">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                  Generating response...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  AI Suggested Output
                </>
              )}
            </h5>

            {!loading && outputResult && (
              <div className="flex gap-1">
                <button className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-all" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[100px] max-h-[220px] overflow-y-auto">
            {outputResult || (
              <span className="text-slate-500 italic">Writing output...</span>
            )}
          </div>

          {!loading && outputResult && (
            <Button
              size="sm"
              onClick={() => onInsertText(outputResult)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-xs h-9 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Wand2 className="h-3.5 w-3.5 mr-1.5" />
              Insert output at editor cursor
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
