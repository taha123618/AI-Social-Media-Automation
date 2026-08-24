import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

import { auth } from '@/lib/auth';

export type AuthContext = {
  user: { id: string; email: string };
  businessId?: string;
};

/**
 * Authentication helper for Route Handlers
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = session.user;
  const context: AuthContext = { user: { id: user.id, email: user.email } };

  const businessId = req.headers.get('x-business-id');
  if (businessId) {
     const membership = await prisma.businessMember.findUnique({
         where: { userId_businessId: { userId: user.id, businessId } }
     });
     if (membership) {
         context.businessId = businessId;
     }
  }

  return context;
}

/**
 * API Handler Wrapper for consistent error handling
 */
export function apiHandler(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const authContext = await getAuthContext(req);
      return await handler(req, authContext);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`[API ERROR]: ${err.message}`, err.stack);

      // Log error to SystemLogger
      await SystemLogger.logError({
        message: err.message || "API Handler Error",
        source: "lib/api-utils.ts",
        path: req.nextUrl.pathname,
        stack: err.stack,
        context: { method: req.method }
      });

      if (err.message === 'Unauthorized') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      if (error instanceof z.ZodError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Validation Error', 
          details: error.issues 
        }, { status: 400 });
      }

      return NextResponse.json({ 
        success: false, 
        error: 'Internal Server Error', 
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
      }, { status: 500 });
    }
  };
}

/**
 * Zod Validation Helper
 */
export async function parseBody<T>(req: NextRequest, schema: z.Schema<T>): Promise<T> {
    const body = await req.json();
    return schema.parse(body);
}
