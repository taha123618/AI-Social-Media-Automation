
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { DuckDBStore } from "@mastra/duckdb";
import { MastraCompositeStore } from '@mastra/core/storage';
import { Observability, DefaultExporter, CloudExporter, SensitiveDataFilter } from '@mastra/observability';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { youtubeAgent } from './agents/youtube-agent';
import { postCreationAgent, postPublisherAgent } from './agents/post-creation-agent';
import { engagementAgent } from './agents/engagement-agent';
import { analyticsAgent } from './agents/analytics-agent';
import { competitorAgent } from './agents/competitor-agent';
import { trendEventAgent } from './agents/trend-event-agent';
import { templateAgent } from './agents/template-agent';
import { reviewBoosterAgent } from './agents/review-booster-agent';
import { multiLocationAgent } from './agents/multi-location-agent';
import { analyticsWorkflow, scheduledPostingWorkflow, postPublishingWorkflow } from './workflows/post-publishing-workflow';
import { blogWriterAgent, blogSeoAgent } from './agents/blog-agent';
import { blogGenerationWorkflow } from './workflows/blog-workflow';

export const mastra = new Mastra({
  workflows: {
    weatherWorkflow,
    postPublishingWorkflow,
    analyticsWorkflow,
    scheduledPostingWorkflow,
    blogGenerationWorkflow,
  },
  agents: {
    weatherAgent,
    youtubeAgent,
    postCreationAgent,
    postPublisherAgent,
    analyticsAgent,
    engagementAgent,
    competitorAgent,
    trendEventAgent,
    templateAgent,
    reviewBoosterAgent,
    multiLocationAgent,
    blogWriterAgent,
    blogSeoAgent,
  },
  storage: new MastraCompositeStore({
    id: 'composite-storage',
    default: new LibSQLStore({
      id: "mastra-storage",
      url: "file:./mastra.db",
    }),
    domains: {
      observability: await new DuckDBStore().getStore('observability'),
    }
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(), // Persists traces to storage for Mastra Studio
          new CloudExporter(), // Sends traces to Mastra Cloud (if MASTRA_CLOUD_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});
