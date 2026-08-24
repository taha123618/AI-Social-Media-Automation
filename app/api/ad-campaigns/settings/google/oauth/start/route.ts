import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = `${process.env.BASE_URL || ''}/api/ad-campaigns/settings/google/oauth/callback`;
  const oauth2Client = new google.auth.OAuth2(clientId, process.env.GOOGLE_CLIENT_SECRET, redirectUri);

  const businessId = req.headers.get('x-business-id') || '';
  const state = Buffer.from(JSON.stringify({ businessId })).toString('base64');

  const scopes = [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state,
  });

  return NextResponse.redirect(url);
}
