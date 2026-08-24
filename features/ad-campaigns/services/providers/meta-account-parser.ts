export interface MetaAccountDetails {
  platformAccountId?: string;
  name?: string;
  status?: string;
  balance?: number;
  currency?: string;
  timezone?: string;
  pageId?: string;
  minDailyBudget?: number;
  lifetimeSpend?: number;
  details: Record<string, unknown>;
}

export class MetaAccountParser {
  static parse(raw: Record<string, unknown>): MetaAccountDetails {
    const result: MetaAccountDetails = { details: raw };

    if (raw.account_id) result.platformAccountId = raw.account_id as string;
    if (raw.name) result.name = raw.name as string;

    if (raw.account_status !== undefined) {
      const statusMap: Record<number, string> = {
        1: 'ACTIVE',
        2: 'DISABLED',
        3: 'UNSETTLED',
        7: 'PENDING_RISK_REVIEW',
        8: 'PENDING_SETTLEMENT',
        9: 'IN_GRACE_PERIOD',
        100: 'PENDING_CLOSURE',
        101: 'CLOSED',
        201: 'ANY_ACTIVE',
        202: 'ANY_CLOSED',
      };
      result.status = statusMap[raw.account_status as number] ?? String(raw.account_status);
    }

    if (raw.account_currency) result.currency = raw.account_currency as string;
    else if (raw.currency) result.currency = raw.currency as string;

    if (raw.timezone_name) result.timezone = raw.timezone_name as string;
    else if (raw.timezone_id) result.timezone = String(raw.timezone_id);

    if (raw.balance) {
      if (typeof raw.balance === 'object' && (raw.balance as any).amount) {
        result.balance = parseFloat((raw.balance as any).amount);
      } else {
        result.balance = parseFloat(String(raw.balance)) || undefined;
      }
    }

    if (raw.min_daily_budget) {
      result.minDailyBudget = parseInt(String(raw.min_daily_budget)) || undefined;
    }

    if (raw.lifetime_spend) {
      result.lifetimeSpend = parseFloat(String(raw.lifetime_spend)) || undefined;
    }

    return result;
  }

  static extractFields(parsed: MetaAccountDetails) {
    return {
      platformAccountId: parsed.platformAccountId,
      name: parsed.name,
      status: parsed.status,
      balance: parsed.balance,
      currency: parsed.currency,
      timezone: parsed.timezone,
      pageId: parsed.pageId,
    };
  }
}
