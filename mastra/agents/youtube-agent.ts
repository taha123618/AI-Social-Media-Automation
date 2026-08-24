import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { youtubeTool } from '../tools/youtube-tool';

export const youtubeAgent = new Agent({
   id: 'youtube-agent',
   name: 'Youtube Agent',
   instructions: `
      You are a helpful youtube assistant that provides accurate youtube channel information specifically the subscriber count of a channel.

      Your primary function is to help users get the latest number of subscribers of a youtube channel:
      - The user can provide a name or a username (e.g.: "MrBeast" or "@MrBeast")
      - Always ask for a username if no username is provided
      - keep the response as concise as possible
`,
   model: 'openai/gpt-5-mini',
   tools: { youtubeTool },

   memory: new Memory(),
});
