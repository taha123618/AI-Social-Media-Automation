import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Platform } from '@/app/generated/prisma/client';
import axios from 'axios';

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ platform: string }> }
) {
   const { platform } = await params;
   const searchParams = req.nextUrl.searchParams;
   const code = searchParams.get('code');
   const businessId = searchParams.get('state'); // We passed businessId in state

   if (!code || !businessId) {
      return NextResponse.redirect(`${process.env.BETTER_AUTH_URL}/social/accounts?error=missing_params`);
   }

   try {
      const platformParam = platform.toUpperCase();
      let platformEnum: Platform;
      if (platformParam === 'LINKEDIN_PAGE') {
         platformEnum = 'LINKEDIN';
      } else {
         platformEnum = platformParam as Platform;
      }
      const redirectUri = `${process.env.BETTER_AUTH_URL}/api/social/callback/${platform}`;

      // 1. Fetch credentials
      let service = await prisma.thirdPartyService.findFirst({
         where: { businessId, platform: platformEnum, isActive: true }
      });

      let apiKey = service?.apiKey;
      let apiSecret = service?.apiSecret;

      // Fallback (same as auth route)
      if (!apiKey || !apiSecret) {
         if (platformEnum === 'TWITTER') {
            throw new Error("Twitter credentials not found for this business");
         }

         switch (platformEnum) {
            case 'FACEBOOK':
            case 'INSTAGRAM':
               apiKey = process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_CLIENT_ID;
               apiSecret = process.env.FACEBOOK_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET;
               break;
            case 'LINKEDIN':
               apiKey = process.env.LINKEDIN_CLIENT_ID;
               apiSecret = process.env.LINKEDIN_CLIENT_SECRET;
               break;
            case 'YOUTUBE':
            case 'GOOGLE_BUSINESS':
               apiKey = process.env.GOOGLE_CLIENT_ID;
               apiSecret = process.env.GOOGLE_CLIENT_SECRET;
               break;
            case 'TIKTOK':
               apiKey = process.env.TIKTOK_CLIENT_ID;
               apiSecret = process.env.TIKTOK_CLIENT_SECRET;
               break;
         }
      }

      if (!apiKey || !apiSecret) {
         throw new Error("Credentials not found");
      }

      const activeCredentials = { apiKey, apiSecret };

      // 2. Exchange code for token (Simplified example, varies per platform)
      let tokenData: any;
      let userInfo: any;

      if (platformEnum === 'LINKEDIN') {
         const res = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
               grant_type: 'authorization_code',
               code,
               client_id: activeCredentials.apiKey,
               client_secret: activeCredentials.apiSecret,
               redirect_uri: redirectUri
            }
         });
         tokenData = res.data;

         // Fetch profile
         const profileRes = await axios.get('https://api.linkedin.com/v2/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
         });
         const pData = profileRes.data as any;
         userInfo = {
            id: pData.id,
            name: `${pData.localizedFirstName} ${pData.localizedLastName}`,
            avatar: ''
         };
      } else if (platformEnum === 'FACEBOOK' || platformEnum === 'INSTAGRAM') {
         const res = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
            params: {
               client_id: activeCredentials.apiKey,
               client_secret: activeCredentials.apiSecret,
               redirect_uri: redirectUri,
               code
            }
         });
         tokenData = res.data;

         const meRes = await axios.get(`https://graph.facebook.com/me?access_token=${tokenData.access_token}`);
         const meData = meRes.data as any;
         userInfo = {
            id: meData.id,
            name: meData.name,
            avatar: `https://graph.facebook.com/${meData.id}/picture?type=square`
         };
      } else if (platformEnum === 'PINTEREST') {
         const res = await axios.post('https://api.pinterest.com/v5/oauth/token',
            new URLSearchParams({
               grant_type: 'authorization_code',
               code,
               redirect_uri: redirectUri
            }), {
            headers: {
               Authorization: `Basic ${Buffer.from(`${activeCredentials.apiKey}:${activeCredentials.apiSecret}`).toString('base64')}`,
               'Content-Type': 'application/x-www-form-urlencoded'
            }
         });
         tokenData = res.data;

         const meRes = await axios.get('https://api.pinterest.com/v5/user_account', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
         });
         const pmeData = meRes.data as any;
         userInfo = {
            id: pmeData.username,
            name: pmeData.username,
            avatar: pmeData.profile_image
         };
      } else if (platformEnum === 'TIKTOK') {
         const res = await axios.post('https://open.tiktokapis.com/v2/oauth/token/',
            new URLSearchParams({
               client_key: activeCredentials.apiKey,
               client_secret: activeCredentials.apiSecret,
               code,
               grant_type: 'authorization_code',
               redirect_uri: redirectUri
            }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         });
         tokenData = res.data;

         const meRes = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
            params: { fields: 'open_id,display_name,avatar_url' }
         });
         const tmeData = meRes.data as any;
         userInfo = {
            id: tmeData.data.user.open_id,
            name: tmeData.data.user.display_name,
            avatar: tmeData.data.user.avatar_url
         };
      } else if (platformEnum === 'YOUTUBE' || platformEnum === 'GOOGLE_BUSINESS') {
         const res = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: activeCredentials.apiKey,
            client_secret: activeCredentials.apiSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
         });
         tokenData = res.data;

         const meRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
         });
         const gmeData = meRes.data as any;
         userInfo = {
            id: gmeData.id,
            name: gmeData.name,
            avatar: gmeData.picture
         };
      } else if (platformEnum === 'MASTODON') {
         const [instance, clientId] = activeCredentials.apiKey.split('|');
         const res = await axios.post(`https://${instance || 'mastodon.social'}/oauth/token`, {
            client_id: clientId,
            client_secret: activeCredentials.apiSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            code
         });
         tokenData = res.data;
         const meRes = await axios.get(`https://${instance || 'mastodon.social'}/api/v1/accounts/verify_credentials`, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
         });
         const meData = meRes.data as any;
         userInfo = {
            id: meData.id,
            name: meData.display_name,
            avatar: meData.avatar
         };
      }

      // 3. Handle Platform Specific Persistence
      if (platformEnum === 'FACEBOOK' || platformEnum === 'INSTAGRAM') {
         const state = await prisma.oAuthState.create({
            data: {
               businessId,
               platform: platformEnum,
               tokenData: tokenData,
               expiresAt: new Date(Date.now() + 3600 * 1000)
            }
         });
         return NextResponse.redirect(`${process.env.BETTER_AUTH_URL}/social/accounts/entities/${platform.toLowerCase()}?stateId=${state.id}&businessId=${businessId}`);
      }

      // Default: Upsert SocialAccount (LinkedIn, Pinterest, etc.)
      await prisma.socialAccount.upsert({
         where: {
            businessId_platform_platformId: {
               businessId,
               platform: platformEnum,
               platformId: userInfo.id
            }
         },
         update: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            name: userInfo.name,
            avatar: userInfo.avatar,
            profileUrl: platformEnum === 'LINKEDIN' ? `https://www.linkedin.com/in/${userInfo.id}` : null,
            isActive: true
         },
         create: {
            businessId,
            platform: platformEnum,
            platformId: userInfo.id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            name: userInfo.name,
            avatar: userInfo.avatar,
            profileUrl: platformEnum === 'LINKEDIN' ? `https://www.linkedin.com/in/${userInfo.id}` : null,
            isActive: true
         }
      });

      return NextResponse.redirect(`${process.env.BETTER_AUTH_URL}/social/accounts?success=true`);
   } catch (error) {
      console.error(`OAuth Callback Error [${platform}]:`, error);
      return NextResponse.redirect(`${process.env.BETTER_AUTH_URL}/social/accounts?error=callback_failed`);
   }
}
