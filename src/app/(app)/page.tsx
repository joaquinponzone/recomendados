export const dynamic = "force-dynamic";

import Link from "next/link";

import { HomeFilters } from "@/components/home-filters";
import { RecommendationCard } from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { verifySession } from "@/lib/dal";
import {
  type HomeRecommendationsParsed,
  parseHomeRecommendationsSearchParams,
} from "@/lib/validations";
import {
  getCurrentUserVotesForRecommendations,
  listRecommendationsWithScore,
} from "@/server/db/queries";

function homeListSubtitle(filters: HomeRecommendationsParsed): string {
  if (filters.sort === "recent") {
    return "Ordenadas por fecha (más recientes primero).";
  }
  return "Ordenadas por consenso (votos positivos menos negativos), luego las más recientes.";
}

function hasActiveFilters(filters: HomeRecommendationsParsed): boolean {
  return Boolean(
    filters.kind ||
      filters.q ||
      filters.sort !== "consensus" ||
      filters.onlyMine,
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const filters = parseHomeRecommendationsSearchParams(sp);
  const { userId } = await verifySession();

  const rows = await listRecommendationsWithScore({
    kind: filters.kind,
    q: filters.q,
    sort: filters.sort,
    onlyMine: filters.onlyMine,
    sessionUserId: userId,
  });

  const ids = rows.map((r) => r.id);
  const voteMap = await getCurrentUserVotesForRecommendations(userId, ids);

  const filterActive = hasActiveFilters(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Recomendaciones
          </h1>
          <p className="text-sm text-muted-foreground">
            {homeListSubtitle(filters)}
          </p>
        </div>
        <Button asChild>
          <Link href="/recommendations/new">Nueva recomendación</Link>
        </Button>
      </div>

      <HomeFilters filters={filters} filterActive={filterActive} />

      {rows.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {filterActive ? (
            <>
              No hay resultados con estos filtros.{" "}
              <Link href="/" className="text-foreground underline">
                Ver todas
              </Link>
              .
            </>
          ) : (
            <>
              Todavía no hay recomendaciones.{" "}
              <Link
                href="/recommendations/new"
                className="text-foreground underline"
              >
                Publicá la primera
              </Link>
              .
            </>
          )}
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
