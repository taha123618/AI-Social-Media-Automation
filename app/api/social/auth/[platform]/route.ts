import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Platform } from '@/app/generated/prisma/client';

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ platform: string }> }
) {
   const { platform } = await params;
   const searchParams = req.nextUrl.searchParams;
   const businessId = searchParams.get('businessId');

   if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
   }

   try {
      const platformParam = platform.toUpperCase();
      // Map specialized UI identifiers to database Platform enum values
      let platformEnum: Platform;
      if (platformParam === 'LINKEDIN_PAGE') {
         platformEnum = 'LINKEDIN';
      } else {
         platformEnum = platformParam as Platform;
      }

      // Fetch API credentials for this business
      let service = await prisma.thirdPartyService.findFirst({
         where: {
            businessId,
            platform: platformEnum,
            isActive: true
         }
      });

      let apiKey = service?.apiKey;
      let apiSecret = service?.apiSecret;

      // Fallback to environment variables if not configured per-business (except for Twitter)
      if (!apiKey || !apiSecret) {
         if (platformEnum === 'TWITTER') {
            return NextResponse.json({ error: `Twitter credentials must be configured in Third Party Services for this business.` }, { status: 400 });
         }

         // Global Fallbacks
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
            default:
               break
            // Add more as needed
         }
      }

      if (!apiKey) {
         return NextResponse.json({ error: `Credentials not configured or found for ${platform}` }, { status: 400 });
      }

      // Create a temporary object to mimic the service if it was a fallback
      const activeCredentials = {
         apiKey,
         apiSecret
      };

      const redirectUri = `${process.env.BETTER_AUTH_URL}/api/social/callback/${platform}`;
      let authUrl = '';

      //! 1. Generate auth URL based on platform

      //? For Simple businees profile connection
      // switch (platformEnum) {
      //    case 'FACEBOOK':
      //    case 'INSTAGRAM':
      //       // Note: Advanced scopes like pages_manage_posts and instagram_content_publish
      //       // require App Review from Meta. Using basic scopes for initial connection.
      //       authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&scope=public_profile,pages_show_list,pages_read_engagement&state=${businessId}`;
      //       break;
      //    case 'LINKEDIN':
      //       authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&state=${businessId}&scope=w_member_social,r_liteprofile,r_emailaddress`;
      //       break;
      //    case 'YOUTUBE':
      //       authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload&access_type=offline&prompt=consent&state=${businessId}`;
      //       break;
      //    case 'PINTEREST':
      //       authUrl = `https://www.pinterest.com/oauth/?client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&response_type=code&scope=boards:read,pins:read,pins:write&state=${businessId}`;
      //       break;
      //    case 'TIKTOK':
      //       authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&response_type=code&scope=user.info.basic,video.publish,video.upload&state=${businessId}`;
      //       break;
      //    case 'GOOGLE_BUSINESS':
      //       authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent&state=${businessId}`;
      //       break;
      //    case 'MASTODON':
      //       // Mastodon requires an instance URL. Assuming apiKey stores 'instance|clientId'
      //       const [instance, clientId] = activeCredentials.apiKey.split('|');
      //       authUrl = `https://${instance || 'mastodon.social'}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=read+write&state=${businessId}`;
      //       break;
      //    case 'BLUESKY':
      //       // Bluesky usually uses App Passwords, but OAuth is in development.
      //       return NextResponse.json({ error: 'Bluesky OAuth is currently in development. Please use App Passwords in settings.' }, { status: 400 });
      //    // Add other platforms as needed
      //    default:
      //       return NextResponse.json({ error: `OAuth not implemented for ${platform}` }, { status: 400 });
      // }

      //! For connect business profile and post create
      switch (platformEnum) {
         case 'FACEBOOK':
         case 'INSTAGRAM':
            authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish&state=${businessId}`;
            break;
         case 'LINKEDIN':
            authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&state=${businessId}&scope=w_member_social,r_liteprofile,r_emailaddress`;
            break;
         case 'YOUTUBE':
            authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload&access_type=offline&prompt=consent&state=${businessId}`;
            break;
         case 'PINTEREST':
            authUrl = `https://www.pinterest.com/oauth/?client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&response_type=code&scope=boards:read,pins:read,pins:write&state=${businessId}`;
            break;
         case 'TIKTOK':
            authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&response_type=code&scope=user.info.basic,video.publish,video.upload&state=${businessId}`;
            break;
         case 'GOOGLE_BUSINESS':
            authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${activeCredentials.apiKey}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent&state=${businessId}`;
            break;
         case 'MASTODON':
            // Mastodon requires an instance URL. Assuming apiKey stores 'instance|clientId'
            const [instance, clientId] = activeCredentials.apiKey.split('|');
            authUrl = `https://${instance || 'mastodon.social'}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=read+write&state=${businessId}`;
            break;
         case 'BLUESKY':
            // Bluesky usually uses App Passwords, but OAuth is in development.
            return NextResponse.json({ error: 'Bluesky OAuth is currently in development. Please use App Passwords in settings.' }, { status: 400 });
         // Add other platforms as needed
         default:
            return NextResponse.json({ error: `OAuth not implemented for ${platform}` }, { status: 400 });
      }

      return NextResponse.redirect(authUrl);
   } catch (error) {
      console.error(`OAuth Auth Error [${platform}]:`, error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
