export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { RecommendationCard } from "@/components/recommendation-card";
import { verifySession } from "@/lib/dal";
import {
  getCurrentUserVotesForRecommendations,
  getUserPublicProfile,
  listRecommendationsByUserWithScore,
} from "@/server/db/queries";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: raw } = await params;
  const profileUserId = Number(raw);
  if (!Number.isFinite(profileUserId)) notFound();

  const profile = await getUserPublicProfile(profileUserId);
  if (!profile) notFound();

  const { userId: sessionUserId } = await verifySession();
  const rows = await listRecommendationsByUserWithScore(profileUserId);
  const ids = rows.map((r) => r.id);
  const voteMap = await getCurrentUserVotesForRecommendations(
    sessionUserId,
    ids,
  );

  const displayName = profile.nickname ?? profile.name;

  return (
    <div className="space-y-6">
      <div className="space-y-1 border-b pb-4">
        <h1 className="text-xl font-semibold">{displayName}</h1>
        <p className="text-sm text-muted-foreground">
          Reputación:{" "}
          <span className="font-medium text-foreground">
            {profile.reputation}
          </span>
        </p>
        {sessionUserId === profileUserId ? (
          <p className="text-xs text-muted-foreground">
            Este es tu perfil público.
          </p>
        ) : null}
      </div>
      <h2 className="text-sm font-medium text-muted-foreground">
        Recomendaciones publicadas
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay recomendaciones de este usuario.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <li key={row.id}>
              <RecommendationCard
                compact
                row={row}
                currentUserId={sessionUserId}
                currentVote={voteMap.get(row.id) ?? null}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="text-center text-sm">
        <Link
          href="/"
          className="text-muted-foreground underline-offset-2 hover:underline"
        >
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
