---
name: seo-and-content
description: Use this skill for optimizing content for search engines, implementing SEO best practices, and managing content strategy across the application.
---

# SEO and Content Engineering

You are operating as a Senior Content Strategist & Technical SEO Specialist overseeing the AI Blog Writer, SEO audits, structured data markup, and cross-platform content serialization.

## AI Blog System Architecture (`features/ai-blog/`)

```text
features/ai-blog/
  components/
    BlogEditor/               # TipTap rich text editor with real-time sync & SEO audit
    BlogPreview/              # Live blog preview with auto-injected Unsplash images
    BlogExportPanel/          # PDF, Word DOCX, rich clipboard, MD, HTML export
    BlogHistoryModal/         # Version history comparison and restore
  services/
    blog-image.service.ts     # Context-aware Unsplash image injection by category
    blog-clipboard.service.ts # Rich clipboard multi-MIME (text/html + text/plain)
    blog-html-serializer.service.ts # Platform serializers (WordPress, Webflow, Medium, Shopify, Notion)
    blog-export.service.ts    # PDF (jsPDF + html2canvas), DOCX, MD generator
    blog-seo.service.ts       # Real-time SEO scorer, readability, keyword density
```

## Core Content & SEO Capabilities

### 1) Real-Time SEO Scoring Engine
The SEO audit evaluates:
- **Keyword Density & Distribution**: Primary and secondary keyword occurrences in H1, H2, intro, and conclusion.
- **Readability Scores**: Flesch-Kincaid grade level, average sentence length, paragraph density.
- **Meta Tags**: Optimized Title (<60 chars) and Meta Description (150-160 chars).
- **Structure Check**: Valid heading hierarchy (single H1, logical H2/H3 nesting).

### 2) Platform-Specific Serialization (`BlogHtmlSerializer`)
- **WordPress**: Inserts standard Gutenberg block comments (`<!-- wp:heading -->`, `<!-- wp:paragraph -->`).
- **Medium**: Strips complex wrappers, formats clean semantic HTML.
- **Webflow**: Generates rich text container markup with inline utility classes.
- **Shopify**: Minimalist clean HTML suited for Shopify article description fields.
- **Notion**: Semantic HTML ready for seamless Notion paste.

### 3) Multi-MIME Rich Clipboard (`BlogClipboardService`)
Uses `navigator.clipboard.write()` with `ClipboardItem` containing both `text/html` and `text/plain` so pasting into CMS platforms preserves headings, bold text, links, blockquotes, and lists flawlessly.

```typescript
import { BlogClipboardService } from '@/features/ai-blog/services/blog-clipboard.service';

export async function copyBlogContent(htmlContent: string, title: string) {
  await BlogClipboardService.copyToClipboard(htmlContent, title);
}
```

### 4) Next.js Technical SEO Best Practices
- Every public marketing page must export `metadata` with `title`, `description`, `openGraph`, `twitter`, and canonical `alternates`.
- JSON-LD Structured Data: Include `SoftwareApplication` or `BlogPosting` schemas on public pages.
