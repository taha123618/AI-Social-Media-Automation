import { BlogSEOService } from '../blog-seo.service';

describe('BlogSEOService', () => {
  const goodTitle = '10 Proven Social Media Strategies to Scale Your Local Business';
  const goodDescription = 'Learn actionable social media tactics to grow your local customer base, increase organic reach, and boost your monthly revenue effortlessly.';
  const targetKeywords = ['social media', 'local business', 'growth'];

  const samplePostContent = `
    <h1>10 Proven Social Media Strategies to Scale Your Local Business</h1>
    <p>Social media is essential for every local business looking to thrive in 2026. Discover how to drive real engagement.</p>
    <h2>1. Consistency in Social Media</h2>
    <p>Publishing daily on social media keeps your brand top of mind for local business customers.</p>
    <h2>2. Visual Content and Storytelling</h2>
    <p>Short-form video and crisp imagery enhance your local business storytelling and social media impact.</p>
    <h2>Conclusion</h2>
    <p>Apply these social media strategies to see consistent local business growth.</p>
  `;

  it('calculates full SEO analysis with positive score for well-optimized article', () => {
    const report = BlogSEOService.analyze(
      goodTitle,
      samplePostContent,
      goodDescription,
      targetKeywords
    );

    expect(report.overallScore).toBeGreaterThanOrEqual(70);
    expect(report.titleScore).toBeGreaterThanOrEqual(80);
    expect(report.metaDescriptionScore).toBeGreaterThanOrEqual(80);
    expect(Array.isArray(report.issues)).toBe(true);
    expect(Array.isArray(report.suggestions)).toBe(true);
  });

  it('detects missing title and deducts score with actionable error issue', () => {
    const report = BlogSEOService.analyze(
      '',
      samplePostContent,
      goodDescription,
      targetKeywords
    );

    expect(report.titleScore).toBe(0);
    expect(report.issues.some((issue) => issue.type === 'title' && issue.severity === 'error')).toBe(true);
  });

  it('detects missing primary keyword in title', () => {
    const report = BlogSEOService.analyze(
      'A Random Post About Something Else Entirely',
      samplePostContent,
      goodDescription,
      ['cryptocurrency']
    );

    expect(report.titleScore).toBeLessThan(100);
    expect(report.issues.some((issue) => issue.type === 'title')).toBe(true);
  });

  it('detects meta description length issues', () => {
    const shortDesc = 'Too short.';
    const report = BlogSEOService.analyze(
      goodTitle,
      samplePostContent,
      shortDesc,
      targetKeywords
    );

    expect(report.metaDescriptionScore).toBeLessThan(100);
    expect(report.issues.some((issue) => issue.type === 'meta')).toBe(true);
  });
});
