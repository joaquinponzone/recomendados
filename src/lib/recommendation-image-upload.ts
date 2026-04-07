import "server-only";

import { randomUUID } from "node:crypto";

import {
  BlobAccessError,
  BlobClientTokenExpiredError,
  BlobContentTypeNotAllowedError,
  BlobError,
  BlobFileTooLargeError,
  BlobServiceNotAvailable,
  BlobServiceRateLimited,
  BlobStoreNotFoundError,
  BlobStoreSuspendedError,
  del,
  head,
  put,
} from "@vercel/blob";

import { RECOMMENDATION_IMAGE_MAX_BYTES } from "@/lib/recommendation-image-limits";

const mimeToExt: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const allowedTypes = new Set(Object.keys(mimeToExt));

const extToMime: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function mimeFromFileName(fileName: string): string | null {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = fileName.slice(dot + 1).toLowerCase();
  return extToMime[ext] ?? null;
}

function resolveImageContentType(file: File): string | null {
  const raw = file.type?.trim();
  if (raw && raw !== "application/octet-stream" && allowedTypes.has(raw)) {
    return raw;
  }
  const fromName = mimeFromFileName(file.name);
  if (fromName) return fromName;
  if (raw && allowedTypes.has(raw)) return raw;
  return null;
}

function uploadErrorMessage(err: unknown): string {
  if (err instanceof BlobStoreNotFoundError) {
    return "No se encontró el almacenamiento de Blob en Vercel. Revisá el token y el store.";
  }
  if (err instanceof BlobAccessError) {
    return "El token de Blob no tiene permiso para subir. Generá un token con permiso de lectura/escritura.";
  }
  if (err instanceof BlobClientTokenExpiredError) {
    return "El token de Vercel Blob expiró. Generá uno nuevo en el dashboard.";
  }
  if (err instanceof BlobContentTypeNotAllowedError) {
    return "Vercel rechazó el tipo de archivo. Usá JPEG, PNG, WebP o GIF.";
  }
  if (err instanceof BlobFileTooLargeError) {
    return "El archivo es demasiado grande para Vercel Blob.";
  }
  if (err instanceof BlobStoreSuspendedError) {
    return "El store de Blob está suspendido. Revisá el proyecto en Vercel.";
  }
  if (err instanceof BlobServiceNotAvailable) {
    return "El servicio de Blob no está disponible. Probá de nuevo en unos minutos.";
  }
  if (err instanceof BlobServiceRateLimited) {
    return "Demasiadas subidas seguidas. Esperá un momento y probá de nuevo.";
  }
  if (err instanceof BlobError) {
    return "Error de Vercel Blob. Revisá la consola del servidor o el token.";
  }
  if (err instanceof Error && err.message) {
    console.error("[uploadRecommendationImageToBlob]", err);
    return `No se pudo subir la imagen: ${err.message}`;
  }
  console.error("[uploadRecommendationImageToBlob] unknown error:", err);
  return "No se pudo subir la imagen. Probá de nuevo.";
}

function wantsPrivateBlobOnly(): boolean {
  return process.env.BLOB_ACCESS?.trim().toLowerCase() === "private";
}

function isPrivateStoreOnlyError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /private store|Cannot use public access/i.test(msg);
}

function proxyImageUrl(pathname: string): string {
  return `/api/recommendation-blob?pathname=${encodeURIComponent(pathname)}`;
}

/** Confirma que el objeto existe antes de persistir la recomendación. Si falla, borra el blob recién subido. */
async function verifyUploadedBlobOrCleanup(
  pathname: string,
  token: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    await head(pathname, { token });
    return { ok: true };
  } catch (err) {
    console.error(
      "[uploadRecommendationImageToBlob] head after put failed:",
      err,
    );
    try {
      await del(pathname, { token });
    } catch (delErr) {
      console.error(
        "[uploadRecommendationImageToBlob] cleanup after failed verify:",
        delErr,
      );
    }
    return { error: uploadErrorMessage(err) };
  }
}

/**
 * Sube un archivo a Vercel Blob (misma política public / private que antes).
 * Llamar solo al persistir la recomendación para evitar blobs huérfanos.
 */
export async function uploadRecommendationImageToBlob(
  userId: number,
  file: File,
): Promise<{ url: string } | { error: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token?.trim()) {
    return {
      error:
        "Falta BLOB_READ_WRITE_TOKEN en el entorno. Configuralo en .env o en Vercel.",
    };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elegí un archivo de imagen." };
  }

  if (file.size > RECOMMENDATION_IMAGE_MAX_BYTES) {
    return { error: "La imagen no puede superar 4 MB." };
  }

  const type = resolveImageContentType(file);
  if (!type || !allowedTypes.has(type)) {
    return {
      error:
        "Formato no permitido. Usá JPEG, PNG, WebP o GIF (o un archivo con esas extensiones).",
    };
  }

  const ext = mimeToExt[type] ?? "bin";
  const pathname = `recommendations/${userId}/${randomUUID()}.${ext}`;

  try {
    const body = Buffer.from(await file.arrayBuffer());

    if (wantsPrivateBlobOnly()) {
      await put(pathname, body, {
        access: "private",
        token,
        contentType: type,
      });
      const verified = await verifyUploadedBlobOrCleanup(pathname, token);
      if ("error" in verified) return verified;
      return { url: proxyImageUrl(pathname) };
    }

    try {
      const publicBlob = await put(pathname, body, {
        access: "public",
        token,
        contentType: type,
      });
      const verified = await verifyUploadedBlobOrCleanup(pathname, token);
      if ("error" in verified) return verified;
      return { url: publicBlob.url };
    } catch (firstErr) {
      if (!isPrivateStoreOnlyError(firstErr)) {
        console.error(
          "[uploadRecommendationImageToBlob] put failed:",
          firstErr,
        );
        return { error: uploadErrorMessage(firstErr) };
      }
      console.info(
        "[uploadRecommendationImageToBlob] Blob store is private-only; retrying with access: private",
      );
      try {
        await put(pathname, body, {
          access: "private",
          token,
          contentType: type,
        });
        const verified = await verifyUploadedBlobOrCleanup(pathname, token);
        if ("error" in verified) return verified;
        return { url: proxyImageUrl(pathname) };
      } catch (err) {
        console.error(
          "[uploadRecommendationImageToBlob] private put failed:",
          err,
        );
        return { error: uploadErrorMessage(err) };
      }
    }
  } catch (err) {
    console.error("[uploadRecommendationImageToBlob] put failed:", err);
    return { error: uploadErrorMessage(err) };
  }
}
