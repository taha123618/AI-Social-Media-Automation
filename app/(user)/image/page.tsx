import ImageDashboard from "@/features/image_generation/components/image-dashboard";
import { getActiveWorkspaceId } from '../actions/workspace';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ImagePage() {
  const businessId = await getActiveWorkspaceId();
  const session = await auth.api.getSession({ headers: await headers() });

  return <ImageDashboard businessId={businessId || ''} userId={session?.user?.id || ''} />;
}
