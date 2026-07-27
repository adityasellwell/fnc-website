import { getFeaturedReviews } from "@/lib/data/reviews";
import ReviewsSlider from "./ReviewsSlider";

/**
 * Server component: fetches data and passes to client slider.
 */
export default async function Reviews() {
  const reviews = await getFeaturedReviews(6);
  return <ReviewsSlider reviews={reviews} />;
}
