export const dynamic = "force-dynamic";

import Link from "next/link";

import { RecommendationCard } from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { verifySession } from "@/lib/dal";
import {
  getCurrentUserVotesForRecommendations,
  listRecommendationsWithScore,
} from "@/server/db/queries";

export default async function HomePage() {
  const { userId } = await verifySession();
  const rows = await listRecommendationsWithScore();
  const ids = rows.map((r) => r.id);
  const voteMap = await getCurrentUserVotesForRecommendations(userId, ids);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Recomendaciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Ordenadas por consenso (votos positivos menos negativos), luego las
            más recientes.
          </p>
        </div>
        <Button asChild>
          <Link href="/recommendations/new">Nueva recomendación</Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Todavía no hay recomendaciones.{" "}
          <Link
            href="/recommendations/new"
            className="text-foreground underline"
          >
            Publicá la primera
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <li key={row.id}>
              <RecommendationCard
                compact
                row={row}
                currentUserId={userId}
                currentVote={voteMap.get(row.id) ?? null}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
