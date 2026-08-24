import { createTool } from '@mastra/core/tools';
import { z } from "zod";

interface ChannelData {
   id: string;
   title: string;
   subCount: number;
   photo: string;
}


const API_KEY = process.env.YOUTUBE_API_KEY;

export const youtubeTool = createTool({
   id: 'get-youtube-data',
   description: 'Get the channel data',
   inputSchema: z.object({
      channel: z.string()
   }),
   outputSchema: z.object({
      id: z.string(),
      title: z.string(),
      subCount: z.number(),
      photo: z.string()
   }),
   execute: async ({ channel }) => {
      return await fetchChannelData(channel)
   }
})

async function fetchChannelData(channelID: string): Promise<ChannelData> {
   try {
      let endpoint = "https://www.googleapis.com/youtube/v3/channels?"

      if (channelID.startsWith("@")) {
         endpoint = `${endpoint}part=snippet,statistics&forHandle=${channelID.substring(1)}&key=${API_KEY}`;
      } else if (channelID.startsWith("UC")) {
         endpoint = `${endpoint}part=snippet,statistics&id=${channelID}&key=${API_KEY}`;
      } else {
         endpoint = `${endpoint}part=snippet,statistics&forUsername=${channelID}&key=${API_KEY}`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
         throw new Error("YouTube API error: " + data.error?.message)
      }

      if (!data.items || data.items.length === 0) {
         throw new Error("Channel not found");
      }

      const channel = data.items[0];

      return {
         id: channel.id,
         title: channel.snippet.title,
         photo: channel.snippet.thumbnails.medium.url,
         subCount: parseInt(channel.statistics.subscriberCount, 10)
      }
   } catch (error) {
      console.error("Error fetching channel data", error);
      throw error;
   }
}