import { ChatOpenAI, DallEAPIWrapper } from "@langchain/openai";
import { SystemLogger } from "@/features/system/services/logger.service";
import { AIMessage, AIRequest, AIResponse } from "./types";
export type { AIMessage, AIRequest, AIResponse };

/**
 * Dynamic AI Service that switches between OpenRouter (development) and OpenAI (production)
 * based on NODE_ENV environment variable.
 * This Service Only Used for Text Generation
 */
export class AIService {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Generate text using OpenRouter (development) or OpenAI (production)
   * This is the main method that handles environment switching
   */
  static async generateWithOpenRouter(aiRequest: {
    prompt: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    try {
      console.log(`[AI-SERVICE] Using ${this.isDevelopment ? 'OpenRouter' : 'OpenAI'} for text generation`);

      // Convert simple prompt to message format
      const request: AIRequest = {
        model: aiRequest.model,
        messages: [
          { role: "user", content: aiRequest.prompt }
        ],
        temperature: aiRequest.temperature || 0.7,
        maxTokens: aiRequest.maxTokens || 1000
      };

      const response = await this.generateCompletion(request);
      return response.content;
    } catch (error) {
      console.error('[AI-SERVICE] Error in generateWithOpenRouter:', error);
      throw error;
    }
  }

  /**
   * Direct text generation using OpenAI
   */
  static async generateWithOpenAI(aiRequest: {
    prompt: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    const request: AIRequest = {
      model: aiRequest.model,
      messages: [{ role: "user", content: aiRequest.prompt }],
      temperature: aiRequest.temperature || 0.7,
      maxTokens: aiRequest.maxTokens || 1000,
    };
    const response = await this.callOpenAI(request);
    return response.content;
  }

  /**
   * Legacy generateText method for backward compatibility
   */
  static async generateText(aiRequest: {
    prompt: string;
    model?: string;
    maxTokens: number;
  }): Promise<string> {
    return this.generateWithOpenRouter({
      prompt: aiRequest.prompt,
      model: aiRequest.model || "gpt-4o",
      maxTokens: aiRequest.maxTokens
    });
  }

  /**
   * Get the appropriate model name based on environment
   */
  private static getModel(model?: string): string {
    if (model) {
      if (this.isDevelopment) {
        // Map common aliases and arena model identifiers to exact OpenRouter model paths
        const modelMap: Record<string, string> = {
          'gpt-4o': 'openai/gpt-4o',
          'gpt-4o-mini': 'openai/gpt-4o-mini',
          'gpt-4': 'openai/gpt-4',
          'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
          'claude-3-5-sonnet': 'anthropic/claude-3.5-sonnet',
          'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
          'claude-3-haiku': 'anthropic/claude-3-haiku',
          'deepseek-r1': 'deepseek/deepseek-r1',
          'deepseek-chat': 'deepseek/deepseek-chat',
          'gemini-2-0-flash': 'google/gemini-2.5-flash-lite',
          'gemini-2.0-flash': 'google/gemini-2.5-flash-lite',
          'gemini-2.5-flash-lite': 'google/gemini-2.5-flash-lite',
          'gemini-flash': 'google/gemini-2.5-flash-lite',
        };

        if (modelMap[model]) {
          return modelMap[model];
        }

        if (!model.includes('/')) {
          if (model.startsWith('gpt-')) return `openai/${model}`;
          if (model.startsWith('claude-')) return `anthropic/${model}`;
          if (model.startsWith('gemini-')) return `google/${model}`;
          if (model.startsWith('deepseek-')) return `deepseek/${model}`;
          if (model.startsWith('llama-')) return `meta-llama/${model}`;
        }
      }
      return model;
    }

    // Default models based on environment
    return this.isDevelopment
      ? "google/gemini-2.5-flash-lite"  // Valid OpenRouter model
      : "gpt-4o";  // OpenAI model
  }

  /**
   * Get available models for current environment
   */
  static getAvailableModels(): string[] {
    if (this.isDevelopment) {
      return [
        "google/gemini-2.5-flash-lite",
        "anthropic/claude-3-haiku",
        "openai/gpt-3.5-turbo",
        "openai/gpt-4",
        "meta-llama/llama-3.1-8b-instruct:free",
        "google/gemini-2.5-flash-image"
      ];
    } else {
      return [
        "gpt-4o",
        "gpt-4-turbo",
        "gpt-3.5-turbo"
      ];
    }
  }

  /**
   * Create headers for OpenRouter API
   */
  private static createOpenRouterHeaders(): Record<string, string> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required in development');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '',
      'X-Title': process.env.APP_NAME || 'AI Social Media Automation'
    };
  }

