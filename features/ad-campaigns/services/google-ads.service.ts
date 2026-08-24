import { Campaign, AdSet, Ad, AdVariant } from '@/app/generated/prisma/client';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * Google Ads REST API Service
 *
 * Uses the Google Ads API v17 via REST (no heavy SDK).
 *
 * Prerequisites:
 *  - Google Cloud project with the Google Ads API enabled
 *  - OAuth 2.0 refresh token for the manager / customer account
 *  - Developer token (from Google Ads Manager Account)
 *  - Customer ID (the advertising account): "123-456-7890" → "1234567890"
 */

const GOOGLE_ADS_API_VERSION = 'v17';
const GOOGLE_ADS_API_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

export class GoogleAdsService {
  private developerToken: string;
  /** Numeric customer ID (no dashes) */
  private customerId: string;
  private accessToken: string;

  constructor(developerToken: string, customerId: string, accessToken: string) {
    this.developerToken = developerToken;
    this.customerId = customerId.replace(/-/g, '');
    this.accessToken = accessToken;
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
      'developer-token': this.developerToken,
    };
  }

  private async request<T = any>(
    path: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'POST',
    body?: unknown,
  ): Promise<T> {
    const url = `${GOOGLE_ADS_API_BASE}/customers/${this.customerId}/${path}`;
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data.error?.message ?? `Google Ads API error ${res.status}`;
      await SystemLogger.logError({ message: `[GoogleAdsService] ${msg}`, source: 'GoogleAdsService' });
      throw new Error(msg);
    }
    return data as T;
  }

  private mapAdvertisingChannelType(objective: string): string {
    const map: Record<string, string> = {
      AWARENESS: 'DISPLAY',
      TRAFFIC: 'SEARCH',
      LEADS: 'SEARCH',
      SALES: 'SHOPPING',
    };
    return map[objective.toUpperCase()] ?? 'SEARCH';
  }

  private mapBiddingStrategy(objective: string) {
    const map: Record<string, string> = {
      AWARENESS: 'TARGET_CPM',
      TRAFFIC: 'MAXIMIZE_CLICKS',
      LEADS: 'TARGET_CPA',
      SALES: 'TARGET_ROAS',
    };
    return map[objective.toUpperCase()] ?? 'MAXIMIZE_CLICKS';
  }

  // ─── Campaign ───────────────────────────────────────────────────────────────

  /**
   * Creates a Google Ads campaign and returns the resource name.
   * Returns the campaign resource name e.g. "customers/123/campaigns/456"
   */
  async createCampaign(campaign: Campaign): Promise<string> {
    const body = {
      operations: [
        {
          create: {
            name: campaign.name,
            status: campaign.status === 'ACTIVE' ? 'ENABLED' : 'PAUSED',
            advertisingChannelType: this.mapAdvertisingChannelType(campaign.objective),
            manualCpc: {},
            campaignBudget: '', // set after budget creation
            startDate: campaign.startDate
              ? new Date(campaign.startDate).toISOString().slice(0, 10).replace(/-/g, '')
              : undefined,
            endDate: campaign.endDate
              ? new Date(campaign.endDate).toISOString().slice(0, 10).replace(/-/g, '')
              : undefined,
          },
        },
      ],
    };

    const data = await this.request<{ results: { resourceName: string }[] }>(
      'campaigns:mutate',
      'POST',
      body,
    );

    const resourceName = data.results?.[0]?.resourceName;
    await SystemLogger.logActivity({
      action: 'GOOGLE_CAMPAIGN_CREATED',
      entity: 'Campaign',
      entityId: campaign.id,
      details: { resourceName },
    });

    return resourceName;
  }

  // ─── Campaign Budget ─────────────────────────────────────────────────────────

  async createBudget(dailyBudgetMicros: number, name: string): Promise<string> {
    const data = await this.request<{ results: { resourceName: string }[] }>(
      'campaignBudgets:mutate',
      'POST',
      {
        operations: [
          {
            create: {
              name,
              deliveryMethod: 'STANDARD',
              amountMicros: dailyBudgetMicros, // e.g. $10 = 10_000_000 micros
            },
          },
        ],
      },
    );
    return data.results?.[0]?.resourceName;
  }

  // ─── Ad Group ───────────────────────────────────────────────────────────────

  /**
   * Creates a Google Ads Ad Group (equivalent to Meta's Ad Set) and returns the resource name.
   */
  async createAdGroup(campaignResourceName: string, adSet: AdSet): Promise<string> {
    const data = await this.request<{ results: { resourceName: string }[] }>(
      'adGroups:mutate',
      'POST',
      {
        operations: [
          {
            create: {
              name: adSet.name,
              campaign: campaignResourceName,
              status: 'PAUSED',
              type: 'SEARCH_STANDARD',
              cpcBidMicros: 1_000_000, // $1 default CPC
            },
          },
        ],
      },
    );
    return data.results?.[0]?.resourceName;
  }

  // ─── Responsive Search Ad ────────────────────────────────────────────────────

  /**
   * Creates a Responsive Search Ad from an AdVariant.
   * Google requires 3–15 headlines and 2–4 descriptions.
   */
  async createResponsiveSearchAd(
    adGroupResourceName: string,
    variants: AdVariant[],
    finalUrl: string,
  ): Promise<string> {
    // Collect up to 15 unique headlines and 4 unique descriptions from all variants
    const headlines = [...new Set(variants.map(v => v.headline).filter(Boolean))].slice(0, 15);
    const descriptions = [...new Set(variants.map(v => v.description).filter(Boolean))].slice(0, 4);

    // Pad if we don't have enough
    while (headlines.length < 3) headlines.push('Learn More Today');
    while (descriptions.length < 2) descriptions.push('Get started now. No commitment required.');

    const data = await this.request<{ results: { resourceName: string }[] }>(
      'adGroupAds:mutate',
      'POST',
      {
        operations: [
          {
            create: {
              adGroup: adGroupResourceName,
              status: 'PAUSED',
              ad: {
                finalUrls: [finalUrl],
                responsiveSearchAd: {
                  headlines: headlines.map(text => ({ text })),
                  descriptions: descriptions.map(text => ({ text })),
                },
              },
            },
          },
        ],
      },
    );

    return data.results?.[0]?.resourceName;
  }

  // ─── Keywords ────────────────────────────────────────────────────────────────

  async addKeywords(adGroupResourceName: string, keywords: string[]): Promise<void> {
    const operations = keywords.slice(0, 20).map(keyword => ({
      create: {
        adGroup: adGroupResourceName,
        text: keyword,
        matchType: 'BROAD',
      },
    }));

    await this.request('adGroupCriteria:mutate', 'POST', { operations });
  }

  // ─── Insights ────────────────────────────────────────────────────────────────

  /**
   * Fetches last 30-day performance metrics via Google Ads Query Language (GAQL).
   */
  async syncPerformanceData(campaignResourceName: string): Promise<{
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    averageCpc: number;
  }> {
    const query = `
      SELECT
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE campaign.resource_name = '${campaignResourceName}'
        AND segments.date DURING LAST_30_DAYS
    `;

    const data = await this.request<{ results: any[] }>(
      'googleAds:searchStream',
      'POST',
      { query },
    );

    const row = data.results?.[0]?.metrics ?? {};
    return {
      impressions: parseInt(row.impressions ?? '0'),
      clicks: parseInt(row.clicks ?? '0'),
      spend: (parseInt(row.costMicros ?? '0')) / 1_000_000,
      conversions: parseFloat(row.conversions ?? '0'),
      ctr: parseFloat(row.ctr ?? '0'),
      averageCpc: (parseInt(row.averageCpc ?? '0')) / 1_000_000,
    };
  }

  // ─── Status Controls ─────────────────────────────────────────────────────────

  async pauseCampaign(campaignResourceName: string): Promise<void> {
    await this.request('campaigns:mutate', 'POST', {
      operations: [{ update: { resourceName: campaignResourceName, status: 'PAUSED' }, updateMask: 'status' }],
    });
  }

  async activateCampaign(campaignResourceName: string): Promise<void> {
    await this.request('campaigns:mutate', 'POST', {
      operations: [{ update: { resourceName: campaignResourceName, status: 'ENABLED' }, updateMask: 'status' }],
    });
  }
}
