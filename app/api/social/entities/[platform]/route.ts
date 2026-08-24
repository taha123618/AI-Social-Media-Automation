import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ platform: string }> }
) {
   const { platform } = await params;
   const searchParams = req.nextUrl.searchParams;
   const stateId = searchParams.get('stateId');

   if (!stateId) {
      return NextResponse.json({ error: 'Missing stateId' }, { status: 400 });
   }

   try {
      const state = await prisma.oAuthState.findUnique({
         where: { id: stateId }
      });

      if (!state || state.expiresAt < new Date()) {
         return NextResponse.json({ error: 'Invalid or expired state' }, { status: 400 });
      }

      const tokenData = state.tokenData as any;
      const accessToken = tokenData.access_token;

      if (platform.toUpperCase() === 'FACEBOOK') {
         // Fetch Pages
         const res = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
         const data = res.data as any;
         return NextResponse.json(data.data.map((page: any) => ({
            id: page.id,
            name: page.name,
            avatar: `https://graph.facebook.com/${page.id}/picture?type=square`,
            access_token: page.access_token
         })));
      } else if (platform.toUpperCase() === 'INSTAGRAM') {
         // Fetch Instagram accounts tied to pages
         const res = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${accessToken}`);
         const data = res.data as any;

         const igAccounts = data.data
            .filter((page: any) => page.instagram_business_account)
            .map((page: any) => ({
               id: page.instagram_business_account.id,
               name: page.instagram_business_account.name || page.instagram_business_account.username,
               avatar: page.instagram_business_account.profile_picture_url,
               access_token: page.access_token // Still use the page token to manage the IG account
            }));

         return NextResponse.json(igAccounts);
      }

      return NextResponse.json([]);
   } catch (error) {
      console.error('Fetch entities error:', error);
      return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 });
   }
}
