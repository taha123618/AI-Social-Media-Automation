import { NextResponse } from 'next/server';

const META_OAUTH_URL = 'https://www.facebook.com/v17.0/dialog/oauth';

export async function GET(req: Request) {
  const businessId = req.headers.get('x-business-id') || '';
  const clientId = process.env.META_APP_ID;
  const redirectUri = `${process.env.BASE_URL || ''}/api/ad-campaigns/settings/meta/oauth/callback`;
  const state = Buffer.from(JSON.stringify({ businessId })).toString('base64');

  const url = new URL(META_OAUTH_URL);
  url.searchParams.set('client_id', clientId || '');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'ads_management,pages_read_engagement,pages_manage_ads');
  url.searchParams.set('state', state);

  return NextResponse.redirect(url.toString());
}
