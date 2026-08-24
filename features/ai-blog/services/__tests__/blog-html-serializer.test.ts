import { BlogHtmlSerializer } from '../blog-html-serializer.service';

describe('BlogHtmlSerializer', () => {
  const sampleTitle = '10 Proven Social Media Strategies for 2026';
  const sampleContent = `
    <p>Discover the latest techniques to skyrocket your engagement.</p>
    <h2>1. Consistency is Key</h2>
    <p>Post regularly using an automated scheduler.</p>
    <img src="https://images.unsplash.com/photo-1" alt="" />
    <table><tr><td>Metric</td><td>Value</td></tr></table>
  `;

  describe('serializeForWordPress', () => {
    it('generates Gutenberg block comments and heading markup', () => {
      const output = BlogHtmlSerializer.serializeForWordPress(sampleTitle, sampleContent, 'John Doe');
      expect(output).toContain('<!-- wp:heading {"level":1} -->');
      expect(output).toContain(sampleTitle);
      expect(output).toContain('wp-block-table');
      expect(output).toContain('alt="Article image"');
      expect(output).toContain('John Doe');
    });

    it('cleans harmful script and style tags', () => {
      const dirtyContent = '<p>Hello</p><script>alert("xss")</script><style>body { color: red; }</style>';
      const output = BlogHtmlSerializer.serializeForWordPress('Title', dirtyContent);
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('<style>');
      expect(output).toContain('<p>Hello</p>');
    });
  });

  describe('serializeForMedium', () => {
    it('returns clean semantic HTML without WordPress block comments', () => {
      const output = BlogHtmlSerializer.serializeForMedium(sampleTitle, sampleContent);
      expect(output).not.toContain('<!-- wp:');
      expect(output).toContain(`<h1>${sampleTitle}</h1>`);
      expect(output).toContain('Discover the latest techniques');
    });
  });

  describe('serializeForWebflow', () => {
    it('wraps output in full HTML document with viewport and inline styling', () => {
      const output = BlogHtmlSerializer.serializeForWebflow(sampleTitle, sampleContent);
      expect(output).toContain('<!DOCTYPE html>');
      expect(output).toContain('<meta name="viewport"');
      expect(output).toContain('<style>');
      expect(output).toContain(sampleTitle);
    });
  });

  describe('serializeForShopify', () => {
    it('returns body markup without full DOCTYPE wrapper', () => {
      const output = BlogHtmlSerializer.serializeForShopify(sampleTitle, sampleContent);
      expect(output).not.toContain('<!DOCTYPE html>');
      expect(output).toContain(`<h1>${sampleTitle}</h1>`);
    });
  });

  describe('serializeForNotion', () => {
    it('returns standard semantic markup ready for block paste', () => {
      const output = BlogHtmlSerializer.serializeForNotion(sampleTitle, sampleContent);
      expect(output).not.toContain('<!DOCTYPE html>');
      expect(output).not.toContain('<!-- wp:');
      expect(output).toContain(`<h1>${sampleTitle}</h1>`);
    });
  });
});
