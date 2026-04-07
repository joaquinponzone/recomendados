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

const recommendationImageUrl = z.string().trim().superRefine((u, ctx) => {
  if (isPrivateBlobProxyImageUrl(u)) return;
  const r = httpUrl.safeParse(u);
  if (!r.success) {
    ctx.addIssue({
      code: "custom",
      message: r.error.issues[0]?.message ?? "URL inválida.",
    });
  }
});

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
  imageUrl: recommendationImageUrl,
  externalUrl: httpUrl,
});
