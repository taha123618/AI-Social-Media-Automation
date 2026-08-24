import { Campaign, AdSet, Ad, AdVariant } from '@/app/generated/prisma/client';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * Meta Marketing API base URL
 */
const META_API_BASE = 'https://graph.facebook.com/v20.0';

export interface MetaCampaignResult {
  metaCampaignId: string;
}
export interface MetaAdSetResult {
  metaAdSetId: string;
}
export interface MetaAdResult {
  metaAdId: string;
}

/**
 * Real Meta Marketing API Service using Graph API v20.0 (REST — no SDK needed)
 *
 * Prerequisites:
 *  - A Facebook App with "ads_management" & "ads_read" permissions
 *  - A System User access token (long-lived) or user access token stored in SocialAccount
 *  - The Ad Account ID in the format "act_<numeric_id>"
 */
export class MetaAdsService {
  private accessToken: string;
  /** Must be in format "act_<id>", e.g. "act_123456789" */
  private adAccountId: string;

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken;
    // Normalise to "act_<id>" format
    this.adAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private async request<T = any>(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' = 'POST',
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = new URL(`${META_API_BASE}/${path}`);
    url.searchParams.set('access_token', this.accessToken);

    const res = await fetch(url.toString(), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.message ?? `Meta API error ${res.status}`;
      await SystemLogger.logError({ message: `[MetaAdsService] ${msg}`, source: 'MetaAdsService' });
      throw new Error(msg);
    }

    return data as T;
  }

  private mapObjective(objective: string): string {
    const map: Record<string, string> = {
      AWARENESS: 'OUTCOME_AWARENESS',
      TRAFFIC: 'OUTCOME_TRAFFIC',
      LEADS: 'OUTCOME_LEADS',
      SALES: 'OUTCOME_SALES',
      ENGAGEMENT: 'OUTCOME_ENGAGEMENT',
    };
    return map[objective.toUpperCase()] ?? 'OUTCOME_TRAFFIC';
  }

  // ─── Campaign ───────────────────────────────────────────────────────────────

  /**
   * Creates a campaign on Meta and returns the platform campaign ID.
   */
  async createCampaign(campaign: Campaign): Promise<string> {
    const data = await this.request<{ id: string }>(`${this.adAccountId}/campaigns`, 'POST', {
      name: campaign.name,
      objective: this.mapObjective(campaign.objective),
      status: campaign.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
      special_ad_categories: [],
      ...(campaign.lifetimeBudget
        ? { lifetime_budget: Math.round(campaign.lifetimeBudget * 100) } // Meta uses cents
        : campaign.dailyBudget
        ? { daily_budget: Math.round(campaign.dailyBudget * 100) }
        : {}),
    });

    await SystemLogger.logActivity({
      action: 'META_CAMPAIGN_CREATED',
      entity: 'Campaign',
      entityId: campaign.id,
      details: { metaCampaignId: data.id },
    });

    return data.id;
  }

  // ─── Ad Set ─────────────────────────────────────────────────────────────────

  /**
   * Creates an Ad Set under a Meta campaign.
   * `audience` is the JSON audience definition from the AdSet model.
   */
  async createAdSet(
    metaCampaignId: string,
    adSet: AdSet & { campaign: Campaign },
  ): Promise<string> {
    const audience = (adSet.audience as any) ?? {};

    const body: Record<string, unknown> = {
      name: adSet.name,
      campaign_id: metaCampaignId,
      status: 'PAUSED',
      billing_event: 'IMPRESSIONS',
      optimization_goal: this.mapOptimizationGoal(adSet.campaign.objective),
      targeting: {
        age_min: audience.ageMin ?? 18,
        age_max: audience.ageMax ?? 65,
        geo_locations: {
          countries: audience.countries ?? ['US'],
        },
        interests: audience.interests ?? [],
      },
      ...(adSet.dailyBudget
        ? { daily_budget: Math.round(adSet.dailyBudget * 100) }
        : { daily_budget: 1000 }), // fallback $10/day
    };

    if (adSet.campaign.startDate) {
      body.start_time = Math.floor(new Date(adSet.campaign.startDate).getTime() / 1000).toString();
    }
    if (adSet.campaign.endDate) {
      body.end_time = Math.floor(new Date(adSet.campaign.endDate).getTime() / 1000).toString();
    }

    const data = await this.request<{ id: string }>(`${this.adAccountId}/adsets`, 'POST', body);
    return data.id;
  }

  private mapOptimizationGoal(objective: string): string {
    const map: Record<string, string> = {
      AWARENESS: 'REACH',
      TRAFFIC: 'LINK_CLICKS',
      LEADS: 'LEAD_GENERATION',
      SALES: 'OFFSITE_CONVERSIONS',
    };
    return map[objective.toUpperCase()] ?? 'LINK_CLICKS';
  }

  // ─── Creative ───────────────────────────────────────────────────────────────

  /**
   * Creates an Ad Creative from a variant and returns the creative ID.
   */
  async createAdCreative(variant: AdVariant, pageId: string, linkUrl: string): Promise<string> {
    const data = await this.request<{ id: string }>(`${this.adAccountId}/adcreatives`, 'POST', {
      name: `Creative — ${variant.headline ?? 'Ad'}`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          link: linkUrl,
          message: variant.primaryText ?? '',
          name: variant.headline ?? '',
          call_to_action: {
            type: variant.cta?.toUpperCase().replace(/ /g, '_') ?? 'LEARN_MORE',
            value: { link: linkUrl },
          },
        },
      },
    });

    return data.id;
  }

  // ─── Ad ─────────────────────────────────────────────────────────────────────

  /**
   * Creates an Ad under an Ad Set using a pre-created creative.
   */
  async createAd(metaAdSetId: string, ad: Ad, creativeId: string): Promise<string> {
    const data = await this.request<{ id: string }>(`${this.adAccountId}/ads`, 'POST', {
      name: ad.name,
      adset_id: metaAdSetId,
      creative: { creative_id: creativeId },
      status: 'PAUSED', // Always start paused — activate explicitly
    });

    return data.id;
  }

  // ─── Insights ───────────────────────────────────────────────────────────────

  /**
   * Fetches last-30-day performance insights for a Meta campaign.
   */
  async syncPerformanceData(metaCampaignId: string): Promise<{
    impressions: number;
    reach: number;
    clicks: number;
    spend: number;
    cpc: number;
    ctr: number;
  }> {
    const data = await this.request<{ data: any[] }>(
      `${metaCampaignId}/insights`,
      'GET',
    );

    const row = data.data?.[0] ?? {};
    return {
      impressions: parseInt(row.impressions ?? '0'),
      reach: parseInt(row.reach ?? '0'),
      clicks: parseInt(row.clicks ?? '0'),
      spend: parseFloat(row.spend ?? '0'),
      cpc: parseFloat(row.cpc ?? '0'),
      ctr: parseFloat(row.ctr ?? '0'),
    };
  }

  // ─── Status Controls ────────────────────────────────────────────────────────

  async pauseCampaign(metaCampaignId: string) {
    await this.request(`${metaCampaignId}`, 'POST', { status: 'PAUSED' });
  }

  async activateCampaign(metaCampaignId: string) {
    await this.request(`${metaCampaignId}`, 'POST', { status: 'ACTIVE' });
  }

  async deleteCampaign(metaCampaignId: string) {
    await this.request(`${metaCampaignId}`, 'DELETE');
  }
}
