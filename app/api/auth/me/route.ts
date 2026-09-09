import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    let sessionUser: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      emailVerified?: boolean | null;
    } | null = null;

    // 1. Try Better Auth session resolution (handles Cookies and Authorization Bearer headers)
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      if (session?.user) {
        sessionUser = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          emailVerified: session.user.emailVerified,
        };
      }
    } catch {}

    // 2. Direct Bearer token fallback for mobile clients
    if (!sessionUser) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        const token = authHeader.substring(7).trim();
        if (token) {
          const dbSession = await prisma.session.findUnique({
            where: { token },
            include: { user: true },
          });

          if (dbSession && dbSession.expiresAt > new Date() && dbSession.user) {
            sessionUser = {
              id: dbSession.user.id,
              name: dbSession.user.name,
              email: dbSession.user.email,
              image: dbSession.user.image,
              emailVerified: dbSession.user.emailVerified,
            };
          }
        }
      }
    }

    if (!sessionUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
