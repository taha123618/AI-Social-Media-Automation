import { z, ZodSchema } from 'zod';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

export interface AIRequest {
  model?: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Standard Zod-validated tool definition
 */
export interface ToolDefinition<TInput = any, TOutput = any> {
  id: string;
  name: string;
  description: string;
  inputSchema: ZodSchema<TInput>;
  execute: (input: TInput) => Promise<TOutput>;
}

/**
 * Custom AI Agent definition
 */
export interface AgentDefinition {
  name: string;
  instructions: string;
  model?: string;
  tools?: Record<string, ToolDefinition>;
  generateResponse?: (prompt: string, context?: Record<string, any>) => Promise<string>;
}

/**
 * Custom Multi-step Workflow definition
 */
export interface WorkflowStep<TInput = any, TOutput = any> {
  id: string;
  description?: string;
  execute: (input: TInput, context?: Record<string, any>) => Promise<TOutput>;
}

export interface WorkflowDefinition<TInput = any, TOutput = any> {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  execute: (input: TInput) => Promise<TOutput>;
}
