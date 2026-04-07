"use client";

import { RecommendationCard } from "@/components/recommendation-card";
import type { RecommendationListRow } from "@/server/db/queries";

export function RecommendationCreatePreview({
  title,
  description,
  imageUrl,
  /** Vista previa local (`blob:`) o URL; si está definido, tiene prioridad sobre `imageUrl`. */
  imagePreviewUrl,
  externalUrl,
  authorLabel,
  userId,
}: {
  title: string;
  description: string;
  imageUrl: string;
  imagePreviewUrl?: string;
  externalUrl: string;
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
    imageUrl: heroSrc,
    externalUrl: externalUrl.trim(),
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
