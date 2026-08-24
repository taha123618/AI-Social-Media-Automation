import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SettingsService } from '@/features/settings/services/settings.service';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  // Email Dispatch Protocol
  criticalInfrastructureUpdates: z.boolean().optional(),
  strategicIntelligence: z.boolean().optional(),
  // Real-Time Push Array
  osLevelSignals: z.boolean().optional(),
  // Active Signal Feed
  contentPhaseSuccess: z.boolean().optional(),
  securityFirewallAlerts: z.boolean().optional(),
  collaboratorInvitations: z.boolean().optional(),
  globalSystemHealth: z.boolean().optional(),
});

// Helper to get authenticated user
async function getAuthUser(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return session.user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const settings = await SettingsService.getUserSettings(user.id);

    if (!settings) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    const updatedUser = await SettingsService.updateUserSettings(user.id, validatedData);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user settings:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
