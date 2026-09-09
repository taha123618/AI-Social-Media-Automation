import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or invalid." },
        { status: 404 }
      );
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation has already been accepted." },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        businessName: invitation.business.name,
        businessId: invitation.businessId,
        invitedByName: invitation.invitedBy?.name || "A team member",
        invitedByEmail: invitation.invitedBy?.email || "",
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or invalid." },
        { status: 404 }
      );
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation has already been accepted." },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired." },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.businessMember.findFirst({
      where: {
        userId: session.user.id,
        businessId: invitation.businessId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this workspace." },
        { status: 400 }
      );
    }

    // Create business member and accept invite
    await prisma.$transaction([
      prisma.businessMember.create({
        data: {
          userId: session.user.id,
          businessId: invitation.businessId,
          role: invitation.role,
        },
      }),
      prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      businessId: invitation.businessId,
    });
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
