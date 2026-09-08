import { NextResponse } from 'next/server';
import { VoiceStudioService } from '@/features/voice_studio/services/voice.service';

export async function GET() {
  try {
    const voices = VoiceStudioService.getVoices();
    return NextResponse.json({ success: true, voices }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
