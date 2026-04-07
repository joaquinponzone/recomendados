"use server";

import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";
import { ForgotPasswordSchema, type FormState } from "@/lib/validations";
import { db } from "@/server/db/index";
import { getUserByEmail } from "@/server/db/queries";
import { users } from "@/server/db/schema";

export async function forgotPassword(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isEmailConfigured()) {
    return {
      error:
        "El correo no está configurado en el servidor. Ponte en contacto con un administrador.",
    };
  }

  const parsed = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;
  const genericSuccess =
    "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contraseña.";

  const user = await getUserByEmail(email);
  if (!user) {
    return { success: genericSuccess };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await db
    .update(users)
    .set({
      resetToken: tokenHash,
      resetTokenExpiresAt: expiresAt,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, user.id));

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch {
    return {
      error:
        "No pudimos enviar el correo de recuperación. Inténtalo de nuevo más tarde.",
    };
  }

  return { success: genericSuccess };
}
