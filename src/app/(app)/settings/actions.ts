"use server";

import { revalidatePath } from "next/cache";

import { verifySession } from "@/lib/dal";
import {
  isNicknameTaken,
  updateUserName,
  updateUserNickname,
  updateUserTimezone,
} from "@/server/db/queries";

export async function updateDisplayName(name: string) {
  const { userId } = await verifySession();
  const trimmed = name.trim();
  if (!trimmed) return;
  await updateUserName(userId, trimmed);
  revalidatePath("/settings");
}

export async function updateNickname(
  nickname: string,
): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await verifySession();
  const trimmed = nickname.trim().toLowerCase().replace(/\s+/g, "_");
  if (!trimmed)
    return { ok: false, error: "El nickname no puede estar vacío." };
  if (!/^[a-z0-9_]{3,20}$/.test(trimmed)) {
    return { ok: false, error: "Solo letras, números y _ (3-20 caracteres)." };
  }
  const taken = await isNicknameTaken(trimmed, userId);
  if (taken) return { ok: false, error: "Este nickname ya está en uso." };
  await updateUserNickname(userId, trimmed);
  revalidatePath("/settings");
  return { ok: true };
}

export async function updateTimezone(timezone: string) {
  const { userId } = await verifySession();
  const trimmed = timezone.trim();
  if (!trimmed) return;
  await updateUserTimezone(userId, trimmed);
  revalidatePath("/settings");
}
