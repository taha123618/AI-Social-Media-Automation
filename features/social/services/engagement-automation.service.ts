import { MetaBusinessManagerService } from './meta-business-manager-extended.service';
import prisma from '@/lib/prisma';
import { Platform } from '@/app/generated/prisma/client';
import { SystemLogger } from '@/features/system/services/logger.service';

/**
 * Direct Implementation: Engagement Automation Service
 * Handles auto-replies and lead qualification using structured logic
 */
export class EngagementAutomationService {
  /**
   * Automatically process new comments and DMs
   */
  static async processNewEngagement(businessId: string) {
    try {
      const accounts = await prisma.socialAccount.findMany({
        where: { businessId, isActive: true },
      });

      const results = [];

      for (const account of accounts) {
        const accessToken = await MetaBusinessManagerService.refreshTokenIfNeeded(account);

        if (account.platform === Platform.INSTAGRAM) {
          // 1. Process Instagram DMs
          const conversations = await MetaBusinessManagerService.getInstagramConversations(account.platformId, accessToken);
          
          for (const conv of conversations.slice(0, 10)) {
            const messages = await MetaBusinessManagerService.getConversationMessages(conv.id, accessToken);
            const lastMessage = messages[0];

            if (lastMessage && !lastMessage.isFromMe) {
              const reply = this.generateDirectReply(lastMessage.text);
              if (reply) {
                const participantId = conv.participants.data.find((p: any) => p.id !== account.platformId)?.id;
                if (participantId) {
                  const replyId = await MetaBusinessManagerService.sendInstagramDirectMessage(
                    account.platformId,
                    participantId,
                    reply,
                    accessToken
                  );
                  results.push({ type: 'DM', id: replyId, status: 'AUTO_REPLIED' });
                }
              }
            }
          }
        }
      }

      return { success: true, results };
    } catch (error) {
      console.error('EngagementAutomationService Error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Logic-based reply generator (The "Direct" way)
   */
  private static generateDirectReply(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    // FAQ: Pricing
    if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('how much')) {
      return "Thanks for asking! Our pricing depends on the specific service. You can find our full price list here: [LINK]. Would you like to book a consultation?";
    }

    // FAQ: Hours
    if (lowerText.includes('hours') || lowerText.includes('open') || lowerText.includes('when')) {
      return "We are open Monday-Friday, 9am - 6pm, and Saturdays 10am - 4pm. Can we help you with a specific time?";
    }

    // Lead Qualification: Booking
    if (lowerText.includes('book') || lowerText.includes('appointment') || lowerText.includes('schedule')) {
      return "I'd love to help you get scheduled! You can book directly using this link: [BOOKING_LINK]. What service were you interested in?";
    }

    // Lead Qualification: Service interest
    if (lowerText.includes('interested') || lowerText.includes('tell me more')) {
      return "We'd love to tell you more about our services! What specifically are you looking for help with? Our team is ready to assist.";
    }

    return null; // No auto-reply generated
  }
}

/* 
// MASTRA ALTERNATIVE (Commented out as requested)
// This uses the Mastra Agent to handle complex, context-aware conversations

import { engagementAgent } from '@/mastra/agents/engagement-agent';

export async function runMastraEngagement(businessId: string) {
  const result = await engagementAgent.execute({
    input: "Analyze recent engagement and respond to customers professionally.",
    context: { businessId }
  });
  return result;
}
*/
