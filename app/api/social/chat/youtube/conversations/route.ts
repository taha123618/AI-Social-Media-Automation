import { NextResponse } from 'next/server';
import { SocialMediaService } from '@/features/social/services/social.service';
import { Platform } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const conversations = await SocialMediaService.getConversations(businessId, Platform.YOUTUBE);
    return NextResponse.json({ success: true, conversations });
  } catch (error) {
    console.error('YouTube Conversations API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations', details: String(error) }, { status: 500 });
  }
}
