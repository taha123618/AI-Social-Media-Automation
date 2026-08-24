export interface SerializeOptions {
  wrapInHtml?: boolean;
  inlineStyles?: boolean;
  includeFeaturedImage?: boolean;
  featuredImageUrl?: string;
  siteName?: string;
  authorName?: string;
  wordPressBlocks?: boolean;
  addMetaViewport?: boolean;
}

export class BlogHtmlSerializer {
  static serialize(
    title: string,
    contentHtml: string,
    options: SerializeOptions = {},
  ): string {
    const {
      wrapInHtml = true,
      inlineStyles = false,
      includeFeaturedImage = false,
      featuredImageUrl = "",
      siteName = "",
      authorName = "",
      wordPressBlocks = true,
      addMetaViewport = true,
    } = options;

    let cleaned = this.cleanContent(contentHtml);

    if (includeFeaturedImage && featuredImageUrl) {
      cleaned = this.injectFeaturedImage(cleaned, featuredImageUrl, wordPressBlocks);
    }

    cleaned = this.normalizeHeadings(cleaned);
    cleaned = this.ensureAltText(cleaned);
    cleaned = this.wrapTables(cleaned);

    const body = this.buildBodyContent(title, cleaned, {
      siteName,
      authorName,
      featuredImageUrl: includeFeaturedImage ? featuredImageUrl : undefined,
      wordPressBlocks,
    });

    if (!wrapInHtml) return body;

    return this.wrapDocument(title, body, { siteName, addMetaViewport, inlineStyles });
  }

  static serializeForWordPress(title: string, contentHtml: string, authorName?: string): string {
    return this.serialize(title, contentHtml, {
      wrapInHtml: false,
      wordPressBlocks: true,
      authorName,
    });
  }

  static serializeForMedium(title: string, contentHtml: string): string {
    return this.serialize(title, contentHtml, {
      wrapInHtml: false,
      wordPressBlocks: false,
    });
  }

  static serializeForWebflow(title: string, contentHtml: string): string {
    return this.serialize(title, contentHtml, {
      wrapInHtml: true,
      inlineStyles: true,
      wordPressBlocks: false,
      addMetaViewport: true,
    });
  }

  static serializeForShopify(title: string, contentHtml: string): string {
    return this.serialize(title, contentHtml, {
      wrapInHtml: false,
      inlineStyles: true,
      wordPressBlocks: false,
    });
  }

  static serializeForNotion(title: string, contentHtml: string): string {
    return this.serialize(title, contentHtml, {
      wrapInHtml: false,
      wordPressBlocks: false,
    });
  }

  private static cleanContent(html: string): string {
    return html
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/\s*data-(?:id|key|type)="[^"]*"/gi, "")
      .replace(/\s*contenteditable="[^"]*"/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  private static injectFeaturedImage(html: string, imageUrl: string, wordPressBlocks: boolean): string {
    const imgTag = wordPressBlocks
      ? `<!-- wp:cover {"url":"${imageUrl}","dimRatio":50,"overlayColor":"black","align":"full"} -->\n<div class="wp-block-cover"><span aria-hidden="true" class="wp-block-cover__background has-black-background-color has-background-dim"></span><img class="wp-block-cover__image-background" alt="Featured image" src="${imageUrl}" style="object-position:50% 50%" data-object-fit="cover"/><div class="wp-block-cover__inner-container"></div></div>\n<!-- /wp:cover -->`
      : `<figure class="featured-image"><img src="${imageUrl}" alt="Featured image" style="width:100%;height:auto;border-radius:12px;margin-bottom:2rem" /></figure>`;

    const h1Match = html.match(/<h1[^>]*>.*?<\/h1>/i);
    if (h1Match && h1Match.index !== undefined) {
      const idx = h1Match.index + h1Match[0].length;
      return html.slice(0, idx) + "\n" + imgTag + "\n" + html.slice(idx);
    }
    return imgTag + "\n" + html;
  }

  private static normalizeHeadings(html: string): string {
    return html.replace(/<h1[^>]*>/gi, '<h1 class="wp-block-heading">');
  }

  private static ensureAltText(html: string): string {
    return html.replace(/<img\s+(?:[^>]*?\s)?alt=""/gi, (match) => {
      if (match.includes('alt=""')) {
        return match.replace('alt=""', 'alt="Article image"');
      }
      return match;
    });
  }

  private static wrapTables(html: string): string {
    return html.replace(/<table[^>]*>/gi, '<figure class="wp-block-table"><table>');
  }

  private static buildBodyContent(
    title: string,
    content: string,
    meta: { siteName?: string; authorName?: string; featuredImageUrl?: string; wordPressBlocks?: boolean },
  ): string {
    const parts: string[] = [];

    if (meta.wordPressBlocks) {
      parts.push(`<!-- wp:heading {"level":1} --><h1 class="wp-block-heading">${this.escapeHtml(title)}</h1><!-- /wp:heading -->`);
      if (meta.authorName) {
        parts.push(`<!-- wp:paragraph --><p class="has-small-font-size" style="color:#6b7280">By ${this.escapeHtml(meta.authorName)}</p><!-- /wp:paragraph -->`);
      }
    } else {
      parts.push(`<h1>${this.escapeHtml(title)}</h1>`);
      if (meta.authorName) {
        parts.push(`<p class="blog-author" style="color:#6b7280">By ${this.escapeHtml(meta.authorName)}</p>`);
      }
    }

    parts.push(content);

    return parts.join("\n\n");
  }

  private static wrapDocument(
    title: string,
    bodyContent: string,
    meta: { siteName?: string; addMetaViewport?: boolean; inlineStyles?: boolean },
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">${meta?.addMetaViewport ? '\n<meta name="viewport" content="width=device-width, initial-scale=1.0">' : ""}
<meta name="generator" content="AI Blog Writer">
<title>${this.escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #1a1a2e; background: #fff; }
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
  a { color: #2563eb; text-decoration: underline; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
  .featured-image img { border-radius: 12px; }
  figure { margin: 1.5rem 0; }
  figcaption { font-size: 0.875rem; color: #6b7280; text-align: center; margin-top: 0.5rem; }
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
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
