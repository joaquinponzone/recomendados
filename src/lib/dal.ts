import "server-only";

import { eq } from "drizzle-orm";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { type SessionData, sessionOptions } from "@/lib/session";
import { db } from "@/server/db/index";
import { users } from "@/server/db/schema";

export const verifySession = cache(async () => {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.userId) {
    redirect("/login");
  }

  return { userId: session.userId };
});

export const getUser = cache(async () => {
  const { userId } = await verifySession();

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      nickname: users.nickname,
      role: users.role,
      status: users.status,
      reputation: users.reputation,
      timezone: users.timezone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!rows[0]) {
    redirect("/login");
  }

  return rows[0];
});

export async function requireAdmin() {
  const user = await getUser();
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
}
