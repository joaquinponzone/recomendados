export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteRecommendationButton } from "@/components/delete-recommendation-button";
import { RecommendationHeroImage } from "@/components/recommendation-hero-image";
import { RecommendationVoteForm } from "@/components/recommendation-vote-form";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/dal";
import { getCurrentUserVote, getRecommendationById } from "@/server/db/queries";

export default async function RecommendationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id)) notFound();

  const currentUser = await getUser();
  const userId = currentUser.id;
  const rec = await getRecommendationById(id);
  if (!rec) notFound();

  const currentVote = await getCurrentUserVote(userId, id);
  const isAuthor = rec.userId === userId;
  const canDelete = isAuthor || currentUser.role === "admin";

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">← Volver al listado</Link>
        </Button>
        {canDelete ? (
          <DeleteRecommendationButton recommendationId={id} title={rec.title} />
        ) : null}
      </div>
      <RecommendationHeroImage imageUrl={rec.imageUrl} />
      <header className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{rec.title}</h1>
          <span className="rounded-md bg-muted px-2 py-1 text-sm font-medium tabular-nums">
            {rec.score > 0 ? `+${rec.score}` : rec.score} puntos
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Por{" "}
          <Link
            href={`/users/${rec.userId}`}
            className="text-foreground underline-offset-2 hover:underline"
          >
            {rec.authorNickname ?? rec.authorName}
          </Link>
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-4 border-y py-4">
        <RecommendationVoteForm
          recommendationId={id}
          currentVote={currentVote}
          disabled={isAuthor}
        />
        <Button variant="outline" size="sm" asChild>
          <a href={rec.externalUrl} target="_blank" rel="noopener noreferrer">
            Ver ficha externa
          </a>
        </Button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {rec.description}
      </p>
    </article>
  );
}
