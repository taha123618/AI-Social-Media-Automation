import { BlogClipboardService } from "./blog-clipboard.service";
import { BlogHtmlSerializer } from "./blog-html-serializer.service";
import { jsPDF } from "jspdf";

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  html?: string;
  markdown?: string;
  error?: string;
}

export class BlogExportService {
  static exportHTML(
    title: string,
    content: string,
    meta?: {
      metaDescription?: string;
      featuredImage?: string;
      siteName?: string;
      authorName?: string;
    },
  ): string {
    return BlogHtmlSerializer.serialize(title, content, {
      wrapInHtml: true,
      inlineStyles: true,
      includeFeaturedImage: !!meta?.featuredImage,
      featuredImageUrl: meta?.featuredImage,
      siteName: meta?.siteName,
      authorName: meta?.authorName,
      addMetaViewport: true,
    });
  }

  static exportWordPress(title: string, content: string, authorName?: string): string {
    return BlogHtmlSerializer.serializeForWordPress(title, content, authorName);
  }

  static exportMedium(title: string, content: string): string {
    return BlogHtmlSerializer.serializeForMedium(title, content);
  }

  static exportWebflow(title: string, content: string): string {
    return BlogHtmlSerializer.serializeForWebflow(title, content);
  }

  static exportShopify(title: string, content: string): string {
    return BlogHtmlSerializer.serializeForShopify(title, content);
  }

  static htmlToMarkdown(html: string): string {
    let md = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n")
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i>(.*?)<\/i>/gi, "*$1*")
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)")
      .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)")
      .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, list) =>
        list.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n"),
      )
      .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, list) => {
        let idx = 1;
        return list.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${idx++}. $1\n`);
      })
      .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, quote) =>
        quote
          .replace(/<p[^>]*>(.*?)<\/p>/gi, "> $1\n")
          .split("\n")
          .map((l: string) => (l.trim() ? `> ${l.trim()}` : ">"))
          .join("\n") + "\n\n",
      )
      .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "```\n$1\n```\n\n")
      .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
      .replace(/<hr[^>]*\/?>/gi, "---\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{4,}/g, "\n\n\n")
      .trim();

    return md;
  }

  static async exportPDF(
    title: string,
    contentHtml: string,
    element: HTMLElement,
  ): Promise<ExportResult> {
    try {
      const { default: html2canvas } = await import("html2canvas");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc: Document) => {
          const styleSheets = clonedDoc.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
            'style, link[rel="stylesheet"]',
          );
          styleSheets.forEach((s) => {
            if (s.textContent?.includes("lab(") || s.textContent?.includes("oklch(") || s.textContent?.includes("lch(") || s.textContent?.includes("color(")) {
              s.remove();
            }
          });
        },
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return {
        success: true,
        blob: pdf.output("blob"),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "PDF export failed",
      };
    }
  }

  static async exportDOCX(
    title: string,
    contentHtml: string,
    meta?: {
      authorName?: string;
      featuredImage?: string;
    },
  ): Promise<ExportResult> {
    try {
      const cleanHtml = this.exportHTML(title, contentHtml, {
        authorName: meta?.authorName,
        featuredImage: meta?.featuredImage,
      });

      const wordHtml = cleanHtml.replace(
        "</body>",
        `<p style="margin-top:40px;color:#999;font-size:10pt">Generated by AI Blog Writer</p>\n</body>`,
      );

      const blob = new Blob([wordHtml], {
        type: "application/msword",
      });

      return { success: true, blob };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "DOCX export failed",
      };
    }
  }

  static exportJSON(title: string, contentHtml: string, contentMarkdown: string): string {
    const data = {
      title,
      html: contentHtml,
      markdown: contentMarkdown,
      exportedAt: new Date().toISOString(),
      generator: "AI Blog Writer",
    };
    return JSON.stringify(data, null, 2);
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static downloadString(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }
}
