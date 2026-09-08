export type VoiceId =
  | 'alloy'
  | 'echo'
  | 'fable'
  | 'onyx'
  | 'nova'
  | 'shimmer'
  | 'adam'
  | 'rachel'
  | 'antoni'
  | 'bella';

export interface VoiceProfile {
  id: VoiceId;
  name: string;
  provider: 'OpenAI' | 'ElevenLabs' | 'Cartesia';
  gender: 'Female' | 'Male' | 'Neutral';
  accent: string;
  description: string;
  sampleAudioUrl?: string;
}

export const AVAILABLE_VOICES: VoiceProfile[] = [
  {
    id: 'alloy',
    name: 'Alloy',
    provider: 'OpenAI',
    gender: 'Neutral',
    accent: 'American (Neutral)',
    description: 'Balanced, clear, versatile voice ideal for tutorials and product demos.',
  },
  {
    id: 'echo',
    name: 'Echo',
    provider: 'OpenAI',
    gender: 'Male',
    accent: 'American (Warm)',
    description: 'Warm, grounded, and authoritative narrator for corporate insights.',
  },
  {
    id: 'fable',
    name: 'Fable',
    provider: 'OpenAI',
    gender: 'Male',
    accent: 'British (Expressive)',
    description: 'Dynamic, expressive British storytelling voice perfect for reels and shorts.',
  },
  {
    id: 'nova',
    name: 'Nova',
    provider: 'OpenAI',
    gender: 'Female',
    accent: 'American (Energetic)',
    description: 'Upbeat, friendly, high-energy voice tailored for viral social hooks.',
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    provider: 'OpenAI',
    gender: 'Female',
    accent: 'American (Clear & Calm)',
    description: 'Crisp, articulate, soothing cadence ideal for educational content.',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    provider: 'OpenAI',
    gender: 'Male',
    accent: 'American (Deep & Resonant)',
    description: 'Deep, resonant voice for dramatic announcements and high-impact ads.',
  },
];

export interface VoiceGenerationInput {
  businessId: string;
  text: string;
  voiceId: VoiceId;
  language?: string;
  speed?: number; // 0.75 - 1.5
  targetPlatform?: 'TIKTOK' | 'INSTAGRAM_REELS' | 'YOUTUBE_SHORTS' | 'PODCAST';
}

export interface VoiceGenerationResult {
  id: string;
  businessId: string;
  audioUrl: string;
  spokenText?: string;
  durationSeconds: number;
  wordCount: number;
  voiceId: VoiceId;
  speed?: number;
  language: string;
  format: 'mp3' | 'wav';
  source?: 'openai_tts' | 'speech_synthesis';
  createdAt: string;
}
