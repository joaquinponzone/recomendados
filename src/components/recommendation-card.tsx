"use client";

import Link from "next/link";

import { RecommendationHeroImage } from "@/components/recommendation-hero-image";
import { RecommendationVoteForm } from "@/components/recommendation-vote-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { RecommendationListRow } from "@/server/db/queries";

function excerpt(text: string, max = 160) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function isValidHttpUrl(value: string): boolean {
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
}: {
  row: RecommendationListRow;
  currentUserId: number;
  currentVote: 1 | -1 | null;
  /** Misma UI que en el listado, sin enlaces aún no publicados. */
  isPreview?: boolean;
}) {
  const isAuthor = row.userId === currentUserId;
  const voteDisabled = isAuthor || isPreview;
  const externalOk = isValidHttpUrl(row.externalUrl);

  return (
    <Card className="overflow-hidden">
      <RecommendationHeroImage
        imageUrl={row.imageUrl}
        className="rounded-none"
      />
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-start justify-between gap-2">
          {isPreview ? (
            <span className="font-semibold leading-tight">{row.title}</span>
          ) : (
            <Link
              href={`/recommendations/${row.id}`}
              className="font-semibold leading-tight hover:underline"
            >
              {row.title}
            </Link>
          )}
          <span
            className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums"
            title="Saldo de votos"
          >
            {row.score > 0 ? `+${row.score}` : row.score}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Por{" "}
          <Link
            href={`/users/${row.userId}`}
            className="text-foreground underline-offset-2 hover:underline"
          >
            {row.authorNickname ?? row.authorName}
          </Link>
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {excerpt(row.description)}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
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
          {isPreview && !externalOk ? (
            <Button variant="outline" size="sm" disabled>
              Ficha
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <a
                href={row.externalUrl.trim() || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ficha
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
