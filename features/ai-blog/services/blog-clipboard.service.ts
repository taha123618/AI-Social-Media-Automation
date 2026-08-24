export class BlogClipboardService {
  static buildRichHtml(
    title: string,
    content: string,
    meta?: {
      metaDescription?: string;
      author?: string;
      publishedDate?: string;
      featuredImage?: string;
      siteName?: string;
    },
  ): string {
    const sections: string[] = [];

    sections.push(`<!-- wp:heading --><h1 class="wp-block-heading">${this.escapeHtml(title)}</h1><!-- /wp:heading -->`);

    if (meta?.metaDescription) {
      sections.push(`<!-- wp:paragraph --><p class="has-text-color has-gray-color has-small-font-size" style="color:#6b7280"><em>${this.escapeHtml(meta.metaDescription)}</em></p><!-- /wp:paragraph -->`);
    }

    if (meta?.featuredImage) {
      sections.push(`<!-- wp:image --><figure class="wp-block-image"><img src="${meta.featuredImage}" alt="${this.escapeHtml(title)}" style="width:100%;height:auto;border-radius:8px" /></figure><!-- /wp:image -->`);
    }

    sections.push(content);

    if (meta?.author || meta?.publishedDate) {
      const metaParts: string[] = [];
      if (meta?.author) metaParts.push(`By ${this.escapeHtml(meta.author)}`);
      if (meta?.publishedDate) metaParts.push(meta.publishedDate);
      sections.push(`<!-- wp:paragraph --><p style="font-size:0.875rem;color:#6b7280">${metaParts.join(" · ")}</p><!-- /wp:paragraph -->`);
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${this.escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #1a1a2e; }
  h1 { font-size: 2.25rem; font-weight: 800; line-height: 1.2; margin-bottom: 1rem; }
  h2 { font-size: 1.75rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
  h3 { font-size: 1.375rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
  h4 { font-size: 1.125rem; font-weight: 600; margin-top: 1.25rem; }
  p { margin-bottom: 1rem; }
  ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; }
  li { margin-bottom: 0.375rem; }
  blockquote { border-left: 4px solid #3b82f6; padding: 0.75rem 1.25rem; margin: 1.5rem 0; background: #f8fafc; border-radius: 0 0.5rem 0.5rem 0; font-style: italic; }
  pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0; }
  code { background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875rem; }
  pre code { background: none; padding: 0; }
  table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
  th { background: #f8fafc; padding: 0.75rem 1rem; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
  td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; }
  img, .blog-context-image { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1.5rem 0; display: block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }
  .blog-context-image-wrap { margin: 1.5rem 0; position: relative; }
  .blog-context-image-wrap figcaption { font-size: 0.8rem; color: #6b7280; text-align: center; margin-top: 0.5rem; font-style: italic; }
  figure { margin: 1.5rem 0; }
  a { color: #2563eb; text-decoration: none; }
  a:hover { text-decoration: underline; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
  @media (prefers-color-scheme: dark) {
    body { background: #0f172a; color: #e2e8f0; }
    blockquote { background: #1e293b; border-left-color: #60a5fa; }
    th { background: #1e293b; border-bottom-color: #334155; }
    td { border-bottom-color: #334155; }
    code { background: #334155; }
    hr { border-top-color: #334155; }
  }
</style>
</head>
<body>
${sections.join("\n\n")}
</body>
</html>`;

    return html;
  }

  static async copyToClipboard(
    title: string,
    content: string,
    meta?: {
      metaDescription?: string;
      author?: string;
      publishedDate?: string;
      featuredImage?: string;
      siteName?: string;
    },
  ): Promise<void> {
    const richHtml = this.buildRichHtml(title, content, meta);
    const plainText = this.stripHtml(content);

    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([richHtml], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" }),
    });

    await navigator.clipboard.write([clipboardItem]);
  }

  static stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<\/(p|h[1-6]|li|tr|blockquote|div)>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
