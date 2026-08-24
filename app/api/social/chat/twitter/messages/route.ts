import { NextResponse } from 'next/server';
import { SocialMediaService } from '@/features/social/services/social.service';
import { Platform } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const businessId = searchParams.get('businessId');

    if (!threadId || !businessId) {
      return NextResponse.json({ error: 'Thread ID and Business ID are required' }, { status: 400 });
    }

    const messages = await SocialMediaService.getMessages(businessId, Platform.TWITTER, threadId);
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Twitter Messages GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientId, message, businessId } = body;

    if (!recipientId || !message || !businessId) {
      return NextResponse.json({ error: 'Recipient ID, message and Business ID are required' }, { status: 400 });
    }

    const messageId = await SocialMediaService.sendMessage(businessId, Platform.TWITTER, recipientId, message);
    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    console.error('Twitter Messages POST Error:', error);
    return NextResponse.json({ error: 'Failed to send message', details: String(error) }, { status: 500 });
  }
}
