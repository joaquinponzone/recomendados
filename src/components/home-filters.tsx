"use client";

import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type HomeRecommendationsParsed,
  recommendationKindLabel,
} from "@/lib/validations";

const selectClassName = cn(
  "h-9 min-w-0 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm text-foreground shadow-xs outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
);

function countActiveFilters(filters: HomeRecommendationsParsed): number {
  let count = 0;
  if (filters.kind) count++;
  if (filters.q) count++;
  if (filters.sort !== "consensus") count++;
  if (filters.onlyMine) count++;
  return count;
}

export function HomeFilters({
  filters,
  filterActive,
}: {
  filters: HomeRecommendationsParsed;
  filterActive: boolean;
}) {
  const [open, setOpen] = useState(filterActive);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="rounded-xl border border-border bg-card/40">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="filters-form"
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-sm",
          open && "border-b border-border",
        )}
      >
        <span className="flex items-center gap-2 font-medium">
          <SlidersHorizontalIcon className="size-4" aria-hidden="true" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="default" className="h-4 px-1.5 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200 motion-safe:transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Filter form — always visible on desktop, toggleable on mobile */}
      <form
        id="filters-form"
        method="get"
        action="/"
        className={cn("flex-col gap-4 p-4", !open ? "hidden" : "flex")}
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
              spellCheck={false}
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
    </div>
  );
}
