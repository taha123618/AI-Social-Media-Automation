import BlogDashboardEnhanced from "@/features/ai-blog/components/BlogDashboardEnhanced";

export const metadata = {
  title: "Blog Writer Dashboard | AI Social Media Automation",
  description: "Create and optimize rank-ready articles for your brand.",
};

export default function BlogDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BlogDashboardEnhanced />
    </div>
  );
}
