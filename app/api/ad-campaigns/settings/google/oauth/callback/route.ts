import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import AdAccountService from '@/features/ad-campaigns/services/ad-account.service';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

    const decoded = state ? JSON.parse(Buffer.from(state, 'base64').toString('utf8')) : {};
    const businessId = decoded.businessId as string;

    const redirectUri = `${process.env.BASE_URL || ''}/api/ad-campaigns/settings/google/oauth/callback`;
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    await AdAccountService.addCredential(businessId, null, 'GOOGLE', tokens.access_token ?? '', tokens.refresh_token ?? undefined, [], tokens.expiry_date ? new Date(tokens.expiry_date) : undefined, { raw: tokens });

    return NextResponse.redirect(`${process.env.FRONTEND_URL || '/'}#/settings/ads?connected=google`);
  } catch (err: any) {
    console.error('[Google OAuth Callback]', err);
    return NextResponse.json({ error: err.message || 'OAuth callback failed' }, { status: 500 });
  }
}
