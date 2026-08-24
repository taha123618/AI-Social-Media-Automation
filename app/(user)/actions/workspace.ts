'use server';

import { cookies, headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function getUserWorkspaces() {
   const session = await auth.api.getSession({
      headers: await headers(),
   });

   if (!session?.user?.id) {
      return [];
   }

   const members = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      include: {
         business: {
            select: {
               id: true,
               name: true,
               slug: true,
            }
         }
      },
      orderBy: { joinedAt: 'asc' }
   });

   return members.map(m => m.business);
}

export async function getActiveWorkspaceId() {
   const cookieStore = await cookies();
   const explicitId = cookieStore.get('active_business_id')?.value;

   const workspaces = await getUserWorkspaces();

   if (workspaces.length === 0) return null;

   // If cookie exists and matches one of the user's workspaces
   if (explicitId && workspaces.some(w => w.id === explicitId)) {
      return explicitId;
   }

   // Fallback to first workspace (don't set cookie here)
   return workspaces[0].id;
}

export async function getActiveWorkspaceIdSafe() {
   // This version is safe to call from server components
   // It doesn't try to set cookies, only reads them
   return await getActiveWorkspaceId();
}

export async function getActiveWorkspaceIdWithCookieSetting() {
   const cookieStore = await cookies();
   const explicitId = cookieStore.get('active_business_id')?.value;

   const workspaces = await getUserWorkspaces();

   if (workspaces.length === 0) return null;

   // If cookie exists and matches one of the user's workspaces
   if (explicitId && workspaces.some(w => w.id === explicitId)) {
      return explicitId;
   }

   // Fallback to first workspace and set cookie only if we're in a proper server action context
   const defaultId = workspaces[0].id;
   try {
      cookieStore.set('active_business_id', defaultId, { path: '/' });
   } catch (error) {
      // Cookie setting failed, but we still return the workspace ID
      console.warn('Could not set workspace cookie:', error);
   }
   return defaultId;
}

export async function setActiveWorkspaceId(businessId: string) {
   const session = await auth.api.getSession({
      headers: await headers(),
   });

   if (!session?.user?.id) throw new Error("Unauthorized");

   // Verify the user actually belongs to this workspace
   const member = await prisma.businessMember.findFirst({
      where: { userId: session.user.id, businessId }
   });

   if (!member) throw new Error("Not a member of this workspace");

   const cookieStore = await cookies();
   cookieStore.set('active_business_id', businessId, { path: '/' });

   // Invalidate all server-side paths to ensure all Server Components are fresh
   revalidatePath('/', 'layout');

   return { success: true };
}
