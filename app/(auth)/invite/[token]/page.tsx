import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { acceptTeamInvitation } from './actions';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users } from 'lucide-react';

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
      <div className="w-full max-w-md mx-auto bg-card/95 backdrop-blur-xl rounded-2xl border border-border p-6 sm:p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Invalid Invitation
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          This invitation link is invalid, has expired, or has already been accepted.
        </p>
        <Link href="/" className="block">
          <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg transition-colors shadow-xs">
            Return Home
          </Button>
        </Link>
      </div>
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return (
      <div className="w-full max-w-md mx-auto bg-card/95 backdrop-blur-xl rounded-2xl border border-border p-6 sm:p-8 text-center shadow-sm">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-primary/25 mx-auto mb-4">
          S
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Sign In Required
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          You have been invited to join <span className="font-semibold text-foreground">{invitation.business.name}</span> as a <span className="font-semibold text-foreground">{invitation.role}</span>. Please sign in or create an account to accept.
        </p>
        <div className="space-y-3">
          <Link href={`/login?redirect=/invite/${token}`} className="block">
            <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg transition-colors shadow-xs">
              Sign In
            </Button>
          </Link>
          <Link href={`/register?redirect=/invite/${token}`} className="block">
            <Button variant="outline" className="w-full h-11 border-border font-medium text-sm rounded-lg hover:bg-muted transition-colors">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Handle form submission to server action
  async function acceptInviteAction() {
    'use server';
    const result = await acceptTeamInvitation(token);
    if (result.success) {
      redirect('/team');
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-card/95 backdrop-blur-xl rounded-2xl border border-border p-6 sm:p-8 text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
        <Users className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
        Join Workspace
      </h1>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        <span className="font-semibold text-foreground">{invitation.invitedBy.name}</span> has invited you to join <span className="font-semibold text-foreground">{invitation.business.name}</span> as a <span className="font-semibold text-foreground">{invitation.role}</span>.
      </p>

      <form action={acceptInviteAction}>
        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg transition-colors shadow-xs cursor-pointer">
          Accept Invitation
        </Button>
      </form>
    </div>
  );
}
