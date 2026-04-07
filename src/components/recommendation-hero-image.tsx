import Image from "next/image";

import { cn } from "@/lib/utils";

export function RecommendationHeroImage({
  imageUrl,
  className,
  emptyLabel = "Pegá una URL de imagen",
  variant = "default",
}: {
  imageUrl: string | null | undefined;
  className?: string;
  /** Texto cuando no hay imagen (p. ej. preview vs publicado sin portada). */
  emptyLabel?: string;
  /** `compact` acorta la altura en listados densos. */
  variant?: "default" | "compact";
}) {
  const trimmed = (imageUrl ?? "").trim();
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-black",
        isCompact
          ? "aspect-video max-h-36 border-b border-border sm:max-h-40"
          : "aspect-video",
        className,
      )}
    >
      {trimmed ? (
        <Image
          src={trimmed}
          alt=""
          fill
          className="object-contain"
          sizes={
            isCompact
              ? "(max-width: 768px) 100vw, 33vw"
              : "(max-width: 768px) 100vw, 672px"
          }
          unoptimized
        />
      ) : (
        <div
          className={cn(
            "text-muted-foreground flex h-full items-center justify-center px-4 text-center",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          {emptyLabel}
        </div>
      )}
    </div>
  );
}
