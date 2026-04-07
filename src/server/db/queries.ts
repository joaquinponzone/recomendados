"use server";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  REPUTATION_PER_RECOMMENDATION,
  REPUTATION_PER_VOTE,
} from "@/lib/reputation";
import type { RecommendationKind } from "@/lib/validations";

import { db } from "./index";
import { recommendations, recommendationVotes, users } from "./schema";

// Users

export async function getUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return rows[0] ?? null;
}

export async function getUserByResetToken(tokenHash: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.resetToken, tokenHash))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllUsers() {
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserStatus(userId: number, status: string) {
  await db
    .update(users)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: string) {
  await db
    .update(users)
    .set({ role, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));
}

export async function deactivateUser(userId: number) {
  await db
    .update(users)
    .set({ status: "inactive", updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
}

export async function activateUser(userId: number) {
  await db
    .update(users)
    .set({ status: "active", updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
}

export async function updateUserName(userId: number, name: string) {
  await db
    .update(users)
    .set({ name, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));
}

export async function updateUserNickname(userId: number, nickname: string) {
  await db
    .update(users)
    .set({ nickname, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));
}

export async function updateUserTimezone(userId: number, timezone: string) {
  await db
    .update(users)
    .set({ timezone, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));
}

export async function isNicknameTaken(nickname: string, excludeUserId: number) {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(eq(users.nickname, nickname), sql`${users.id} != ${excludeUserId}`),
    )
    .limit(1);
  return rows.length > 0;
}

// Recommendations

const scoreExpr = sql<number>`coalesce((select sum(${recommendationVotes.value}) from ${recommendationVotes} where ${recommendationVotes.recommendationId} = ${recommendations.id}), 0)`;

export interface RecommendationListRow {
  id: number;
  userId: number;
  title: string;
  description: string;
  kind: RecommendationKind;
  imageUrl: string | null;
  externalUrl: string | null;
  bookAuthor: string | null;
  director: string | null;
  mainActors: string | null;
  createdAt: string;
  authorName: string;
  authorNickname: string | null;
  score: number;
}

export async function listRecommendationsWithScore(): Promise<
  RecommendationListRow[]
> {
  const rows = await db
    .select({
      id: recommendations.id,
      userId: recommendations.userId,
      title: recommendations.title,
      description: recommendations.description,
      kind: recommendations.kind,
      imageUrl: recommendations.imageUrl,
      externalUrl: recommendations.externalUrl,
      bookAuthor: recommendations.bookAuthor,
      director: recommendations.director,
      mainActors: recommendations.mainActors,
      createdAt: recommendations.createdAt,
      authorName: users.name,
      authorNickname: users.nickname,
      score: scoreExpr,
    })
    .from(recommendations)
    .innerJoin(users, eq(recommendations.userId, users.id))
    .orderBy(
      desc(scoreExpr),
      desc(recommendations.createdAt),
      desc(recommendations.id),
    );
  return rows.map((r) => ({
    ...r,
    kind: r.kind as RecommendationKind,
    score: Number(r.score),
  }));
}

export async function listRecommendationsByUserWithScore(
  userId: number,
): Promise<RecommendationListRow[]> {
  const rows = await db
    .select({
      id: recommendations.id,
      userId: recommendations.userId,
      title: recommendations.title,
      description: recommendations.description,
      kind: recommendations.kind,
      imageUrl: recommendations.imageUrl,
      externalUrl: recommendations.externalUrl,
      bookAuthor: recommendations.bookAuthor,
      director: recommendations.director,
      mainActors: recommendations.mainActors,
      createdAt: recommendations.createdAt,
      authorName: users.name,
      authorNickname: users.nickname,
      score: scoreExpr,
    })
    .from(recommendations)
    .innerJoin(users, eq(recommendations.userId, users.id))
    .where(eq(recommendations.userId, userId))
    .orderBy(
      desc(scoreExpr),
      desc(recommendations.createdAt),
      desc(recommendations.id),
    );
  return rows.map((r) => ({
    ...r,
    kind: r.kind as RecommendationKind,
    score: Number(r.score),
  }));
}

export interface RecommendationDetail extends RecommendationListRow {
  updatedAt: string;
}

export async function getRecommendationById(
  id: number,
): Promise<RecommendationDetail | null> {
  const rows = await db
    .select({
      id: recommendations.id,
      userId: recommendations.userId,
      title: recommendations.title,
      description: recommendations.description,
      kind: recommendations.kind,
      imageUrl: recommendations.imageUrl,
      externalUrl: recommendations.externalUrl,
      bookAuthor: recommendations.bookAuthor,
      director: recommendations.director,
      mainActors: recommendations.mainActors,
      createdAt: recommendations.createdAt,
      updatedAt: recommendations.updatedAt,
      authorName: users.name,
      authorNickname: users.nickname,
      score: scoreExpr,
    })
    .from(recommendations)
    .innerJoin(users, eq(recommendations.userId, users.id))
    .where(eq(recommendations.id, id))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  return { ...r, kind: r.kind as RecommendationKind, score: Number(r.score) };
}

export async function getCurrentUserVote(
  userId: number,
  recommendationId: number,
): Promise<1 | -1 | null> {
  const rows = await db
    .select({ value: recommendationVotes.value })
    .from(recommendationVotes)
    .where(
      and(
        eq(recommendationVotes.userId, userId),
        eq(recommendationVotes.recommendationId, recommendationId),
      ),
    )
    .limit(1);
  const v = rows[0]?.value;
  if (v === 1 || v === -1) return v;
  return null;
}

export async function getCurrentUserVotesForRecommendations(
  userId: number,
  recommendationIds: number[],
): Promise<Map<number, 1 | -1>> {
  const map = new Map<number, 1 | -1>();
  if (recommendationIds.length === 0) return map;
  const rows = await db
    .select({
      recommendationId: recommendationVotes.recommendationId,
      value: recommendationVotes.value,
    })
    .from(recommendationVotes)
    .where(
      and(
        eq(recommendationVotes.userId, userId),
        inArray(recommendationVotes.recommendationId, recommendationIds),
      ),
    );
  for (const r of rows) {
    if (r.value === 1 || r.value === -1) {
      map.set(r.recommendationId, r.value);
    }
  }
  return map;
}

export async function createRecommendation(input: {
  userId: number;
  title: string;
  description: string;
  kind: RecommendationKind;
  imageUrl: string | null;
  externalUrl: string | null;
  bookAuthor: string | null;
  director: string | null;
  mainActors: string | null;
}): Promise<number> {
  const now = new Date().toISOString();
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(recommendations)
      .values({
        userId: input.userId,
        title: input.title,
        description: input.description,
        kind: input.kind,
        imageUrl: input.imageUrl,
        externalUrl: input.externalUrl,
        bookAuthor: input.bookAuthor,
        director: input.director,
        mainActors: input.mainActors,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: recommendations.id });
    const id = inserted[0]?.id;
    if (id === undefined) throw new Error("Insert failed");
    await tx
      .update(users)
      .set({
        reputation: sql`${users.reputation} + ${REPUTATION_PER_RECOMMENDATION}`,
        updatedAt: now,
      })
      .where(eq(users.id, input.userId));
    return id;
  });
}

export async function upsertVote(input: {
  voterId: number;
  recommendationId: number;
  value: 1 | -1;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const rec = await db
    .select({ userId: recommendations.userId })
    .from(recommendations)
    .where(eq(recommendations.id, input.recommendationId))
    .limit(1);
  const authorId = rec[0]?.userId;
  if (authorId === undefined)
    return { ok: false, error: "No existe la recomendación." };
  if (authorId === input.voterId) {
    return { ok: false, error: "No podés votar tu propia recomendación." };
  }

  const now = new Date().toISOString();

  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ value: recommendationVotes.value })
      .from(recommendationVotes)
      .where(
        and(
          eq(recommendationVotes.userId, input.voterId),
          eq(recommendationVotes.recommendationId, input.recommendationId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await tx.insert(recommendationVotes).values({
        userId: input.voterId,
        recommendationId: input.recommendationId,
        value: input.value,
        createdAt: now,
        updatedAt: now,
      });
      await tx
        .update(users)
        .set({
          reputation: sql`${users.reputation} + ${REPUTATION_PER_VOTE}`,
          updatedAt: now,
        })
        .where(eq(users.id, input.voterId));
    } else {
      await tx
        .update(recommendationVotes)
        .set({ value: input.value, updatedAt: now })
        .where(
          and(
            eq(recommendationVotes.userId, input.voterId),
            eq(recommendationVotes.recommendationId, input.recommendationId),
          ),
        );
    }
    return { ok: true as const };
  });
}

export interface DeleteRecommendationResult {
  ok: true;
  recommendationId: number;
  authorId: number;
  voterIds: number[];
  imageUrl: string | null;
}

export async function deleteRecommendation(
  id: number,
): Promise<DeleteRecommendationResult | { ok: false; error: string }> {
  return db.transaction(async (tx) => {
    const recRows = await tx
      .select({
        userId: recommendations.userId,
        imageUrl: recommendations.imageUrl,
      })
      .from(recommendations)
      .where(eq(recommendations.id, id))
      .limit(1);
    const rec = recRows[0];
    if (!rec) {
      return { ok: false as const, error: "No existe la recomendación." };
    }

    const voteRows = await tx
      .select({ userId: recommendationVotes.userId })
      .from(recommendationVotes)
      .where(eq(recommendationVotes.recommendationId, id));

    const now = new Date().toISOString();

    await tx
      .update(users)
      .set({
        reputation: sql`max(0, ${users.reputation} - ${REPUTATION_PER_RECOMMENDATION})`,
        updatedAt: now,
      })
      .where(eq(users.id, rec.userId));

    for (const row of voteRows) {
      await tx
        .update(users)
        .set({
          reputation: sql`max(0, ${users.reputation} - ${REPUTATION_PER_VOTE})`,
          updatedAt: now,
        })
        .where(eq(users.id, row.userId));
    }

    await tx.delete(recommendations).where(eq(recommendations.id, id));

    const voterIds = [...new Set(voteRows.map((r) => r.userId))];
    return {
      ok: true as const,
      recommendationId: id,
      authorId: rec.userId,
      voterIds,
      imageUrl: rec.imageUrl,
    };
  });
}

export async function getUserPublicProfile(userId: number) {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      nickname: users.nickname,
      reputation: users.reputation,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0] ?? null;
}
