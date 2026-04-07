"use client";

import Link from "next/link";

import { RecommendationHeroImage } from "@/components/recommendation-hero-image";
import { RecommendationVoteForm } from "@/components/recommendation-vote-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { recommendationKindLabel } from "@/lib/validations";
import type { RecommendationListRow } from "@/server/db/queries";

function excerpt(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function isValidHttpUrl(value: string | null | undefined): boolean {
  if (value == null) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function RecommendationCard({
  row,
  currentUserId,
  currentVote,
  isPreview = false,
  compact = false,
}: {
  row: RecommendationListRow;
  currentUserId: number;
  currentVote: 1 | -1 | null;
  /** Misma UI que en el listado, sin enlaces aún no publicados. */
  isPreview?: boolean;
  /** Listados: imagen y texto más compactos. */
  compact?: boolean;
}) {
  const isAuthor = row.userId === currentUserId;
  const voteDisabled = isAuthor || isPreview;
  const externalOk = isValidHttpUrl(row.externalUrl);
  const descMax = compact ? 120 : 160;
  const descClamp = compact ? "line-clamp-2" : "line-clamp-3";

  const titleLinkClass =
    "font-semibold leading-tight text-pretty motion-safe:transition-colors motion-safe:duration-150 hover:underline";

  return (
    <Card size={compact ? "sm" : "default"} className="overflow-hidden">
      <RecommendationHeroImage
        imageUrl={row.imageUrl}
        variant={compact ? "compact" : "default"}
        emptyLabel={
          isPreview
            ? "Podés agregar portada con archivo o URL (opcional)"
            : "Sin imagen de portada"
        }
        className="rounded-none"
      />
      <CardHeader className={cn(compact && "gap-1.5")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              {isPreview ? (
                <span className={titleLinkClass}>{row.title}</span>
              ) : (
                <Link
                  href={`/recommendations/${row.id}`}
                  className={cn(titleLinkClass, "text-foreground")}
                >
                  {row.title}
                </Link>
              )}
              <Badge variant="secondary" className="shrink-0">
                {recommendationKindLabel(row.kind)}
              </Badge>
            </div>
            <dl className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="min-w-0">
                <dt className="sr-only">Recomendado por</dt>
                <dd className="min-w-0 break-words">
                  <span className="text-foreground/80">Recomendado por</span>{" "}
                  <Link
                    href={`/users/${row.userId}`}
                    className="text-foreground underline-offset-2 motion-safe:transition-colors motion-safe:duration-150 hover:underline"
                  >
                    {row.authorNickname ?? row.authorName}
                  </Link>
                </dd>
              </div>
              {row.kind === "book" && row.bookAuthor ? (
                <div className="min-w-0">
                  <dt className="sr-only">Autor del libro</dt>
                  <dd className="min-w-0 break-words">
                    <span className="text-foreground/80">Autor del libro:</span>{" "}
                    {row.bookAuthor}
                  </dd>
                </div>
              ) : null}
              {row.kind !== "book" && row.director ? (
                <div className="min-w-0">
                  <dt className="sr-only">Directores</dt>
                  <dd className="min-w-0 break-words">
                    <span className="text-foreground/80">Directores:</span>{" "}
                    {row.director}
                  </dd>
                </div>
              ) : null}
              {row.kind !== "book" && row.mainActors ? (
                <div className="min-w-0">
                  <dt className="sr-only">Actores principales</dt>
                  <dd className="min-w-0 break-words">
                    <span className="text-foreground/80">
                      Actores principales:
                    </span>{" "}
                    {row.mainActors}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 tabular-nums"
            title="Saldo de votos"
          >
            {row.score > 0 ? `+${row.score}` : row.score}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("pb-2", compact && "pt-0")}>
        <p
          className={cn(
            "text-sm text-muted-foreground",
            descClamp,
            compact && "text-xs",
          )}
        >
          {excerpt(row.description, descMax)}
        </p>
      </CardContent>
      <CardFooter
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-t",
          compact ? "gap-2 pt-3 pb-0" : "pt-4",
        )}
      >
        <RecommendationVoteForm
          recommendationId={row.id}
          currentVote={currentVote}
          disabled={voteDisabled}
        />
        <div className="flex gap-2">
          {isPreview ? (
            <Button variant="ghost" size="sm" disabled>
              Ver
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/recommendations/${row.id}`}>Ver</Link>
            </Button>
          )}
          {externalOk && row.externalUrl ? (
            <Button variant="outline" size="sm" asChild>
              <a
                href={row.externalUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ficha
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Ficha
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
