"use client";

import { RecommendationCard } from "@/components/recommendation-card";
import type { RecommendationKind } from "@/lib/validations";
import type { RecommendationListRow } from "@/server/db/queries";

export function RecommendationCreatePreview({
  title,
  description,
  kind,
  imageUrl,
  /** Vista previa local (`blob:`) o URL; si está definido, tiene prioridad sobre `imageUrl`. */
  imagePreviewUrl,
  externalUrl,
  bookAuthor,
  director,
  mainActors,
  authorLabel,
  userId,
}: {
  title: string;
  description: string;
  kind: RecommendationKind;
  imageUrl: string;
  imagePreviewUrl?: string;
  externalUrl: string;
  bookAuthor: string;
  director: string;
  mainActors: string;
  authorLabel: string;
  userId: number;
}) {
  const heroSrc = imagePreviewUrl?.trim() || imageUrl.trim();
  const displayTitle = title.trim() || "Sin título";

  const previewRow: RecommendationListRow = {
    id: 0,
    userId,
    title: displayTitle,
    description: description.trim(),
    kind,
    imageUrl: heroSrc || null,
    externalUrl: externalUrl.trim() || null,
    bookAuthor: bookAuthor.trim() || null,
    director: director.trim() || null,
    mainActors: mainActors.trim() || null,
    createdAt: "",
    authorName: authorLabel,
    authorNickname: null,
    score: 0,
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted-foreground">Vista previa</p>
      <RecommendationCard
        row={previewRow}
        currentUserId={userId}
        currentVote={null}
        isPreview
      />
    </div>
  );
}
