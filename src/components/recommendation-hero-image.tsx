import Image from "next/image";
import { Book, Film, Tv } from "lucide-react";

import { recommendationKindLabel, type RecommendationKind } from "@/lib/validations";
import { cn } from "@/lib/utils";

function KindFallbackIcon({
  kind,
  className,
}: {
  kind: RecommendationKind;
  className?: string;
}) {
  if (kind === "book") return <Book className={className} strokeWidth={1.25} />;
  if (kind === "movie") return <Film className={className} strokeWidth={1.25} />;
  return <Tv className={className} strokeWidth={1.25} />;
}

export function RecommendationHeroImage({
  imageUrl,
  className,
  emptyLabel,
  kind,
  variant = "default",
}: {
  imageUrl: string | null | undefined;
  className?: string;
  /** Texto opcional bajo el icono (p. ej. instrucciones en vista previa). */
  emptyLabel?: string;
  /** Si hay tipo y no hay imagen, se muestra icono de libro / película / serie. */
  kind?: RecommendationKind;
  /** `compact` acorta la altura en listados densos. */
  variant?: "default" | "compact";
}) {
  const trimmed = (imageUrl ?? "").trim();
  const isCompact = variant === "compact";
  const showKindFallback = !trimmed && kind != null;
  const extraLabel = (emptyLabel ?? "").trim();
  const fallbackAria = (() => {
    if (kind != null) {
      const base = `Sin imagen de portada: ${recommendationKindLabel(kind)}`;
      return extraLabel ? `${base}. ${extraLabel}` : base;
    }
    return extraLabel || "Sin imagen de portada";
  })();

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
          role="img"
          aria-label={fallbackAria}
          className={cn(
            "text-muted-foreground flex h-full flex-col items-center justify-center px-4 text-center",
            isCompact ? "gap-2" : "gap-3",
          )}
        >
          {showKindFallback ? (
            <KindFallbackIcon
              kind={kind}
              className={cn(
                "shrink-0 opacity-80",
                isCompact ? "size-12" : "size-20 md:size-24",
              )}
            />
          ) : null}
          {extraLabel ? (
            <p
              className={cn(
                "max-w-md text-pretty",
                isCompact ? "text-xs leading-snug" : "text-sm leading-snug",
                showKindFallback && "text-muted-foreground/90",
              )}
            >
              {extraLabel}
            </p>
          ) : !showKindFallback ? (
            <p className={cn(isCompact ? "text-xs" : "text-sm")}>
              {emptyLabel ?? "Sin imagen de portada"}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
