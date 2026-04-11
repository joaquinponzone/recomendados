export const dynamic = "force-dynamic";

import Link from "next/link";

import { RecommendationCard } from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifySession } from "@/lib/dal";
import { cn } from "@/lib/utils";
import {
  type HomeRecommendationsParsed,
  parseHomeRecommendationsSearchParams,
  recommendationKindLabel,
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

  const selectClassName = cn(
    "h-9 min-w-[10rem] rounded-4xl border border-input bg-input/30 px-3 text-sm text-foreground shadow-xs outline-none transition-colors",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  );

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

      <form
        method="get"
        action="/"
        className="flex flex-col gap-4 rounded-xl border border-border bg-card/40 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Tipo</span>
            <select
              name="kind"
              defaultValue={filters.kind ?? ""}
              className={selectClassName}
            >
              <option value="">Todos</option>
              <option value="movie">{recommendationKindLabel("movie")}</option>
              <option value="series">
                {recommendationKindLabel("series")}
              </option>
              <option value="book">{recommendationKindLabel("book")}</option>
            </select>
          </label>
          <label
            className="flex flex-col gap-1.5 text-sm sm:col-span-2 lg:col-span-1"
            htmlFor="home-q"
          >
            <span className="font-medium text-foreground">Buscar</span>
            <Input
              id="home-q"
              name="q"
              type="search"
              placeholder="Título o descripción…"
              defaultValue={filters.q ?? ""}
              autoComplete="off"
              maxLength={200}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Orden</span>
            <select
              name="sort"
              defaultValue={filters.sort}
              className={selectClassName}
            >
              <option value="consensus">Consenso</option>
              <option value="recent">Más recientes</option>
            </select>
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="mine"
              value="1"
              defaultChecked={filters.onlyMine}
              className="size-4 rounded border-input accent-primary"
            />
            <span>Solo mis recomendaciones</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="secondary">
              Aplicar filtros
            </Button>
            {filterActive ? (
              <Button type="button" variant="outline" asChild>
                <Link href="/">Limpiar filtros</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </form>

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
