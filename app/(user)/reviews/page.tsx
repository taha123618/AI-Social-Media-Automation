import { ReviewsDashboard } from './_components/reviews-dashboard';
import { getCurrentBusinessAndUser } from '../contents/actions/get-current-user';

export const dynamic = 'force-dynamic';

export default async function ReviewsPageWrapper() {
   const businessData = await getCurrentBusinessAndUser();

   return <ReviewsDashboard businessData={businessData} />;
}
