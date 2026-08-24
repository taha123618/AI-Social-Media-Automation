import { MetaAccountParser } from '../providers/meta-account-parser';

describe('MetaAccountParser', () => {
  it('parses full Meta ad account response', () => {
    const raw = {
      id: 'act_123456',
      account_id: '123456',
      name: 'My Ad Account',
      account_status: 1,
      account_currency: 'USD',
      balance: 150.50,
      timezone_name: 'America/New_York',
      min_daily_budget: 100,
      lifetime_spend: 5000.75,
    };

    const result = MetaAccountParser.parse(raw);
    expect(result.platformAccountId).toBe('123456');
    expect(result.name).toBe('My Ad Account');
    expect(result.status).toBe('ACTIVE');
    expect(result.currency).toBe('USD');
    expect(result.balance).toBe(150.50);
    expect(result.timezone).toBe('America/New_York');
    expect(result.minDailyBudget).toBe(100);
    expect(result.lifetimeSpend).toBe(5000.75);
  });

  it('maps numeric account_status to string', () => {
    const statuses: Record<number, string> = {
      1: 'ACTIVE', 2: 'DISABLED', 3: 'UNSETTLED', 7: 'PENDING_RISK_REVIEW',
      8: 'PENDING_SETTLEMENT', 9: 'IN_GRACE_PERIOD', 100: 'PENDING_CLOSURE', 101: 'CLOSED',
    };

    for (const [code, expected] of Object.entries(statuses)) {
      const result = MetaAccountParser.parse({ account_status: parseInt(code) });
      expect(result.status).toBe(expected);
    }
  });

  it('handles object-balance format', () => {
    const raw = { balance: { amount: '250.75', currency: 'USD' } };
    const result = MetaAccountParser.parse(raw);
    expect(result.balance).toBe(250.75);
  });

  it('handles empty response gracefully', () => {
    const result = MetaAccountParser.parse({});
    expect(result.platformAccountId).toBeUndefined();
    expect(result.name).toBeUndefined();
    expect(result.status).toBeUndefined();
    expect(result.balance).toBeUndefined();
  });

  it('extractFields returns only DB-relevant fields', () => {
    const parsed = MetaAccountParser.parse({
      account_id: '789',
      name: 'Test',
      account_status: 1,
      balance: 100,
      timezone_name: 'UTC',
    });
    const fields = MetaAccountParser.extractFields(parsed);
    expect(fields).toEqual({
      platformAccountId: '789',
      name: 'Test',
      status: 'ACTIVE',
      balance: 100,
      currency: undefined,
      timezone: 'UTC',
      pageId: undefined,
    });
    expect(Object.keys(fields)).toHaveLength(7);
  });
});
