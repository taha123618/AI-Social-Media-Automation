export type SupportedModelId =
  | 'gpt-4o'
  | 'claude-3-5-sonnet'
  | 'deepseek-r1'
  | 'gemini-2-0-flash';

export interface ModelMetadata {
  id: SupportedModelId;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'DeepSeek' | 'Google';
  description: string;
  contextWindow: string;
  costPer1kInputTokens: number; // in USD
  costPer1kOutputTokens: number; // in USD
  badgeColor: string;
}

export const SUPPORTED_ARENA_MODELS: Record<SupportedModelId, ModelMetadata> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni)',
    provider: 'OpenAI',
    description: 'High-intelligence flagship model with exceptional reasoning and structured output precision.',
    contextWindow: '128k',
    costPer1kInputTokens: 0.0025,
    costPer1kOutputTokens: 0.01,
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Industry-leading nuanced prose, conversational depth, and creative tone calibration.',
    contextWindow: '200k',
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1 (Reasoning)',
    provider: 'DeepSeek',
    description: 'High-density chain-of-thought mathematical and analytical reasoning at disruptive cost efficiency.',
    contextWindow: '64k',
    costPer1kInputTokens: 0.00055,
    costPer1kOutputTokens: 0.00219,
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  'gemini-2-0-flash': {
    id: 'gemini-2-0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Sub-second ultra-fast multimodal inference optimized for real-time high-throughput pipelines.',
    contextWindow: '1M',
    costPer1kInputTokens: 0.0001,
    costPer1kOutputTokens: 0.0004,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
};

export interface ModelExecutionResult {
  modelId: SupportedModelId;
  modelName: string;
  provider: string;
  output: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
  qualityScore?: number; // 0-100
}

export interface CompareModelsInput {
  businessId: string;
  prompt: string;
  systemPrompt?: string;
  models?: SupportedModelId[];
  temperature?: number;
  maxTokens?: number;
}

export interface ArenaComparisonResponse {
  id: string;
  prompt: string;
  results: ModelExecutionResult[];
  recommendedModelId: SupportedModelId;
  recommendationReason: string;
  cheapestModelId: SupportedModelId;
  fastestModelId: SupportedModelId;
  totalExecutionTimeMs: number;
  createdAt: string;
}
