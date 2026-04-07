import { getUser } from "@/lib/dal";

import { NewRecommendationForm } from "./new-recommendation-form";

export default async function NewRecommendationPage() {
  const user = await getUser();
  const authorLabel = user.nickname ?? user.name;

  return <NewRecommendationForm authorLabel={authorLabel} userId={user.id} />;
}
