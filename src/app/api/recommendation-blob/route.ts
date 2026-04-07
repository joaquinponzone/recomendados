import { get } from "@vercel/blob";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { type SessionData, sessionOptions } from "@/lib/session";

function isAllowedBlobPathname(pathname: string): boolean {
  if (!pathname.startsWith("recommendations/")) return false;
  if (pathname.includes("..") || pathname.includes("\\")) return false;
  return true;
}

export async function GET(request: NextRequest) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  if (!session.userId) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const pathname = request.nextUrl.searchParams.get("pathname");
  if (!pathname || !isAllowedBlobPathname(pathname)) {
    return new NextResponse("Solicitud inválida", { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return new NextResponse("Blob no configurado", { status: 503 });
  }

  const result = await get(pathname, { access: "private", token });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  return new NextResponse(result.stream, {
    status: 200,
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
