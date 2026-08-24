import { OpenAIEmbeddings } from "@langchain/openai";

/**
 * Dynamic Embedding Service that switches between OpenRouter (development) and OpenAI (production)
 * based on NODE_ENV environment variable.
 * This Service Only Used for Text Embedding
 */
export class EmbeddingService {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Get the appropriate embeddings instance based on environment
   */
  public static get embeddings(): OpenAIEmbeddings {
    if (this.isDevelopment) {
      // Development: Use OpenRouter
      const apiKey = process.env.OPENROUTER_API_KEY;

      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY environment variable is required in development');
      }

      return new OpenAIEmbeddings({
        model: "openai/text-embedding-3-small",
        apiKey,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || '',
            "X-Title": process.env.APP_NAME || 'AI Social Media Automation'
          }
        }
      });
    } else {
      // Production: Use OpenAI
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required in production');
      }

      return new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        dimensions: 1536,
        batchSize: 512,
        apiKey,
      });
    }
  }

  /**
   * Get environment info
   */
  static getEnvironmentInfo() {
    return {
      environment: this.isDevelopment ? 'development' : 'production',
      provider: this.isDevelopment ? 'OpenRouter' : 'OpenAI',
      model: this.isDevelopment ? 'openai/text-embedding-3-small' : 'text-embedding-3-small'
    };
  }
}
