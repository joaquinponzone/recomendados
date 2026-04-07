"use server";

import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { deleteRecommendationBlobIfApplicable } from "@/lib/recommendation-blob";
import { uploadRecommendationImageToBlob } from "@/lib/recommendation-image-upload";
import { CreateRecommendationSchema, type FormState } from "@/lib/validations";
import { createRecommendation as insertRecommendation } from "@/server/db/queries";

export async function createRecommendation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { userId } = await verifySession();

  const imageFile = formData.get("imageFile");
  const imageUrlRaw = formData.get("imageUrl");

  let finalImageUrl: string | undefined;
  let blobUploaded = false;

  // Prioridad: archivo elegido sobre URL pegada (misma request).
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploadResult = await uploadRecommendationImageToBlob(
      userId,
      imageFile,
    );
    if ("error" in uploadResult) {
      return { error: uploadResult.error };
    }
    finalImageUrl = uploadResult.url;
    blobUploaded = true;
  } else if (typeof imageUrlRaw === "string" && imageUrlRaw.trim()) {
    finalImageUrl = imageUrlRaw.trim();
  }

  if (!finalImageUrl) {
    return { error: "Subí una imagen o pegá una URL." };
  }

  const parsed = CreateRecommendationSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    imageUrl: finalImageUrl,
    externalUrl: formData.get("externalUrl"),
  });

  if (!parsed.success) {
    if (blobUploaded) {
      await deleteRecommendationBlobIfApplicable(finalImageUrl);
    }
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  let newId: number;
  try {
    newId = await insertRecommendation({
      userId,
      ...parsed.data,
    });
  } catch (err) {
    console.error("[createRecommendation] insert failed:", err);
    if (blobUploaded) {
      await deleteRecommendationBlobIfApplicable(finalImageUrl);
    }
    return { error: "No se pudo guardar la recomendación. Probá de nuevo." };
  }

  // `redirect` throws a framework error; must not be inside the insert try/catch.
  redirect(`/recommendations/${newId}`);
}
