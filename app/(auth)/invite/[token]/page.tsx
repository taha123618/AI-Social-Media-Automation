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
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <h1 className="mb-4 text-2xl font-bold text-white">Invalid Invitation</h1>
          <p className="mb-6 text-gray-400">
            This invitation link is invalid, has expired, or has already been accepted.
          </p>
          <Link href="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <h1 className="mb-4 text-2xl font-bold text-white">Sign In Required</h1>
          <p className="mb-6 text-gray-400">
            You have been invited to join <strong>{invitation.business.name}</strong> as a <strong>{invitation.role}</strong>.
            Please sign in or create an account to accept.
          </p>
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full">Create Account</Button>
            </Link>
          </div>
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
    // We could handle errors here, but for simplicity, the page will just redirect
    // or we can just redirect in the action. Let's redirect in the action directly
    // but action is called via form.
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <h1 className="mb-4 text-2xl font-bold text-white">Join Workspace</h1>
        <p className="mb-6 text-gray-400">
          <strong>{invitation.invitedBy.name}</strong> has invited you to join <strong>{invitation.business.name}</strong> as a <strong>{invitation.role}</strong>.
        </p>

        <form action={acceptInviteAction}>
          <Button type="submit" className="w-full">
            Accept Invitation
          </Button>
        </form>
      </div>
    </div>
  );
}
