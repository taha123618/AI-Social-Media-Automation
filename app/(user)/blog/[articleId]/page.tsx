import BlogEditor from "@/features/ai-blog/components/BlogEditor/BlogEditor";

export const metadata = {
  title: "Article Workspace | AI Blog Writer",
  description: "Edit, optimize, and export your generated blog post.",
};

export default async function BlogEditorPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BlogEditor articleId={articleId} />
    </div>
  );
}
