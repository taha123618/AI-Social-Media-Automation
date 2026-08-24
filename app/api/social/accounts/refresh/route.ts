import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import axios from 'axios';

export async function POST(req: NextRequest) {
   try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const businessId = req.headers.get('x-business-id');
      if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

      const { id } = await req.json();
      if (!id) return NextResponse.json({ error: 'Account ID required' }, { status: 400 });

      const account = await prisma.socialAccount.findUnique({
         where: { id, businessId }
      });

      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      if (!account.accessToken) return NextResponse.json({ error: 'Access token missing' }, { status: 400 });

      let updatedName = account.name;
      let updatedAvatar = account.avatar;

      if (account.platform === 'FACEBOOK') {
         const res = await axios.get(`https://graph.facebook.com/v19.0/${account.platformId}?fields=name,picture&access_token=${account.accessToken}`);
         const data = res.data as any;
         if (data) {
            if (data.name) updatedName = data.name;
            if (data.picture?.data?.url) updatedAvatar = data.picture.data.url;
         }
      } else if (account.platform === 'INSTAGRAM') {
         const res = await axios.get(`https://graph.facebook.com/v19.0/${account.platformId}?fields=name,username,profile_picture_url&access_token=${account.accessToken}`);
         const data = res.data as any;
         if (data) {
            updatedName = data.name || data.username || updatedName;
            if (data.profile_picture_url) updatedAvatar = data.profile_picture_url;
         }
      }

      const updatedAccount = await prisma.socialAccount.update({
         where: { id },
         data: {
            name: updatedName,
            avatar: updatedAvatar
         }
      });

      return NextResponse.json(updatedAccount);
   } catch (error) {
      console.error('[Social Account Refresh] Error:', error);
      return NextResponse.json({ error: 'Failed to refresh account' }, { status: 500 });
   }
}
