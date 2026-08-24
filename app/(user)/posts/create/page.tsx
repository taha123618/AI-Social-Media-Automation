import { PostCreationPage } from "./_components/post-creation-page";

export default async function PostCreatePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string, duplicate?: string, scheduledFor?: string }> 
}) {
  const resolvedParams = await searchParams;
  return <PostCreationPage resolvedParams={resolvedParams} />;
}
