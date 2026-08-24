import { EnhancedPostCreation } from '../../create/_components/enhanced-post-creation';

export default async function PostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <EnhancedPostCreation
      editId={id}
      isDuplicate={false}
    />
  );
}
