import { WorkflowDefinition } from '../types';
import { AIService } from '../ai.service';

export interface WeatherWorkflowInput {
  city: string;
}

export interface WeatherWorkflowOutput {
  forecast: {
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    precipitationChance: number;
    location: string;
  };
  activities: string;
}

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
  };
  return conditions[code] || 'Unknown';
}

export const weatherWorkflow: WorkflowDefinition<WeatherWorkflowInput, WeatherWorkflowOutput> = {
  id: 'weather-workflow',
  name: 'Weather-Driven Marketing Workflow',
  description: 'Fetches open-meteo forecast and generates contextual promotional activities and posts',
  steps: [
    {
      id: 'fetch-weather',
      description: 'Fetches weather forecast for city',
      execute: async (input) => {
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(input.city)}&count=1`;
        const geocodingResponse = await fetch(geocodingUrl);
        const geocodingData = (await geocodingResponse.json()) as {
          results?: { latitude: number; longitude: number; name: string }[];
        };

        if (!geocodingData.results?.[0]) {
          throw new Error(`Location '${input.city}' not found`);
        }

        const { latitude, longitude, name } = geocodingData.results[0];
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weathercode&timezone=auto&hourly=precipitation_probability,temperature_2m`;
        const response = await fetch(weatherUrl);
        const data = (await response.json()) as {
          current: {
            precipitation: number;
            weathercode: number;
          };
          hourly: {
            precipitation_probability: number[];
            temperature_2m: number[];
          };
        };

        return {
          date: new Date().toISOString(),
          maxTemp: Math.max(...(data.hourly?.temperature_2m || [20])),
          minTemp: Math.min(...(data.hourly?.temperature_2m || [10])),
          condition: getWeatherCondition(data.current?.weathercode ?? 0),
          precipitationChance: (data.hourly?.precipitation_probability || []).reduce(
            (acc, curr) => Math.max(acc, curr),
            0
          ),
          location: name,
        };
      },
    },
    {
      id: 'plan-activities',
      description: 'Generates activity and promotion recommendations based on forecast',
      execute: async (input, ctx) => {
        const forecast = ctx?.forecast;
        const prompt = `Based on the following weather forecast for ${forecast?.location || input.city}, suggest marketing activities and situational post angles:
${JSON.stringify(forecast, null, 2)}

Provide recommendations for:
1. 🌅 Morning Focus (outdoor vs indoor)
2. 🌞 Afternoon Promotions & Angle
3. 🏠 Inclement Weather Alternatives
4. 💡 Strategic Copy Angle for Social Media`;

        return await AIService.generateWithOpenRouter({ prompt, temperature: 0.7 });
      },
    },
  ],
  execute: async (input: WeatherWorkflowInput) => {
    const forecast = await weatherWorkflow.steps[0].execute(input);
    const activities = await weatherWorkflow.steps[1].execute(input, { forecast });
    return {
      forecast,
      activities,
    };
  },
};
