import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/** Valores persistidos en `recommendations.kind` (alinear con `RECOMMENDATION_KINDS` en validaciones). */
export const recommendationKindEnum = ["movie", "series", "book"] as const;

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  nickname: text("nickname").unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("pending"),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: text("reset_token_expires_at"),
  reputation: integer("reputation").notNull().default(0),
  timezone: text("timezone")
    .notNull()
    .default("America/Argentina/Buenos_Aires"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const recommendations = sqliteTable(
  "recommendations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    kind: text("kind", { enum: recommendationKindEnum })
      .notNull()
      .default("movie"),
    imageUrl: text("image_url"),
    externalUrl: text("external_url"),
    bookAuthor: text("book_author"),
    director: text("director"),
    mainActors: text("main_actors"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index("recommendations_user_id_idx").on(table.userId),
    index("recommendations_created_at_idx").on(table.createdAt),
  ],
);

export const recommendationVotes = sqliteTable(
  "recommendation_votes",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    recommendationId: integer("recommendation_id")
      .notNull()
      .references(() => recommendations.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [primaryKey({ columns: [table.userId, table.recommendationId] })],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;
export type RecommendationVote = typeof recommendationVotes.$inferSelect;
