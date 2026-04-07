import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { REPUTATION_PER_RECOMMENDATION } from "@/lib/reputation";

import { db } from "./index";
import { recommendations, users } from "./schema";

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL env var is required for seeding");
  }

  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  const inserted = await db
    .insert(users)
    .values({
      email,
      name: "Admin",
      passwordHash,
      role: "admin",
      status: "active",
      reputation: 0,
      timezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  const adminId = inserted[0]?.id;
  if (!adminId) {
    console.log("Admin user already exists, skipping user seed");
    return;
  }

  console.log(`Seeded admin user (id=${adminId}, email=${email})`);

  await db.insert(recommendations).values({
    userId: adminId,
    title: "Matrix",
    description:
      "Ciencia ficción de los Wachowski: realidad simulada, acción icónica y filosofía accesible. Ficha en IMDb: https://www.imdb.com/es/title/tt0133093/ — podés borrar esta entrada cuando haya moderación en la app.",
    imageUrl:
      "https://biblioteca.ulpgc.es/sites/default/files/attachments_files/theend/Matrix.jpg",
    externalUrl: "https://www.netflix.com/ar/title/20557937",
    createdAt: now,
    updatedAt: now,
  });

  await db
    .update(users)
    .set({
      reputation: REPUTATION_PER_RECOMMENDATION,
      updatedAt: now,
    })
    .where(eq(users.id, adminId));

  console.log("Seeded sample recommendation (+5 reputación al admin)");
}

seed().catch(console.error);
