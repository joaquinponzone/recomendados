import "server-only";

import { del } from "@vercel/blob";

const BLOB_PUBLIC_HOST_SUFFIX = ".public.blob.vercel-storage.com";
const RECOMMENDATIONS_PATH_PREFIX = "/recommendations/";

export function isVercelBlobRecommendationImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith(BLOB_PUBLIC_HOST_SUFFIX)) return false;
    if (!u.pathname.startsWith(RECOMMENDATIONS_PATH_PREFIX)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * When Blob is private, we store `/api/recommendation-blob?pathname=...` in the DB.
 */
export function pathnameFromRecommendationBlobProxyUrl(
  imageUrl: string,
): string | null {
  const trimmed = imageUrl.trim();
  if (!trimmed.startsWith("/api/recommendation-blob")) return null;
  try {
    const u = new URL(trimmed, "http://placeholder.local");
    const pathname = u.searchParams.get("pathname");
    if (!pathname?.startsWith("recommendations/")) return null;
    if (pathname.includes("..") || pathname.includes("\\")) return null;
    return pathname;
  } catch {
    return null;
  }
}

export async function deleteRecommendationBlobIfApplicable(
  imageUrl: string | null | undefined,
): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token?.trim()) return;
  if (imageUrl == null || !String(imageUrl).trim()) return;

  const fromProxy = pathnameFromRecommendationBlobProxyUrl(imageUrl);
  const target =
    fromProxy ??
    (isVercelBlobRecommendationImageUrl(imageUrl) ? imageUrl : null);
  if (!target) return;

  try {
    await del(target, { token });
  } catch (err) {
    console.error("[recommendation-blob] del failed:", err);
  }
}
