import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import prisma from "@/lib/prisma";
import { BlogPromptService } from "@/features/ai-blog/services/blog-prompt.service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) {
      return new Response("Workspace not found", { status: 404 });
    }

    const article = await prisma.blogArticle.findFirst({
      where: { id: articleId, businessId },
    });

    if (!article) {
      return new Response("Article not found", { status: 404 });
    }

    const body = await req.json();
    const { action, input } = body;

    let systemPrompt = "You are a professional blog writer and editor.";
    let userPrompt = "";

    if (action === "EXPAND_SECTION") {
      const { section, context, keywords, tone } = input || {};
      systemPrompt = BlogPromptService.getSystemPrompt({
        topic: article.title || "Blog Post",
        targetKeywords: keywords || article.targetKeywords,
        tone: tone || article.tone,
        language: article.language,
        wordCountTarget: 500,
      });
      userPrompt = BlogPromptService.getExpandSectionPrompt(section || "", context, keywords, tone || article.tone);
    } else if (action === "REWRITE_SECTION") {
      const { section, instruction, tone } = input || {};
      systemPrompt = BlogPromptService.getSystemPrompt({
        topic: article.title || "Blog Post",
        targetKeywords: article.targetKeywords,
        tone: tone || article.tone,
        language: article.language,
        wordCountTarget: 300,
      });
      userPrompt = BlogPromptService.getRewriteSectionPrompt(section || "", instruction, tone || article.tone);
    } else if (action === "HUMANIZE") {
      const { content, intensity } = input || {};
      userPrompt = BlogPromptService.getHumanizePrompt(content || article.content || "", intensity || "medium");
    } else {
      return new Response("Invalid streaming action", { status: 400 });
    }

    const isDevelopment = process.env.NODE_ENV === "development";
    const apiKey = isDevelopment ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response("API configuration missing", { status: 500 });
    }

    // Call API with stream: true
    const url = isDevelopment
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

    const model = isDevelopment
      ? "google/gemini-2.0-flash-lite-001"
      : "gpt-4o";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...(isDevelopment ? {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "",
          "X-Title": process.env.APP_NAME || "AI Social Media Automation",
        } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[STREAM API] Error from LLM provider:", errText);
      return new Response(`LLM Provider Error: ${response.statusText}`, { status: response.status });
    }

    // Create ReadableStream to forward chunk events directly to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const cleaned = line.trim();
              if (!cleaned || cleaned === "data: [DONE]") continue;

              if (cleaned.startsWith("data: ")) {
                try {
                  const json = JSON.parse(cleaned.slice(6));
                  const text = json.choices?.[0]?.delta?.content || "";
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                } catch (e) {
                  // Ignore JSON parse errors for malformed intermediate chunks
                }
              }
            }
          }

          // Flush remaining buffer
          if (buffer && buffer.startsWith("data: ")) {
            try {
              const json = JSON.parse(buffer.slice(6));
              const text = json.choices?.[0]?.delta?.content || "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch (e) { }
          }
        } catch (streamErr) {
          controller.error(streamErr);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[STREAM API] Internal error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
