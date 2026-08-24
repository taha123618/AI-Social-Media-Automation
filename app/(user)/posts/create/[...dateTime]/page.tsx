import { PostCreationPage } from "../_components/post-creation-page";

interface PostCreationPageProps {
  params: Promise<{
    dateTime: string[];
  }>;
}

export default async function PostCreatePage({ params }: PostCreationPageProps) {
  const resolvedParams = await params;
  const dateTimeArray = resolvedParams.dateTime || [];
  const dateTime = dateTimeArray.length > 0 ? dateTimeArray.join('/') : null;

  return <PostCreationPage preselectedDateTime={dateTime} />;
}
