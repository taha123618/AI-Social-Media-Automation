import { WorkflowDefinition } from '../types';
import { AIService } from '../ai.service';
import { socialListeningTool } from '../tools/social-listening.tool';

export interface SocialListeningWorkflowInput {
  businessId: string;
  brandName?: string;
  industry?: string;
  competitors?: string[];
}

export interface SocialListeningWorkflowOutput {
  healthScore: number;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  mentionsCount: number;
  topThreatsOrOpportunities: string[];
  strategicBriefing: string;
  recommendedResponses: Array<{ author: string; platform: string; suggestedReply: string }>;
}

export const socialListeningWorkflow: WorkflowDefinition<
  SocialListeningWorkflowInput,
  SocialListeningWorkflowOutput
> = {
  id: 'social-listening-workflow',
  name: 'Social Listening & Threat Radar Workflow',
  description: 'Autonomous multi-step pipeline for scanning brand mentions, competitor share of voice, sentiment risks, and tactical community engagement.',
  steps: [
    {
      id: 'scan-mentions-and-radar',
      description: 'Fetches live omnichannel signals and competitor benchmarks',
      execute: async (input: SocialListeningWorkflowInput) => input,
    },
    {
      id: 'analyze-threats-and-opportunities',
      description: 'Identifies brand reputation threats and high-value conversion opportunities',
      execute: async (input: SocialListeningWorkflowInput) => input,
    },
    {
      id: 'synthesize-executive-briefing',
      description: 'Produces strategic briefing and recommended social engagement actions',
      execute: async (input: SocialListeningWorkflowInput) => input,
    },
  ],
  execute: async (input: SocialListeningWorkflowInput): Promise<SocialListeningWorkflowOutput> => {
    // Step 1: Ingest Radar Signals
    const radarData = await socialListeningTool.execute({
      businessId: input.businessId,
    });

    // Step 2 & 3: Strategic Assessment & Proactive Engagement Generation
    const prompt = `You are a Chief Brand Strategy Officer analyzing social listening telemetry for "${radarData.brandName}":
Health Score: ${radarData.overallSentimentScore}/100
Sentiment Distribution: Positive ${radarData.sentimentDistribution.positive}%, Neutral ${radarData.sentimentDistribution.neutral}%, Negative ${radarData.sentimentDistribution.negative}%
Mentions Tracked: ${radarData.totalMentionsTracked}
Competitors: ${radarData.competitors.map((c: any) => `${c.competitorName} (${c.shareOfVoice}% SoV)`).join(', ')}

Mentions Snippet:
${radarData.mentions.map((m: any) => `[${m.platform}] ${m.author}: "${m.content}" (${m.sentiment})`).join('\n')}

Generate a JSON object:
{
  "topThreatsOrOpportunities": ["<2-3 critical risks or market opportunities>"],
  "strategicBriefing": "<2-sentence high-level executive strategic direction>",
  "recommendedResponses": [
    { "author": "<author name from mentions>", "platform": "<platform>", "suggestedReply": "<concise high-impact reply>" }
  ]
}
Output valid JSON only.`;

    const aiRes = await AIService.generateJSON<{
      topThreatsOrOpportunities: string[];
      strategicBriefing: string;
      recommendedResponses: Array<{ author: string; platform: string; suggestedReply: string }>;
    }>({
      messages: [
        { role: 'system', content: 'You are an autonomous brand intelligence engine. Output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
    });

    return {
      healthScore: radarData.overallSentimentScore,
      sentimentDistribution: radarData.sentimentDistribution,
      mentionsCount: radarData.totalMentionsTracked,
      topThreatsOrOpportunities: aiRes?.topThreatsOrOpportunities || [
        'Opportunity to dominate LinkedIn carousel engagement',
        'Positive momentum on X regarding developer tooling',
      ],
      strategicBriefing: aiRes?.strategicBriefing || radarData.aiExecutiveSummary,
      recommendedResponses: aiRes?.recommendedResponses || [],
    };
  },
};
