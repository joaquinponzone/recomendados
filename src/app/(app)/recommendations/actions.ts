"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUser, verifySession } from "@/lib/dal";
import { deleteRecommendationBlobIfApplicable } from "@/lib/recommendation-blob";
import type { FormState } from "@/lib/validations";
import {
  deleteRecommendation as deleteRecommendationRow,
  getRecommendationById,
  upsertVote,
} from "@/server/db/queries";

export async function submitVote(formData: FormData) {
  const { userId } = await verifySession();
  const recommendationId = Number(formData.get("recommendationId"));
  const value = Number(formData.get("value"));
  if (!Number.isFinite(recommendationId) || (value !== 1 && value !== -1)) {
    return;
  }
  const result = await upsertVote({
    voterId: userId,
    recommendationId,
    value: value as 1 | -1,
  });
  if (!result.ok) return;

  const rec = await getRecommendationById(recommendationId);
  revalidatePath("/");
  revalidatePath(`/recommendations/${recommendationId}`);
  if (rec) revalidatePath(`/users/${rec.userId}`);
}

export async function deleteRecommendationAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const user = await getUser();
  const userId = user.id;
  const rawId = formData.get("recommendationId");
  const recommendationId = Number(rawId);
  if (!Number.isFinite(recommendationId)) {
    return { error: "Identificador inválido." };
  }

  const rec = await getRecommendationById(recommendationId);
  if (!rec) {
    return { error: "No existe la recomendación." };
  }

  const isAuthor = rec.userId === userId;
  const isAdmin = user.role === "admin";
  if (!isAuthor && !isAdmin) {
    return { error: "No tenés permiso para borrar esta recomendación." };
  }

  const result = await deleteRecommendationRow(recommendationId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/");
  revalidatePath(`/recommendations/${recommendationId}`);
  revalidatePath(`/users/${result.authorId}`);
  for (const voterId of result.voterIds) {
    revalidatePath(`/users/${voterId}`);
  }

  await deleteRecommendationBlobIfApplicable(result.imageUrl);

  redirect("/");
}