  /**
   * Make API call to OpenRouter
   */
  private static async callOpenRouter(request: AIRequest): Promise<AIResponse> {
    const headers = this.createOpenRouterHeaders();

    const body = {
      model: this.getModel(request.model),
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000, // Increased default from 1000 to 2000
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter API Error:', response.status, errorBody);

      // Try to parse error response
      let errorMessage = `OpenRouter API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        } else if (errorJson.error) {
          errorMessage = typeof errorJson.error === 'string' ? errorJson.error : JSON.stringify(errorJson.error);
        }
      } catch {
        errorMessage = `${response.status}: ${errorBody}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Validate response has content
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenRouter API');
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }

  /**
   * Make API call to OpenAI via LangChain
   */
  private static async callOpenAI(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required in production');
    }

    const chatOpenAI = new ChatOpenAI({
      model: this.getModel(request.model),
      temperature: request.temperature || 0.7,
      maxTokens: request.maxTokens,
      apiKey,
    });

    // Convert messages to LangChain format (HumanMessage, SystemMessage, AIMessage)
    const langchainMessages = request.messages.map(msg => {
      const role = msg.role;
      const content = msg.content;

      if (role === "system") return { role: "system", content };
      if (role === "assistant") return { role: "ai", content };
      return { role: "human", content };
    });

    const result = await chatOpenAI.invoke(langchainMessages as any);

    // Extract usage from additional_kwargs or usage_metadata if available
    const usageMetadata = (result as any).usage_metadata;
    const additionalKwargs = result.additional_kwargs as any;

    return {
      content: result.content as string,
      usage: usageMetadata ? {
        prompt_tokens: usageMetadata.input_tokens || 0,
        completion_tokens: usageMetadata.output_tokens || 0,
        total_tokens: usageMetadata.total_tokens || 0
      } : (additionalKwargs?.tokenUsage ? {
        prompt_tokens: additionalKwargs.tokenUsage.promptTokens || 0,
        completion_tokens: additionalKwargs.tokenUsage.completionTokens || 0,
        total_tokens: additionalKwargs.tokenUsage.totalTokens || 0
      } : undefined)
    };
  }

  /**
   * Main method to generate AI completion
   * Automatically switches between OpenRouter and OpenAI based on NODE_ENV
   */
  static async generateCompletion(request: AIRequest): Promise<AIResponse> {
    const modelUsed = this.getModel(request.model);
    try {
      await SystemLogger.logActivity({
        action: "AI_GENERATION_STARTED",
        entity: "AIService",
        details: { model: modelUsed, isDevelopment: this.isDevelopment }
      });

      console.log(`[AI-SERVICE] Using ${this.isDevelopment ? 'OpenRouter' : 'OpenAI'} for AI generation`);

      let response: AIResponse;
      if (this.isDevelopment) {
        response = await this.callOpenRouter(request);
      } else {
        response = await this.callOpenAI(request);
      }

      await SystemLogger.logActivity({
        action: "AI_GENERATION_COMPLETED",
        entity: "AIService",
        details: {
          model: modelUsed,
          tokens: response.usage?.total_tokens || 0
        }
      });

      return response;
    } catch (error: any) {
      console.error('[AI-SERVICE] Error generating completion:', error);
      await SystemLogger.logError({
        message: error.message || "AI generation failed",
        source: "AIService.generateCompletion",
        context: { model: modelUsed }
      });
      throw error;
    }
  }

  /**
   * Alias for generateCompletion
   */
  static async generateResponse(request: AIRequest): Promise<AIResponse> {
    return this.generateCompletion(request);
  }

  /**
   * Convenience method for generating JSON responses
   */
  static async generateJSON<T = any>(request: AIRequest): Promise<T> {
    const response = await this.generateCompletion(request);

    // Strip markdown code blocks if present
    let jsonStr = response.content.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(jsonStr) as T;
    } catch (parseError) {
      // Attempt to repair common LLM JSON issues before giving up
      try {
        // 1. Remove trailing commas before closing brackets/braces
        jsonStr = jsonStr.replace(/,(\s*[\]}])/g, '$1');

        // 2. If still broken, try to close incomplete JSON structures
        const openBraces = (jsonStr.match(/{/g) || []).length;
        const closeBraces = (jsonStr.match(/}/g) || []).length;
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;

        // Close any unclosed braces and brackets
        for (let i = 0; i < openBraces - closeBraces; i++) {
          jsonStr += '}';
        }
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          jsonStr += ']';
        }

        return JSON.parse(jsonStr) as T;
      } catch {
        console.error('[AI-SERVICE] Failed to parse JSON response. Length:', jsonStr.length);
        console.error('[AI-SERVICE] First 500 chars:', jsonStr.substring(0, 500));
        console.error('[AI-SERVICE] Last 200 chars:', jsonStr.substring(Math.max(0, jsonStr.length - 200)));
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Get current environment info
   */
  static getEnvironmentInfo() {
    return {
      environment: this.isDevelopment ? 'development' : 'production',
      provider: this.isDevelopment ? 'OpenRouter' : 'OpenAI',
      defaultModel: this.getModel(),
      availableModels: this.getAvailableModels()
    };
  }

  /**
   * Simple text generation method
   */
  static async generateTextSimple(prompt: string, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    return this.generateWithOpenRouter({
      prompt,
      ...options
    });
  }

  /**
   * Test method to verify the service is working
   */
  static async testConnection(): Promise<{ success: boolean; message: string; provider: string }> {
    try {
      const testPrompt = "Respond with just 'OK' to test the connection.";
      const response = await this.generateWithOpenRouter({
        prompt: testPrompt,
        maxTokens: 10
      });

      return {
        success: true,
        message: response.trim(),
        provider: this.isDevelopment ? 'OpenRouter' : 'OpenAI'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        provider: this.isDevelopment ? 'OpenRouter' : 'OpenAI'
      };
    }
  }
}
