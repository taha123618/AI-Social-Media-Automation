import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { acceptTeamInvitation } from './actions';
import { Button } from '@/components/ui/button';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invitation = await prisma.teamInvitation.findUnique({
    where: { token },
    include: {
      business: true,
      invitedBy: true,
    },
  });

  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-none border border-border bg-card p-8 text-center font-mono">
          <h1 className="mb-3 text-lg font-bold uppercase text-foreground">INVALID INVITATION</h1>
          <p className="mb-6 text-xs text-muted-foreground">
            This invitation dispatch is invalid, has expired, or has already been claimed.
          </p>
          <Link href="/">
            <Button className="w-full text-xs font-bold uppercase">RETURN TO HOME</Button>
          </Link>
        </div>
      </div>
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-none border border-border bg-card p-8 text-center font-mono">
          <h1 className="mb-3 text-lg font-bold uppercase text-foreground">OPERATOR AUTHENTICATION REQUIRED</h1>
          <p className="mb-6 text-xs text-muted-foreground">
            You have been invited to join <strong className="text-foreground">{invitation.business.name}</strong> with role <strong className="text-primary">{invitation.role}</strong>.
            Authenticate to bind membership.
          </p>
          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full text-xs font-bold uppercase">SIGN IN</Button>
            </Link>
            <Link href="/register" className="block">
              <Button variant="outline" className="w-full text-xs font-bold uppercase">CREATE ACCOUNT</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function acceptInviteAction() {
    'use server';
    const result = await acceptTeamInvitation(token);
    if (result.success) {
      redirect('/team');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-none border border-border bg-card p-8 text-center font-mono">
        <h1 className="mb-3 text-lg font-bold uppercase text-foreground">WORKSPACE CLEARANCE INVITATION</h1>
        <p className="mb-6 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">{invitation.invitedBy.name}</strong> has invited you to join <strong className="text-foreground">{invitation.business.name}</strong> as <strong className="text-primary">{invitation.role}</strong>.
        </p>

        <form action={acceptInviteAction}>
          <Button type="submit" className="w-full text-xs font-bold uppercase">
            ACCEPT FLEET CLEARANCE
          </Button>
        </form>
      </div>
    </div>
  );
}
