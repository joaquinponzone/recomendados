import { z } from "zod/v4";

export const LoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const ForgotPasswordSchema = z.object({
  email: z.email("Introduce un correo electrónico válido."),
});

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type FormState = {
  error?: string;
  success?: string;
};

const httpUrl = z
  .string()
  .url("URL inválida.")
  .refine(
    (u) => {
      try {
        const p = new URL(u).protocol;
        return p === "http:" || p === "https:";
      } catch {
        return false;
      }
    },
    { message: "La URL debe ser http o https." },
  );

/** Same-origin proxy returned when images are stored in a private Vercel Blob store. */
function isPrivateBlobProxyImageUrl(u: string): boolean {
  if (!u.startsWith("/")) return false;
  try {
    const parsed = new URL(u, "http://local.invalid");
    if (parsed.pathname !== "/api/recommendation-blob") return false;
    const pathname = parsed.searchParams.get("pathname");
    return (
      typeof pathname === "string" && pathname.startsWith("recommendations/")
    );
  } catch {
    return false;
  }
}

const recommendationImageUrl = z
  .string()
  .trim()
  .superRefine((u, ctx) => {
    if (isPrivateBlobProxyImageUrl(u)) return;
    const r = httpUrl.safeParse(u);
    if (!r.success) {
      ctx.addIssue({
        code: "custom",
        message: r.error.issues[0]?.message ?? "URL inválida.",
      });
    }
  });

function emptyFormFieldToUndefined(value: unknown): unknown {
  // FormData omits absent fields → `null`; Zod optional strings reject null.
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") return value;
  const t = value.trim();
  return t === "" ? undefined : value;
}

const optionalHttpUrl = z.preprocess(
  emptyFormFieldToUndefined,
  httpUrl.optional(),
);

const optionalRecommendationImageUrl = z.preprocess(
  emptyFormFieldToUndefined,
  recommendationImageUrl.optional(),
);

const optionalMetaText = (max: number, message: string) =>
  z.preprocess(
    emptyFormFieldToUndefined,
    z.string().trim().max(max, message).optional(),
  );

export const RECOMMENDATION_KINDS = ["movie", "series", "book"] as const;
export type RecommendationKind = (typeof RECOMMENDATION_KINDS)[number];

export function recommendationKindLabel(kind: RecommendationKind): string {
  if (kind === "movie") return "Película";
  if (kind === "series") return "Serie";
  return "Libro";
}

export const HOME_RECOMMENDATION_SORT = ["consensus", "recent"] as const;
export type HomeRecommendationSort = (typeof HOME_RECOMMENDATION_SORT)[number];

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export const HomeRecommendationsSearchSchema = z
  .object({
    kind: z.string().optional(),
    q: z.string().max(200).optional(),
    sort: z.string().optional(),
    mine: z.string().optional(),
  })
  .transform((data) => {
    const kindRaw = data.kind?.trim();
    const kind =
      kindRaw && RECOMMENDATION_KINDS.includes(kindRaw as RecommendationKind)
        ? (kindRaw as RecommendationKind)
        : undefined;

    const qRaw = data.q?.trim();
    const q = qRaw && qRaw.length > 0 ? qRaw.slice(0, 200) : undefined;

    const sort: HomeRecommendationSort =
      data.sort === "recent" ? "recent" : "consensus";

    const onlyMine = data.mine === "1";

    return { kind, q, sort, onlyMine };
  });

export type HomeRecommendationsParsed = z.infer<
  typeof HomeRecommendationsSearchSchema
>;

export function parseHomeRecommendationsSearchParams(
  raw: Record<string, string | string[] | undefined>,
): HomeRecommendationsParsed {
  const input = {
    kind: firstSearchParam(raw.kind),
    q: firstSearchParam(raw.q),
    sort: firstSearchParam(raw.sort),
    mine: firstSearchParam(raw.mine),
  };
  const result = HomeRecommendationsSearchSchema.safeParse(input);
  if (result.success) return result.data;
  return {
    kind: undefined,
    q: undefined,
    sort: "consensus",
    onlyMine: false,
  };
}

export const CreateRecommendationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(200, "Máximo 200 caracteres."),
  description: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria.")
    .max(8000, "Máximo 8000 caracteres."),
  kind: z.enum(RECOMMENDATION_KINDS, {
    message: "Elegí un tipo válido (película, serie o libro).",
  }),
  imageUrl: optionalRecommendationImageUrl,
  externalUrl: optionalHttpUrl,
  bookAuthor: optionalMetaText(300, "Máximo 300 caracteres para el autor."),
  director: optionalMetaText(300, "Máximo 300 caracteres para el director."),
  mainActors: optionalMetaText(
    500,
    "Máximo 500 caracteres para actores principales.",
  ),
});
