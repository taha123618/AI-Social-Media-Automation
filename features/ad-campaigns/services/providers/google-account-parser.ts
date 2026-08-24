export interface GoogleAccountDetails {
  platformAccountId?: string;
  name?: string;
  currency?: string;
  timezone?: string;
  canManageClients?: boolean;
  testAccount?: boolean;
  details: Record<string, unknown>;
}

export class GoogleAccountParser {
  static parse(raw: Record<string, unknown>): GoogleAccountDetails {
    const result: GoogleAccountDetails = { details: raw };

    if (raw.resourceName) {
      const parts = (raw.resourceName as string).split('/');
      if (parts.length > 1) result.platformAccountId = parts[1];
    }

    if (raw.descriptiveName) result.name = raw.descriptiveName as string;
    if (raw.descriptive_name) result.name = raw.descriptive_name as string;
    if (raw.currencyCode) result.currency = raw.currencyCode as string;
    if (raw.currency_code) result.currency = raw.currency_code as string;
    if (raw.timeZone) result.timezone = raw.timeZone as string;
    if (raw.time_zone) result.timezone = raw.time_zone as string;

    if (raw.canManageClients !== undefined) {
      result.canManageClients = Boolean(raw.canManageClients);
    }
    if (raw.testAccount !== undefined) {
      result.testAccount = Boolean(raw.testAccount);
    }

    return result;
  }

  static extractFields(parsed: GoogleAccountDetails) {
    return {
      platformAccountId: parsed.platformAccountId,
      name: parsed.name,
      currency: parsed.currency,
      timezone: parsed.timezone,
    };
  }
}
