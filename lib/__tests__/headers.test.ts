import nextConfig from '../../next.config';

describe('HTTP Security Headers Configuration', () => {
  it('defines headers function in next.config.ts', () => {
    expect(typeof nextConfig.headers).toBe('function');
  });

  it('configures critical security headers for all routes', async () => {
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    expect(headersConfig.length).toBeGreaterThan(0);

    const rootRule = headersConfig.find((rule: any) => rule.source === '/(.*)');
    expect(rootRule).toBeDefined();

    const headersMap = new Map(
      rootRule?.headers.map((h: { key: string; value: string }) => [h.key, h.value])
    );

    expect(headersMap.get('X-Frame-Options')).toBe('DENY');
    expect(headersMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headersMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headersMap.get('Strict-Transport-Security')).toContain('max-age=31536000');
    expect(headersMap.get('X-XSS-Protection')).toBe('1; mode=block');
    expect(headersMap.get('Permissions-Policy')).toBeDefined();
  });
});
