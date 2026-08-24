import { BlogClipboardService } from '../blog-clipboard.service';

describe('BlogClipboardService', () => {
  const title = 'Modern Social Growth Blueprint';
  const content = '<p>Discover actionable insights.</p><h2>Strategy 1</h2><p>Focus on community building.</p>';

  describe('buildRichHtml', () => {
    it('constructs a full HTML document with Gutenberg blocks and typography styles', () => {
      const richHtml = BlogClipboardService.buildRichHtml(title, content, {
        author: 'Jane Doe',
        publishedDate: '2026-08-25',
        metaDescription: 'A modern guide for social media automation.',
        featuredImage: 'https://images.unsplash.com/photo-test',
      });

      expect(richHtml).toContain('<!DOCTYPE html>');
      expect(richHtml).toContain(title);
      expect(richHtml).toContain('Jane Doe');
      expect(richHtml).toContain('2026-08-25');
      expect(richHtml).toContain('https://images.unsplash.com/photo-test');
      expect(richHtml).toContain('<!-- wp:heading -->');
    });
  });

  describe('stripHtml', () => {
    it('accurately strips HTML tags and normalizes whitespace for plaintext clipboard fallback', () => {
      const html = '<h1>Hello</h1><p>This is a <strong>bold</strong> statement.</p>';
      const plain = BlogClipboardService.stripHtml(html);
      expect(plain).toBe('Hello\n\nThis is a bold statement.');
    });

    it('handles special character entities correctly', () => {
      const html = '<p>Cats &amp; Dogs &gt; Fish &lt; Birds &quot;quote&quot; &#39;apostrophe&#39;</p>';
      const plain = BlogClipboardService.stripHtml(html);
      expect(plain).toBe('Cats & Dogs > Fish < Birds "quote" \'apostrophe\'');
    });
  });
});
