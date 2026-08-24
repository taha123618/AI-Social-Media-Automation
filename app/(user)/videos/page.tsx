import { RagVideoDashboard } from "@/features/video_generation/components/rag-video-dashboard";
import { getActiveWorkspaceId } from '../actions/workspace';

export default async function VideoPage() {
   const businessId = await getActiveWorkspaceId();
   return <RagVideoDashboard businessId={businessId || ''} />;
}