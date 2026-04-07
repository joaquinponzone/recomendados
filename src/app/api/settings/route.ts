import { eq } from "drizzle-orm";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { type SessionData, sessionOptions } from "@/lib/session";
import { db } from "@/server/db/index";
import { users } from "@/server/db/schema";

async function getUserId() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  return session.userId;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({ timezone: users.timezone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ timezone: row.timezone });
}
