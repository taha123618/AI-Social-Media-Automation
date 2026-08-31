import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import { AutoReplyRule, DMPlatform, SimulateDMInput, SimulateDMResponse } from '../types/dm-automation.types';

export class DMAutomationService {
  /**
   * Fetch configured auto-reply rules for a workspace from database
   */
  static async getRules(businessId: string): Promise<AutoReplyRule[]> {
    try {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { preferences: true },
      });

      const prefs = (business?.preferences as any) || {};
      return Array.isArray(prefs.dmRules) ? prefs.dmRules : DMAutomationService.getDefaultRules(businessId);
    } catch (err) {
      console.warn('[DM AUTOMATION] Error fetching rules:', err);
      return DMAutomationService.getDefaultRules(businessId);
    }
  }

  /**
   * Create or save an auto-reply rule
   */
  static async saveRule(businessId: string, rule: Omit<AutoReplyRule, 'id' | 'createdAt' | 'triggerCount'>): Promise<AutoReplyRule> {
    const rules = await DMAutomationService.getRules(businessId);

    const newRule: AutoReplyRule = {
      ...rule,
      id: `dmrule_${Date.now()}`,
      businessId,
      triggerCount: 0,
      createdAt: new Date().toISOString(),
    };

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { preferences: true },
    });

    const prefs = (business?.preferences as any) || {};
    await prisma.business.update({
      where: { id: businessId },
      data: {
        preferences: {
          ...prefs,
          dmRules: [...rules, newRule],
        },
      },
    });

    await SystemLogger.logActivity({
      action: 'DM_RULE_CREATED',
      entity: 'DMAutomation',
      businessId,
      details: { ruleName: newRule.name, platform: newRule.platform },
    });

    return newRule;
  }

  /**
   * Delete an auto-reply rule
   */
  static async deleteRule(businessId: string, ruleId: string): Promise<boolean> {
    try {
      const rules = await DMAutomationService.getRules(businessId);
      const filtered = rules.filter((r) => r.id !== ruleId);

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { preferences: true },
      });

      const prefs = (business?.preferences as any) || {};
      await prisma.business.update({
        where: { id: businessId },
        data: {
          preferences: {
            ...prefs,
            dmRules: filtered,
          },
        },
      });

      await SystemLogger.logActivity({
        action: 'DM_RULE_DELETED',
        entity: 'DMAutomation',
        businessId,
        details: { ruleId },
      });

      return true;
    } catch (err) {
      console.error('[DM AUTOMATION] Error deleting rule:', err);
      return false;
    }
  }

  /**
   * Toggle active state of a rule
   */
  static async toggleRule(businessId: string, ruleId: string, isActive: boolean): Promise<boolean> {
    try {
      const rules = await DMAutomationService.getRules(businessId);
      const updated = rules.map((r) => (r.id === ruleId ? { ...r, isActive } : r));

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { preferences: true },
      });

      const prefs = (business?.preferences as any) || {};
      await prisma.business.update({
        where: { id: businessId },
        data: {
          preferences: {
            ...prefs,
            dmRules: updated,
          },
        },
      });

      return true;
    } catch (err) {
      console.error('[DM AUTOMATION] Error toggling rule:', err);
      return false;
    }
  }

  /**
   * Simulate and generate an AI auto-reply to an incoming DM
   */
  static async processIncomingDM(input: SimulateDMInput): Promise<SimulateDMResponse> {
    const { businessId, platform, senderName, messageText } = input;
    const rules = await DMAutomationService.getRules(businessId);
    const activeRules = rules.filter((r) => r.isActive && (r.platform === platform || !r.platform));

    const lowerMessage = messageText.toLowerCase();

    // Check keyword rule matches
    let matchedRule: AutoReplyRule | undefined;
    for (const rule of activeRules) {
      if (rule.triggerKeywords.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
        matchedRule = rule;
        break;
      }
    }

    let intent: SimulateDMResponse['intent'] = 'GENERAL';
    if (
      lowerMessage.includes('price') ||
      lowerMessage.includes('pricing') ||
      lowerMessage.includes('cost') ||
      lowerMessage.includes('rate') ||
      lowerMessage.includes('how much')
    ) {
      intent = 'PRICING';
    } else if (lowerMessage.includes('call') || lowerMessage.includes('meeting') || lowerMessage.includes('demo') || lowerMessage.includes('book')) {
      intent = 'MEETING_REQUEST';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('issue') || lowerMessage.includes('broken') || lowerMessage.includes('error')) {
      intent = 'SUPPORT_QUESTION';
    } else if (lowerMessage.includes('info') || lowerMessage.includes('service') || lowerMessage.includes('details')) {
      intent = 'LEAD_INQUIRY';
    }

    let replyText = matchedRule ? matchedRule.replyTemplate : 'Thanks for reaching out! A member of our team will get back to you shortly.';
    let isAiSynthesized = false;

    // Fetch brand context from DB
    let brandName = 'our team';
    try {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { name: true },
      });
      if (business?.name) brandName = business.name;
    } catch (e) {}

    // AI Contextual Enhancement
    if (!matchedRule || matchedRule.aiEnhance) {
      try {
        const prompt = `You are a friendly, highly professional conversational AI assistant for ${brandName} on ${platform} replying directly to a DM from "${senderName}".
User DM message: "${messageText}"
Classified Intent: ${intent}
${matchedRule ? `Base template guidelines: "${matchedRule.replyTemplate}"` : ''}

Draft a warm, helpful, 1-3 sentence direct message response. If appropriate, offer next steps or our demo link. Do not include subject lines or email sign-offs.`;

        const response = await AIService.generateResponse({
          messages: [
            { role: 'system', content: 'You are an autonomous social media DM responder. Keep answers concise, human, and conversational.' },
            { role: 'user', content: prompt },
          ],
        });

        if (response.content) {
          replyText = response.content.trim();
          isAiSynthesized = true;
        }
      } catch (err) {
        console.warn('[DM AUTOMATION] AI generation fallback:', err);
      }
    }

    // Auto-capture qualified lead into database if actionable intent and valid business
    if (intent === 'MEETING_REQUEST' || intent === 'PRICING' || intent === 'LEAD_INQUIRY') {
      try {
        const businessExists = await prisma.business.findUnique({
          where: { id: businessId },
          select: { id: true },
        });

        if (businessExists) {
          await prisma.lead.create({
            data: {
              businessId: businessExists.id,
              leadType: intent === 'MEETING_REQUEST' ? 'BOOKING' : 'MESSAGE',
              status: 'NEW',
              source: platform.toUpperCase(),
              notes: `Inbound DM lead from ${senderName} on ${platform}`,
              metadata: {
                senderName,
                intent,
                initialMessage: messageText,
                autoReplied: true,
                replyText,
              },
            },
          });
        }
      } catch (leadErr) {
        // Safe logging if lead model constraints differ
        console.warn('[DM AUTOMATION] Note on lead record persistence:', leadErr);
      }
    }

    const result: SimulateDMResponse = {
      replyText,
      matchedRuleId: matchedRule?.id,
      matchedRuleName: matchedRule?.name,
      intent,
      confidenceScore: matchedRule ? 95 : 82,
      isAiSynthesized,
      recommendedAction: intent === 'MEETING_REQUEST' ? 'Route to Sales CRM' : 'Log conversation in inbox',
    };

    await SystemLogger.logActivity({
      action: 'DM_PROCESSED',
      entity: 'DMAutomation',
      businessId,
      details: { platform, senderName, intent, isAiSynthesized },
    });

    return result;
  }

  /**
   * Default starter rules
   */
  private static getDefaultRules(businessId: string): AutoReplyRule[] {
    return [
      {
        id: `dmrule_default_1`,
        businessId,
        name: 'Pricing & Packages Auto-Reply',
        platform: 'INSTAGRAM',
        triggerKeywords: ['price', 'pricing', 'cost', 'packages'],
        replyTemplate: 'Hey! Thanks for your interest. You can check our transparent plans and features on our site, or let me know what questions you have!',
        aiEnhance: true,
        isActive: true,
        triggerCount: 14,
        createdAt: new Date().toISOString(),
      },
      {
        id: `dmrule_default_2`,
        businessId,
        name: 'Book a Strategy Call',
        platform: 'LINKEDIN',
        triggerKeywords: ['demo', 'book', 'call', 'meeting', 'consultation'],
        replyTemplate: 'Awesome to connect! You can book a 15-minute strategy walkthrough directly on our calendar here: https://cal.com/demo',
        aiEnhance: true,
        bookMeetingLink: 'https://cal.com/demo',
        isActive: true,
        triggerCount: 29,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
