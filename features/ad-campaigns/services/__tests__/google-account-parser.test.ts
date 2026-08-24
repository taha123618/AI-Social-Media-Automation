import { GoogleAccountParser } from '../providers/google-account-parser';

describe('GoogleAccountParser', () => {
  it('parses full Google Ads account response', () => {
    const raw = {
      resourceName: 'customers/1234567890',
      descriptiveName: 'My Google Ads',
      currencyCode: 'USD',
      timeZone: 'America/Los_Angeles',
      canManageClients: false,
      testAccount: true,
    };

    const result = GoogleAccountParser.parse(raw);
    expect(result.platformAccountId).toBe('1234567890');
    expect(result.name).toBe('My Google Ads');
    expect(result.currency).toBe('USD');
    expect(result.timezone).toBe('America/Los_Angeles');
    expect(result.canManageClients).toBe(false);
    expect(result.testAccount).toBe(true);
  });

  it('handles snake_case field names', () => {
    const raw = {
      resourceName: 'customers/9876543210',
      descriptiveName: 'Snake Case Account',
      currencyCode: 'EUR',
      timeZone: 'Europe/London',
    };

    const result = GoogleAccountParser.parse(raw);
    expect(result.platformAccountId).toBe('9876543210');
    expect(result.name).toBe('Snake Case Account');
    expect(result.currency).toBe('EUR');
    expect(result.timezone).toBe('Europe/London');
  });

  it('handles empty response gracefully', () => {
    const result = GoogleAccountParser.parse({});
    expect(result.platformAccountId).toBeUndefined();
    expect(result.name).toBeUndefined();
    expect(result.currency).toBeUndefined();
  });

  it('extractFields returns only DB-relevant fields', () => {
    const parsed = GoogleAccountParser.parse({
      resourceName: 'customers/555',
      descriptiveName: 'Test',
      currencyCode: 'GBP',
      timeZone: 'Europe/Paris',
    });
    const fields = GoogleAccountParser.extractFields(parsed);
    expect(fields).toEqual({
      platformAccountId: '555',
      name: 'Test',
      currency: 'GBP',
      timezone: 'Europe/Paris',
    });
    expect(Object.keys(fields)).toHaveLength(4);
  });
});
