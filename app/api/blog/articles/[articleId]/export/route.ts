import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveWorkspaceIdSafe } from "@/app/(user)/actions/workspace";
import prisma from "@/lib/prisma";
import TurndownService from "turndown";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) {
      return NextResponse.json({ success: false, error: "No active workspace found" }, { status: 404 });
    }

    const article = await prisma.blogArticle.findFirst({
      where: { id: articleId, businessId },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    const body = await req.json();
    const { format } = body;

    const htmlContent = article.content || "";
    const title = article.title || "export";
    const slug = article.slug || "export";

    if (format === "markdown") {
      const turndown = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
      });
      const markdown = `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndescription: "${(article.metaDescription || "").replace(/"/g, '\\"')}"\nslug: "${slug}"\ndate: ${new Date().toISOString()}\ntags: ${JSON.stringify(article.targetKeywords)}\n---\n\n${turndown.turndown(htmlContent)}`;

      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${slug}.md"`,
        },
      });
    }

    if (format === "html") {
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${article.metaDescription || ""}">
  <meta name="keywords" content="${article.targetKeywords.join(", ")}">
</head>
<body>
  <h1>${title}</h1>
  ${htmlContent}
</body>
</html>`;

      return new NextResponse(fullHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${slug}.html"`,
        },
      });
    }

    if (format === "json") {
      const jsonExport = {
        title,
        slug,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        excerpt: article.excerpt,
        content: htmlContent,
        contentJson: article.contentJson,
        keywords: article.targetKeywords,
        secondaryKeywords: article.secondaryKeywords,
        seoScore: article.seoScore,
        createdAt: article.createdAt,
      };

      return NextResponse.json(jsonExport, {
        headers: {
          "Content-Disposition": `attachment; filename="${slug}.json"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid format. Choose 'markdown', 'html', or 'json'." }, { status: 400 });
  } catch (error) {
    console.error("[API/BLOG/EXPORT] Export failed:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
