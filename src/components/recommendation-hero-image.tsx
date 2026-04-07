import Image from "next/image";

import { cn } from "@/lib/utils";

export function RecommendationHeroImage({
  imageUrl,
  className,
}: {
  imageUrl: string;
  className?: string;
}) {
  const trimmed = imageUrl.trim();

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg bg-black",
        className,
      )}
    >
      {trimmed ? (
        <Image
          src={trimmed}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 672px"
          unoptimized
        />
      ) : (
        <div className="text-muted-foreground flex h-full items-center justify-center px-4 text-center text-sm">
          Pegá una URL de imagen
        </div>
      )}
    </div>
  );
}
