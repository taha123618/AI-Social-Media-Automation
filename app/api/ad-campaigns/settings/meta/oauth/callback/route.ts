import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import AdAccountService from '@/features/ad-campaigns/services/ad-account.service';
import fetch from 'node-fetch';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

    const decoded = state ? JSON.parse(Buffer.from(state, 'base64').toString('utf8')) : {};
    const businessId = decoded.businessId as string;

    const tokenRes = await fetch(
      `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(
        `${process.env.BASE_URL || ''}/api/ad-campaigns/settings/meta/oauth/callback`,
      )}&client_secret=${process.env.META_APP_SECRET}&code=${code}`,
    );

    const tokenJson: any = await tokenRes.json();
    if (!tokenJson.access_token) return NextResponse.json({ error: 'Failed to obtain access token', details: tokenJson }, { status: 500 });

    const exch = await fetch(
      `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${tokenJson.access_token}`,
    );
    const exchJson: any = await exch.json();
    const accessToken = exchJson.access_token ?? tokenJson.access_token;

    // Optionally fetch pages / ad accounts; here we store credential
    await AdAccountService.addCredential(businessId, null, 'META', accessToken, undefined, ['ads_management'], undefined, { raw: exchJson });

    return NextResponse.redirect(`${process.env.FRONTEND_URL || '/'}#/settings/ads?connected=meta`);
  } catch (err: any) {
    console.error('[Meta OAuth Callback]', err);
    return NextResponse.json({ error: err.message || 'OAuth callback failed' }, { status: 500 });
  }
}
