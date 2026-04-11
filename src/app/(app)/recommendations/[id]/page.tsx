export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteRecommendationButton } from "@/components/delete-recommendation-button";
import { RecommendationHeroImage } from "@/components/recommendation-hero-image";
import { RecommendationVoteForm } from "@/components/recommendation-vote-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/dal";
import { recommendationKindLabel } from "@/lib/validations";
import { getCurrentUserVote, getRecommendationById } from "@/server/db/queries";

function hasValidExternalUrl(url: string | null | undefined): url is string {
  if (url == null || !url.trim()) return false;
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

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
  const externalLink = rec.externalUrl;
  const showExternal = hasValidExternalUrl(externalLink);

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex w-full min-w-0 items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">← Volver al listado</Link>
        </Button>
        {canDelete ? (
          <DeleteRecommendationButton recommendationId={id} title={rec.title} />
        ) : null}
      </div>
      <RecommendationHeroImage imageUrl={rec.imageUrl} kind={rec.kind} />
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {recommendationKindLabel(rec.kind)}
          </Badge>
          <Badge variant="outline" className="shrink-0 tabular-nums text-sm">
            {rec.score > 0 ? `+${rec.score}` : rec.score} puntos
          </Badge>
        </div>
        <h1 className="text-pretty text-2xl font-semibold tracking-tight">
          {rec.title}
        </h1>
        <dl className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="min-w-0">
            <dt className="sr-only">Recomendado por</dt>
            <dd className="min-w-0 break-words">
              <span className="text-foreground/80">Recomendado por</span>{" "}
              <Link
                href={`/users/${rec.userId}`}
                className="text-foreground underline-offset-2 motion-safe:transition-colors motion-safe:duration-150 hover:underline"
              >
                {rec.authorNickname ?? rec.authorName}
              </Link>
            </dd>
          </div>
          {rec.kind === "book" && rec.bookAuthor ? (
            <div className="min-w-0">
              <dt className="sr-only">Autor del libro</dt>
              <dd className="min-w-0 break-words">
                <span className="text-foreground/80">Autor del libro:</span>{" "}
                {rec.bookAuthor}
              </dd>
            </div>
          ) : null}
          {rec.kind !== "book" && rec.director ? (
            <div className="min-w-0">
              <dt className="sr-only">Directores</dt>
              <dd className="min-w-0 break-words">
                <span className="text-foreground/80">Directores:</span>{" "}
                {rec.director}
              </dd>
            </div>
          ) : null}
          {rec.kind !== "book" && rec.mainActors ? (
            <div className="min-w-0">
              <dt className="sr-only">Actores principales</dt>
              <dd className="min-w-0 break-words">
                <span className="text-foreground/80">
                  Actores principales:
                </span>{" "}
                {rec.mainActors}
              </dd>
            </div>
          ) : null}
        </dl>
      </header>
      <div className="flex flex-wrap items-center gap-4 border-y py-4">
        <RecommendationVoteForm
          recommendationId={id}
          currentVote={currentVote}
          disabled={isAuthor}
        />
        {showExternal ? (
          <Button variant="outline" size="sm" asChild>
            <a
              href={externalLink.trim()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver ficha externa
            </a>
          </Button>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {rec.description}
      </p>
    </article>
  );
}
