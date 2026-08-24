import prisma from '@/lib/prisma';
import { MetaAccountParser } from './providers/meta-account-parser';
import { GoogleAccountParser } from './providers/google-account-parser';

export class AdAccountService {
  static async createAdAccount(businessId: string, platform: string, name: string, platformAccountId?: string) {
    return prisma.adAccount.create({
      data: { businessId, platform: platform as any, name, platformAccountId },
    });
  }

  static async listByBusiness(businessId: string) {
    return prisma.adAccount.findMany({ where: { businessId } });
  }

  static async addCredential(businessId: string, adAccountId: string | null, platform: string, accessToken: string, refreshToken?: string, scopes: string[] = [], expiresAt?: Date, meta?: any) {
    return prisma.platformCredential.create({
      data: {
        businessId,
        adAccountId: adAccountId ?? undefined,
        platform: platform as any,
        accessToken,
        refreshToken,
        scopes,
        expiresAt,
        meta,
      },
    });
  }

  static async getActiveCredentials(businessId: string, platform: string) {
    return prisma.platformCredential.findFirst({
      where: { businessId, platform: platform as any },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async setPrimaryAccount(businessId: string, accountId: string) {
    await prisma.adAccount.updateMany({ where: { businessId }, data: { isPrimary: false } });
    return prisma.adAccount.update({ where: { id: accountId }, data: { isPrimary: true } });
  }

  static async deleteAccount(accountId: string) {
    return prisma.adAccount.delete({ where: { id: accountId } });
  }

  static async refreshMetaDetails(accountId: string) {
    const account = await prisma.adAccount.findUnique({ where: { id: accountId } });
    if (!account) throw new Error('AdAccount not found');
    if (account.platform !== 'META') throw new Error('Not a Meta account');

    const cred = await prisma.platformCredential.findFirst({ where: { businessId: account.businessId, platform: 'META' as any }, orderBy: { createdAt: 'desc' } });
    if (!cred?.accessToken) throw new Error('No Meta credential available');

    const platformAccountId = account.platformAccountId;
    if (!platformAccountId) throw new Error('Account missing platformAccountId');

    const res = await fetch(`https://graph.facebook.com/v17.0/${encodeURIComponent(platformAccountId)}?fields=id,account_id,name,account_status,account_currency,currency,balance,timezone_name,min_daily_budget,lifetime_spend&access_token=${encodeURIComponent(cred.accessToken)}`);
    const json = await res.json();

    const parsed = MetaAccountParser.parse(json as Record<string, unknown>);
    const fields = MetaAccountParser.extractFields(parsed);
    const normalized: any = { ...fields, details: json, lastSyncedAt: new Date() };

    return prisma.adAccount.update({ where: { id: accountId }, data: normalized });
  }

  static async refreshGoogleDetails(accountId: string) {
    const account = await prisma.adAccount.findUnique({ where: { id: accountId } });
    if (!account) throw new Error('AdAccount not found');
    if (account.platform !== 'GOOGLE') throw new Error('Not a Google account');

    const cred = await prisma.platformCredential.findFirst({ where: { businessId: account.businessId, platform: 'GOOGLE' as any }, orderBy: { createdAt: 'desc' } });
    if (!cred?.accessToken) throw new Error('No Google credential available');

    const third = await prisma.thirdPartyService.findFirst({ where: { businessId: account.businessId, platform: 'GOOGLE_BUSINESS' as any } });
    const developerToken = third?.apiKey ?? process.env.GOOGLE_DEVELOPER_TOKEN;
    if (!developerToken) throw new Error('Developer token not configured');

    const customerId = account.platformAccountId;
    if (!customerId) throw new Error('Account missing customer id');

    const url = `https://googleads.googleapis.com/v14/customers/${encodeURIComponent(customerId)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${cred.accessToken}`, 'developer-token': developerToken } });
    const json = await res.json();

    const parsed = GoogleAccountParser.parse(json as Record<string, unknown>);
    const fields = GoogleAccountParser.extractFields(parsed);
    const normalized: any = { ...fields, details: json, lastSyncedAt: new Date() };

    return prisma.adAccount.update({ where: { id: accountId }, data: normalized });
  }
}

export default AdAccountService;
