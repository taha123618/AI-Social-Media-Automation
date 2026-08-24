import WizardContainer from "@/features/ai-blog/components/BlogWizard/WizardContainer";

export const metadata = {
  title: "New Blog Generation Wizard | AI Social Media Automation",
  description: "Create structured SEO outlines and write long-form articles in seconds.",
};

export default function NewBlogPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <WizardContainer />
    </div>
  );
}
